import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

interface SlideContent {
  patientName: string;
  slideType: 'hero' | 'analysis' | 'summary';
  slideNumber?: number;
  totalSlides?: number;
  analysisType?: string;
  score?: number;
  rating?: string;
  details?: Array<{ label: string; value: string | number }>;
  interpretation?: string;
  recommendations?: Array<{
    name: string;
    koreanName: string;
    frequency?: string;
    sessions?: string;
    description?: string;
  }>;
  overallScore?: number;
  grade?: string;
  primaryConcerns?: string[];
  strengths?: string[];
  allAnalysisTypes?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: SlideContent = await request.json();
    const { patientName, slideType, slideNumber, totalSlides, analysisType, score, rating, details, interpretation, recommendations, overallScore, grade, primaryConcerns, strengths, allAnalysisTypes } = body;

    let prompt = '';
    const contextInfo = slideNumber && totalSlides
      ? `현재 ${slideNumber}번째 슬라이드 (총 ${totalSlides}개 중)입니다.`
      : '';
    const analysisContext = allAnalysisTypes?.length
      ? `이 프레젠테이션에서 다루는 분석 항목: ${allAnalysisTypes.join(', ')}`
      : '';

    // TTS formatting instructions for natural speech
    const ttsFormatting = `

TTS 음성 합성을 위한 포맷팅 규칙 (반드시 지켜주세요):
- 모든 문장 끝에 적절한 문장부호(. ? !)를 사용하세요.
- 자연스러운 쉼을 위해 문장 사이에 "-"를 삽입하세요. 예: "안녕하세요, ${patientName}님. - 오늘 피부 분석 결과를 함께 살펴보겠습니다."
- 숫자는 그대로 작성하세요 (예: 68점, 27세).
- 영어 단어는 한글 발음으로 변환하세요 (예: "Pico Toning" → "피코토닝").
- 중요한 내용 앞에는 짧은 쉼(-)을 추가하세요.`;

    if (slideType === 'hero') {
      prompt = `당신은 셀로라 대표 원장 박기범입니다. ${patientName} 환자님의 피부 분석 결과 프레젠테이션을 시작하는 인사말을 작성해주세요.

${contextInfo}
${analysisContext}

전체 피부 건강 점수: ${overallScore}점
등급: ${grade}

다음 조건을 지켜주세요:
- 3-4문장으로 따뜻한 환영 인사
- "안녕하세요, ${patientName}님. - 셀로라 대표 원장 박기범입니다." 로 시작
- 오늘 함께 피부 분석 결과를 살펴볼 것이라고 안내
- 종합 점수와 등급을 자연스럽게 언급
- 앞으로 각 항목별 상세 분석을 살펴볼 것이라고 예고
- 따뜻하고 전문적인 어조 유지
${ttsFormatting}`;
    } else if (slideType === 'analysis') {
      const detailsText = details?.map(d => `${d.label}: ${d.value}`).join(', ') || '';
      const recsText = recommendations?.map(r => `${r.koreanName}(${r.description})`).join(', ') || '';

      prompt = `당신은 셀로라 대표 원장 박기범입니다. ${patientName} 환자님에게 ${analysisType} 결과를 상세히 설명해주세요.

${contextInfo}
${analysisContext}

현재 분석 항목: ${analysisType}
점수: ${score}점
등급: ${rating}
세부 측정값: ${detailsText}
전문가 해석: ${interpretation}
추천 시술: ${recsText}

다음 조건을 지켜주세요:
- 5-7문장으로 충분히 설명
- "이제 ${analysisType}에 대해 설명드리겠습니다." 또는 유사한 문구로 시작
- 점수가 의미하는 바를 환자가 이해하기 쉽게 설명
- 세부 측정값 중 중요한 것들을 구체적으로 언급
- 왜 이 시술들이 효과적인지 근거와 함께 추천
- 다음 분석 항목으로 넘어갈 것을 자연스럽게 예고
- 걱정보다는 해결책과 희망을 강조
${ttsFormatting}`;
    } else if (slideType === 'summary') {
      const concernsText = primaryConcerns?.join(', ') || '';
      const strengthsText = strengths?.join(', ') || '';

      prompt = `당신은 셀로라 대표 원장 박기범입니다. ${patientName} 환자님의 피부 분석 프레젠테이션을 마무리하며 종합 결과를 설명해주세요.

${contextInfo}
${analysisContext}

전체 점수: ${overallScore}점
등급: ${grade}
주요 관심사: ${concernsText}
강점: ${strengthsText}

다음 조건을 지켜주세요:
- 5-6문장으로 종합적인 마무리
- "지금까지 모든 분석 결과를 살펴보았습니다." 와 같이 프레젠테이션 마무리임을 인지
- 강점부터 먼저 칭찬하고 격려
- 개선이 필요한 부분은 해결 가능한 문제로 프레이밍
- 구체적인 다음 단계(상담 예약 등) 안내
- 함께 피부 건강을 개선해 나가자는 희망적 메시지
- "궁금한 점이 있으시면 언제든 말씀해 주세요." 로 마무리
${ttsFormatting}`;
    }

    const response = await genAI.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
    });

    const script = response.text || '';

    return NextResponse.json({ script });
  } catch (error) {
    console.error('Script generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
}
