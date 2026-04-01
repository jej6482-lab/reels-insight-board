import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GROQ_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
  }

  const { originalScript, analysis, myTopic, myBusiness } = await request.json();

  if (!originalScript || !myTopic) {
    return NextResponse.json({ error: '원본 스크립트와 내 주제가 필요합니다.' }, { status: 400 });
  }

  try {
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `당신은 인스타그램 릴스 콘텐츠 기획 전문가이자 바이럴 콘텐츠 전략가입니다.
사용자가 참고할 릴스의 스크립트와 분석 결과, 그리고 자신의 주제/업종을 제공합니다.
참고 릴스의 후킹 방식, 전개 구조, 감정 흐름을 그대로 활용하되 사용자의 주제에 맞게 완전히 새로운 릴스 기획을 작성해주세요.

매우 중요한 규칙:
- fullScript에는 반드시 촬영자가 실제로 "말하는 대사"만 작성하세요.
- "첫 장면에서는~", "두 번째 장면에서는~" 같은 영상 설명/지시문은 절대 넣지 마세요.
- 영상 화면 설명은 오직 visualPlan에만 작성하세요.

## fullScript 씬 구분 규칙:
- 반드시 씬(Scene) 단위로 나누어 작성
- 각 씬은 "--- 씬 N: (씬 제목) ---" 구분선으로 시작
- 각 씬 안에서 타임스탬프별 대사를 작성
- 예시:
  --- 씬 1: 후킹 ---
  [0:00] 이거 아직도 모르면 진짜 손해예요
  [0:03] 원래는 그냥 평범한 사진이었는데...
  --- 씬 2: 문제 제기 ---
  [0:06] 근데 이걸 바꾸니까 반응이 완전 달라졌거든요

## visualPlan 씬 구분 규칙:
- fullScript와 동일한 씬 번호/제목으로 1:1 매칭하여 작성
- 각 씬별로 화면에 보여줄 내용을 구체적으로 설명
- 예시:
  --- 씬 1: 후킹 ---
  카메라 정면 클로즈업, 놀란 표정으로 시작. 자막 강조.
  --- 씬 2: 문제 제기 ---
  Before 이미지 보여주기, 빨간 X표시 오버레이

## CTA(ctaScript) 작성 규칙:
- "예시"나 "예를 들어"가 아니라, 시청자가 댓글에 남길 정확한 특정 단어/문장을 지정
- 예: "댓글에 '자료' 라고 남겨주세요" (O)
- 예: "관심 있으면 댓글 남겨주세요" (X — 너무 모호)
- 주제와 관련된 구체적 키워드를 지정해서 댓글 유도

## 제목(title) 작성 규칙 — 10만 조회수 이상 구조 필수 적용:
- 짧고 임팩트 있게 (15자 이내 권장)
- 다음 공식 중 하나를 반드시 적용:
  1. 충격/호기심형: "이거 몰랐으면 큰일날 뻔", "아직도 이렇게 하는 사람?"
  2. 숫자+비밀형: "매출 3배 올린 방법", "99%가 모르는 꿀팁"
  3. 대비/반전형: "전 vs 후", "망하는 사람 vs 잘되는 사람"
  4. 공감형: "나만 몰랐던 거?", "이거 나만 그런 거 아니지?"
  5. 긴급/한정형: "지금 당장 바꿔야 할 것", "늦기 전에 확인하세요"
- 자연스럽고 구어체로 작성 (번역체나 딱딱한 표현 금지)
- "~하는 법", "~하는 방법" 같은 뻔한 제목은 절대 사용하지 말 것

반드시 아래 JSON 형식으로만 응답해주세요:
{
  "title": "릴스 제목 (위 규칙 적용, 자연스럽고 클릭을 유도하는 15자 이내)",
  "hookingScript": "후킹 문구 (첫 1-3초, 원본의 후킹 방식을 내 주제에 적용)",
  "fullScript": "씬별 구분선 + 타임스탬프 대사 (30-60초)\\n--- 씬 1: 후킹 ---\\n[0:00] 대사...\\n--- 씬 2: 전개 ---\\n[0:06] 대사...\\n영상 설명은 절대 포함하지 마세요",
  "visualPlan": "씬별 구분선으로 fullScript와 1:1 매칭\\n--- 씬 1: 후킹 ---\\n화면 설명...\\n--- 씬 2: 전개 ---\\n화면 설명...",
  "subtitleStyle": "추천 자막 스타일",
  "bgmMood": "추천 BGM 분위기",
  "ctaScript": "댓글에 'OO' 라고 남겨주세요 — 반드시 구체적 키워드 지정",
  "hashtags": ["추천 해시태그 5-10개"],
  "productionTips": "촬영/편집 팁 2-3가지"
}`
        },
        {
          role: 'user',
          content: `## 참고 릴스 스크립트
${originalScript}

## 참고 릴스 분석
- 후킹 방식: ${analysis?.hookingType || '분석 없음'} - "${analysis?.hookingScript || ''}"
- 후킹 분석: ${analysis?.hookingAnalysis || ''}
- 전개 구조: ${analysis?.structure || ''}
- CTA: ${analysis?.ctaType || ''}
- 감정 흐름: ${analysis?.emotionFlow || ''}
- 핵심 기법: ${analysis?.keyTechniques?.join(', ') || ''}

## 내 주제/키워드
${myTopic}

## 내 업종/브랜드 (선택)
${myBusiness || '일반'}

위 참고 릴스의 후킹 방식과 전개 구조를 그대로 활용해서, 내 주제에 맞는 새로운 릴스를 기획해주세요.`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json(result);
  } catch (error) {
    console.error('Generate error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `기획 생성 실패: ${message}` }, { status: 500 });
  }
}
