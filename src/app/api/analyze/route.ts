import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { unlink, readFile, writeFile, chmod } from 'fs/promises';
import { existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import Groq from 'groq-sdk';

export const maxDuration = 60; // Vercel Hobby(무료) 최대값

const execFileAsync = promisify(execFile);

function getFfmpegPath(): string {
  // 1) env override
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  // 2) ffmpeg-static npm package (works on Vercel)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const p = require('ffmpeg-static') as string;
    if (p) return p;
  } catch { /* ignore */ }
  // 3) fallback
  return 'ffmpeg';
}

async function getYtDlpPath(): Promise<string> {
  // 1) env override (local dev)
  if (process.env.YT_DLP_PATH && existsSync(process.env.YT_DLP_PATH)) {
    return process.env.YT_DLP_PATH;
  }
  // 2) Download standalone yt-dlp binary to /tmp for serverless
  const binPath = join(tmpdir(), 'yt-dlp');
  if (existsSync(binPath)) return binPath;

  // Must use standalone binary (not Python script) for Vercel (no python3)
  const isLinux = process.platform === 'linux';
  const downloadUrl = isLinux
    ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux'
    : 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos';

  console.log(`Downloading yt-dlp standalone binary for ${process.platform}...`);
  const res = await fetch(downloadUrl, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Failed to download yt-dlp: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(binPath, buf);
  await chmod(binPath, 0o755);
  console.log(`yt-dlp downloaded to ${binPath} (${buf.length} bytes)`);
  return binPath;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GROQ_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
  }

  const { url } = await request.json();
  if (!url) {
    return NextResponse.json({ error: 'URL이 필요합니다.' }, { status: 400 });
  }

  const tmpDir = tmpdir();
  const ts = Date.now();
  const audioPath = join(tmpDir, `reel_${ts}.mp3`);

  try {
    const [ytdlp, ffmpeg] = await Promise.all([getYtDlpPath(), getFfmpegPath()]);

    // 1. Download audio only with yt-dlp (skip video = much faster)
    await execFileAsync(ytdlp, [
      '-f', 'worstaudio/worst',
      '-x', '--audio-format', 'mp3',
      '--audio-quality', '9',
      '-o', audioPath.replace('.mp3', '.%(ext)s'),
      '--no-playlist',
      '--max-filesize', '20m',
      '--ffmpeg-location', ffmpeg,
      '--socket-timeout', '15',
      url,
    ], { timeout: 30000 });

    // 2. If yt-dlp extracted to different ext, convert with ffmpeg
    const possibleExts = ['.mp3', '.m4a', '.webm', '.opus', '.ogg'];
    let actualAudioPath = audioPath;
    for (const ext of possibleExts) {
      const p = audioPath.replace('.mp3', ext);
      if (existsSync(p)) { actualAudioPath = p; break; }
    }

    if (actualAudioPath !== audioPath) {
      await execFileAsync(ffmpeg, [
        '-i', actualAudioPath,
        '-acodec', 'libmp3lame',
        '-ab', '64k',
        '-ar', '16000',
        '-y',
        audioPath,
      ], { timeout: 15000 });
      await unlink(actualAudioPath).catch(() => {});
    }

    // 3. Transcribe with Groq Whisper
    const groq = new Groq({ apiKey });
    const audioBuffer = await readFile(audioPath);
    const audioFile = new File([audioBuffer], 'audio.mp3', { type: 'audio/mpeg' });

    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3',
      language: 'ko',
      response_format: 'verbose_json',
    });

    const segments = (transcription as unknown as { segments?: Array<{ start: number; end: number; text: string }> }).segments || [];
    const timestampedScript = segments.map((seg) => {
      const m = Math.floor(seg.start / 60);
      const s = Math.floor(seg.start % 60);
      return `[${m}:${s.toString().padStart(2, '0')}] ${seg.text.trim()}`;
    }).join('\n');

    const fullScript = transcription.text;

    // 4. Analyze with Llama
    const analysis = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `당신은 인스타그램 릴스 콘텐츠 분석 전문가입니다.
릴스의 스크립트를 보고 다음을 분석해주세요. 각 항목은 반드시 한국어로, 구체적이고 실용적으로 작성해주세요.

반드시 아래 JSON 형식으로만 응답해주세요:
{
  "hookingType": "후킹 방식 유형 (예: 충격적 질문형, 공감 유발형, 반전 제시형 등)",
  "hookingScript": "실제 사용된 후킹 문구 (첫 1-3초)",
  "hookingAnalysis": "왜 이 후킹이 효과적인지 2-3줄 분석",
  "structure": "영상 전개 구조 (도입-전개-결론 등 단계별 설명)",
  "ctaType": "CTA 방식 (없으면 '없음')",
  "emotionFlow": "시청자의 감정 흐름 (어떤 감정을 거쳐가는지)",
  "targetAudience": "추정 타겟 시청자",
  "keyTechniques": ["사용된 핵심 콘텐츠 기법 3-5개"],
  "summary": "이 릴스의 핵심 성공 포인트 2-3줄 요약"
}`
        },
        {
          role: 'user',
          content: `다음 릴스 스크립트를 분석해주세요:\n\n${fullScript}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const analysisResult = JSON.parse(analysis.choices[0].message.content || '{}');

    // Cleanup
    await unlink(audioPath).catch(() => {});

    return NextResponse.json({
      script: fullScript,
      timestampedScript,
      duration: (transcription as unknown as { duration?: number }).duration || 0,
      analysis: analysisResult,
    });

  } catch (error) {
    await unlink(audioPath).catch(() => {});
    console.error('Analysis error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `분석 실패: ${message}` }, { status: 500 });
  }
}
