import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

const SYSTEM_PROMPT = `당신은 Cellora AI의 피부과/미용 클리닉 전문 어시스턴트입니다.
원장님(의료진)이 환자의 Meta-Vu 3D 피부 분석 결과를 검토하고 최적의 시술 계획을 수립하는 것을 돕습니다.

## 중요: 사용자 구분
- 질문하는 사람: 원장님 (의료 전문가)
- 분석 데이터: 환자의 피부 분석 결과
- 따라서 "환자분은...", "해당 환자의 경우..." 등으로 환자를 3인칭으로 지칭

## 역할 및 목표
- 원장님의 진료 의사결정을 지원하는 임상 정보 제공
- Meta-Vu 3D 분석 데이터의 임상적 해석
- 시술 프로토콜, 금기사항, 병행 시술 가능 여부 안내
- 예상 치료 결과 및 주의사항 설명

## 소통 스타일
- 전문적이고 간결한 임상 용어 사용
- 원장님께 정보를 제공하는 톤 (존댓말 사용)
- 데이터 기반의 객관적 분석 제공
- 답변은 2-4문장으로 핵심 정보 전달
- 한국어로 답변

## 제공 가능한 정보
- 시술 프로토콜 상세 (회수, 간격, 강도)
- 금기사항 및 주의점 (알레르기, 병력 고려)
- 병행 시술 가능 여부 및 시너지 효과
- 예상 치료 기간 및 결과
- 시술 후 관리 방법

## Meta-Vu 3D 데이터 해석 가이드

### 점수 해석 (0-100, 높을수록 문제가 심각)
- 0-30: 양호 (유지 관리)
- 31-55: 경증 (예방적 시술 권장)
- 56-75: 중등도 (적극적 시술 필요)
- 76-100: 중증 (집중 치료 필요)

### UV 손상 비율 (uvSpots/brownSpots)
- 1.0 미만: 정상 범위
- 1.0-1.5: 예방적 관리 권장
- 1.5 이상: 적극적 색소 치료 필요

### 피부 나이 차이
- -3세 이하: 피부 상태 우수
- ±3세: 정상 범위
- +5세 이상: 안티에이징 시술 적극 권장`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  context: string;
  history: ChatMessage[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, context, history } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build conversation history for context
    const conversationHistory = history.map((msg) => ({
      role: (msg.role === 'assistant' ? 'model' : msg.role) as 'user' | 'model',
      parts: [{ text: msg.content }],
    }));

    // Create the prompt with context
    const fullPrompt = `${SYSTEM_PROMPT}

## 현재 검토 중인 환자의 피부 분석 데이터
${context}

## 이전 대화 내용
${history.length > 0 ? history.map(m => `${m.role === 'user' ? '원장님' : 'AI'}: ${m.content}`).join('\n') : '(첫 대화)'}

## 원장님 질문
${message}

위 환자 데이터를 바탕으로 원장님의 질문에 전문적이고 간결하게 답변해주세요.`;

    const response = await ai.models.generateContentStream({
      model: 'gemini-flash-latest',
      contents: [
        {
          role: 'user',
          parts: [{ text: fullPrompt }],
        },
      ],
      config: {
        thinkingConfig: {
          thinkingBudget: -1,
        },
      },
    });

    // Collect streaming response
    let text = '';
    for await (const chunk of response) {
      if (chunk.text) {
        text += chunk.text;
      }
    }

    if (!text) {
      return NextResponse.json(
        { response: '죄송합니다. 응답을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 200 }
      );
    }

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { response: `오류가 발생했습니다: ${errorMessage}. API 키를 확인해주세요.` },
      { status: 200 }
    );
  }
}
