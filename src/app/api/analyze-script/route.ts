import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GROQ_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
  }

  const { script } = await request.json();
  if (!script || !script.trim()) {
    return NextResponse.json({ error: '스크립트를 입력해주세요.' }, { status: 400 });
  }

  try {
    const groq = new Groq({ apiKey });

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
          content: `다음 릴스 스크립트를 분석해주세요:\n\n${script.trim()}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const analysisResult = JSON.parse(analysis.choices[0].message.content || '{}');

    return NextResponse.json({
      script: script.trim(),
      timestampedScript: '',
      duration: 0,
      analysis: analysisResult,
    });

  } catch (error) {
    console.error('Script analysis error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `분석 실패: ${message}` }, { status: 500 });
  }
}
