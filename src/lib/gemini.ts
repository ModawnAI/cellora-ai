import { GoogleGenAI } from '@google/genai';
import {
  MetaVuSkinAnalysis,
  Treatment,
  RecommendedTreatment,
  MetaVuZone,
} from './types';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

// ============================================================
// META-VU 3D ENHANCED AI SYSTEM PROMPT
// ============================================================

const SYSTEM_PROMPT = `당신은 피부과/미용 클리닉의 AI 치료 추천 전문가입니다.
Meta-Vu 3D 피부 분석 기기의 상세 데이터를 바탕으로 최적의 시술을 추천하는 역할을 합니다.

## Meta-Vu 3D 분석 데이터 이해

Meta-Vu 3D는 다음과 같은 상세 분석을 제공합니다:

### 1. 모공 분석 (Pore Analysis)
- 총 모공 수, 밀도(cm² 당)
- 크기별 분류: 확대모공(large), 중간모공(medium), 미세모공(small)
- **확대모공 비율이 높을수록 심각** → 프락셀 레이저, 화학적 박피 권장

### 2. 주름 분석 (Wrinkle Analysis)
- 총 주름 수, 밀도
- 깊이별 분류: 깊은주름(deep), 중간주름(intermediate), 잔주름(light)
- **깊은주름은 보톡스/필러 필요**, 잔주름은 토피컬/레이저토닝으로 가능

### 3. 색소침착 분석 (Pigmentation Analysis)
- 갈색반점(brownSpots): 현재 보이는 색소
- UV손상(uvSpots): **보이지 않는 미래 색소** - 매우 중요!
- **UV손상이 갈색반점의 1.5배 이상이면 예방 치료 강력 권장**

### 4. 혈관/홍조 분석 (Vascular Analysis)
- 붉은 반점 수, 면적, 밀도
- 민감성 피부 여부 판단에 중요

### 5. 피부결 분석 (Texture Analysis)
- 거칠기(roughness), 균일도(uniformity)

### 6. 피지/수분 분석
- 피지 레벨 및 분포(uniform/tzone/patchy)
- 수분 레벨 및 분포(uniform/dry-patches/mixed)

### 7. 13개 존(Zone) 분석
이마, 미간, 좌우 눈가, 좌우 상/하부볼, 코, 좌우 팔자, 윗입술, 턱

### 8. 연령 비교 데이터
- 동일 연령대 대비 백분위
- 피부 나이 vs 실제 나이

## 추천 규칙

### 색소침착 우선순위
1. brownSpots > 30 AND uvSpots > brownSpots * 1.5 → **예방적 Pico Toning 강력 권장**
2. brownSpots > 40 → Laser Toning, Pico Toning
3. 눈가/윗입술 색소 → 저강도 시술 필수

### 주름 우선순위
1. deep > 15 → Ultherapy, Thermage, 필러
2. 미간(glabella) deep > 3 → 보톡스 우선
3. 팔자(nasolabial) deep > 5 → 필러 or Thread Lift
4. intermediate > 30 → 중강도 레이저
5. light only → 토피컬, 저강도 레이저

### 모공 우선순위
1. large > 400 → Fractional Laser, 화학적 박피
2. large/total ratio > 0.3 → 집중 모공 치료
3. 코(nose) 집중 → Skin Botox, Aqua Peel

### 홍조/민감성
1. redSpots > 50 → Genesis 레이저 우선
2. redness score > 60 + moisture score > 50 → 보습 + 저자극 시술

### 피부 나이 분석
- skinAgeDifference > +5 → 안티에이징 시술 집중
- skinAgeDifference < -3 → 유지 관리 위주

## 응답 형식
- 모든 응답은 반드시 유효한 JSON 형식
- 한국어로 설명, 시술명은 영어 표기
- 근거 기반 추천, 신뢰도 0-1
- **uvDamageWarning**: UV 손상 경고 (필수 포함)
- **targetedZones**: 타겟 존 명시
- **preventiveRecommendations**: 예방적 권고사항`;

// ============================================================
// TYPE DEFINITIONS
// ============================================================

interface GenerateRecommendationInput {
  analysis: MetaVuSkinAnalysis;
  patientAge: number;
  skinType: string;
  concerns: string[];
  allergies: string[];
  medicalHistory: string[];
  availableTreatments: Treatment[];
}

interface MetaVuRecommendationResult {
  primaryTreatment: RecommendedTreatment;
  secondaryTreatments: RecommendedTreatment[];
  contraindications: string[];
  expectedOutcome: string;
  aiReasoning: string;
  confidence: number;
  metaVuInsights: {
    uvDamageWarning?: string;
    wrinkleDepthAnalysis?: string;
    poreTypeStrategy?: string;
    preventiveRecommendations?: string[];
    skinAgeAnalysis?: string;
  };
}

// ============================================================
// MAIN RECOMMENDATION FUNCTION
// ============================================================

export async function generateTreatmentRecommendation(
  input: GenerateRecommendationInput
): Promise<MetaVuRecommendationResult> {
  const { analysis, patientAge, skinType, concerns, allergies, medicalHistory, availableTreatments } = input;

  const { metaVuScores, metaVuZones, ageComparison, summary } = analysis;

  // Build detailed prompt with Meta-Vu data
  const prompt = `
## 환자 정보
- 나이: ${patientAge}세 (피부나이: ${ageComparison.skinAge}세, 차이: ${ageComparison.skinAgeDifference > 0 ? '+' : ''}${ageComparison.skinAgeDifference}세)
- 피부 타입: ${skinType}
- 주요 고민: ${concerns.join(', ')}
- 알레르기: ${allergies.length > 0 ? allergies.join(', ') : '없음'}
- 병력: ${medicalHistory.length > 0 ? medicalHistory.join(', ') : '없음'}

## Meta-Vu 3D 상세 분석 결과

### 모공 분석
- 총 모공 수: ${metaVuScores.pores.totalCount}개
- 밀도: ${metaVuScores.pores.density}/cm²
- 확대모공: ${metaVuScores.pores.large}개 (${Math.round(metaVuScores.pores.large / metaVuScores.pores.totalCount * 100)}%)
- 중간모공: ${metaVuScores.pores.medium}개
- 미세모공: ${metaVuScores.pores.small}개
- 모공 점수: ${metaVuScores.pores.score}/100

### 주름 분석
- 총 주름 수: ${metaVuScores.wrinkles.totalCount}개
- 깊은주름: ${metaVuScores.wrinkles.deep}개 ⚠️
- 중간주름: ${metaVuScores.wrinkles.intermediate}개
- 잔주름: ${metaVuScores.wrinkles.light}개
- 주름 점수: ${metaVuScores.wrinkles.score}/100

### 색소침착 분석
- 갈색반점: ${metaVuScores.pigmentation.brownSpots.count}개 (면적: ${metaVuScores.pigmentation.brownSpots.area}mm²)
- **UV손상 (미래색소)**: ${metaVuScores.pigmentation.uvSpots.count}개 (면적: ${metaVuScores.pigmentation.uvSpots.area}mm²) ⚠️
- UV/갈색 비율: ${(metaVuScores.pigmentation.uvSpots.count / Math.max(1, metaVuScores.pigmentation.brownSpots.count)).toFixed(2)}배
- 색소 점수: ${metaVuScores.pigmentation.score}/100

### 혈관/홍조 분석
- 붉은 반점: ${metaVuScores.vascular.redSpots.count}개
- 홍조 점수: ${metaVuScores.vascular.score}/100

### 피부결/피지/수분
- 거칠기: ${metaVuScores.texture.roughness}/100
- 균일도: ${metaVuScores.texture.uniformity}/100
- 피지: ${metaVuScores.sebum.level}/100 (${metaVuScores.sebum.distribution})
- 수분: ${metaVuScores.moisture.level}/100 (${metaVuScores.moisture.distribution})

### 주요 문제 존(Zone)
${Object.entries(metaVuZones)
  .filter(([, z]) => z.severity === 'high' || z.severity === 'critical')
  .map(([zone, z]) => `- ${z.label} (${zone}): ${z.primaryConcern} - ${z.severity}`)
  .join('\n') || '- 심각한 문제 존 없음'}

### 연령 비교 (${ageComparison.ageGroup}세 ${ageComparison.sampleSize}명 기준)
- 종합 백분위: ${ageComparison.overallPercentile}% (상위 ${100 - ageComparison.overallPercentile}%)
- 모공: ${ageComparison.metrics.pores.percentile}%
- 주름: ${ageComparison.metrics.wrinkles.percentile}%
- 색소침착: ${ageComparison.metrics.pigmentation.percentile}%

### AI 분석 요약
${summary.topConcerns.map(c => `- ${c.concern} (${c.severity}): ${c.recommendation}`).join('\n')}

### 예방적 주의사항
${summary.preventiveConcerns.map(c => `- ${c.concern} (${c.riskLevel}): ${c.description}`).join('\n') || '- 특별한 예방 사항 없음'}

## 이용 가능한 시술 목록
${availableTreatments.map(t => `- ${t.id}: ${t.nameEn} (${t.nameKo}) - ${t.indications.slice(0, 3).join(', ')}`).join('\n')}

## 요청
위 Meta-Vu 3D 분석 결과를 바탕으로 최적의 치료 계획을 JSON 형식으로 제공해주세요.

특히 다음 사항을 반드시 포함하세요:
1. **UV 손상 경고**: UV/갈색 비율이 1.5 이상이면 강력 경고
2. **주름 깊이 분석**: 깊은주름 vs 잔주름 비율에 따른 전략
3. **모공 타입 전략**: 확대모공 비율에 따른 접근법
4. **예방적 권고**: 미래 문제 예방을 위한 조언
5. **피부나이 분석**: 실제 나이 대비 피부 상태 평가

응답 JSON 형식:
{
  "primaryTreatment": {
    "treatmentId": "시술 ID",
    "nameKo": "한국어명",
    "nameEn": "영어명",
    "sessions": 추천 회수,
    "interval": "시술 간격",
    "intensity": "저강도/중강도/고강도",
    "rationale": "추천 이유 (Meta-Vu 데이터 기반, 2-3문장)",
    "confidence": 0.0-1.0,
    "targetedMetrics": [
      {"metric": "지표명", "currentValue": 현재값, "expectedImprovement": 예상개선율}
    ],
    "targetedZones": ["타겟 존 목록"]
  },
  "secondaryTreatments": [...],
  "contraindications": ["주의사항 목록"],
  "expectedOutcome": "예상 결과 (1-2문장)",
  "aiReasoning": "AI 추론 과정 (Meta-Vu 데이터 기반, 3-4문장)",
  "confidence": 0.0-1.0,
  "metaVuInsights": {
    "uvDamageWarning": "UV 손상 경고 메시지 (필수)",
    "wrinkleDepthAnalysis": "주름 깊이 분석",
    "poreTypeStrategy": "모공 타입별 전략",
    "preventiveRecommendations": ["예방 권고 목록"],
    "skinAgeAnalysis": "피부나이 분석"
  }
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT + '\n\n' + prompt }],
        },
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 3000,
      },
    });

    const text = response.text || '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const result = JSON.parse(jsonMatch[0]);
    return result;
  } catch (error) {
    console.error('Gemini API error:', error);

    // Return fallback recommendation based on Meta-Vu analysis
    return generateFallbackRecommendation(input);
  }
}

// ============================================================
// FALLBACK RECOMMENDATION (When API unavailable)
// ============================================================

function generateFallbackRecommendation(input: GenerateRecommendationInput): MetaVuRecommendationResult {
  const { analysis, availableTreatments } = input;
  const { metaVuScores, ageComparison } = analysis;

  // Determine primary concern and treatment based on Meta-Vu data
  let primaryTreatmentId = 'T001'; // Default: Pico Toning
  let primaryRationale = '';
  let targetedMetrics: RecommendedTreatment['targetedMetrics'] = [];
  let targetedZones: MetaVuZone[] = [];

  // UV Damage Warning
  const uvRatio = metaVuScores.pigmentation.uvSpots.count / Math.max(1, metaVuScores.pigmentation.brownSpots.count);
  let uvDamageWarning = '';

  if (uvRatio > 2) {
    uvDamageWarning = `⚠️ 심각한 UV 손상 감지: 보이지 않는 UV 손상(${metaVuScores.pigmentation.uvSpots.count}개)이 현재 갈색반점의 ${uvRatio.toFixed(1)}배입니다. 예방적 치료를 강력히 권장합니다.`;
  } else if (uvRatio > 1.5) {
    uvDamageWarning = `⚠️ UV 손상 주의: UV 손상(${metaVuScores.pigmentation.uvSpots.count}개)이 현재 갈색반점보다 많습니다. 향후 색소침착 위험이 있습니다.`;
  } else {
    uvDamageWarning = 'UV 손상 수준이 정상 범위 내입니다.';
  }

  // Decision logic based on Meta-Vu scores
  if (uvRatio > 1.5 || metaVuScores.pigmentation.score > 70) {
    primaryTreatmentId = 'T001'; // Pico Toning
    primaryRationale = `UV 손상 ${metaVuScores.pigmentation.uvSpots.count}개가 감지되어 예방적 피코토닝을 권장합니다. 현재 갈색반점 ${metaVuScores.pigmentation.brownSpots.count}개와 함께 집중 관리가 필요합니다.`;
    targetedMetrics = [
      { metric: '갈색반점', currentValue: metaVuScores.pigmentation.brownSpots.count, expectedImprovement: 40 },
      { metric: 'UV손상', currentValue: metaVuScores.pigmentation.uvSpots.count, expectedImprovement: 30 },
    ];
    targetedZones = ['leftUpperCheek', 'rightUpperCheek', 'forehead'];
  } else if (metaVuScores.wrinkles.deep > 15 || metaVuScores.elasticityInferred > 60) {
    primaryTreatmentId = 'T002'; // Ultherapy
    primaryRationale = `깊은주름이 ${metaVuScores.wrinkles.deep}개로 집중 치료가 필요합니다. 피부 탄력 저하(${metaVuScores.elasticityInferred}/100)와 함께 리프팅 시술을 권장합니다.`;
    targetedMetrics = [
      { metric: '깊은주름', currentValue: metaVuScores.wrinkles.deep, expectedImprovement: 35 },
      { metric: '탄력', currentValue: 100 - metaVuScores.elasticityInferred, expectedImprovement: 25 },
    ];
    targetedZones = ['leftNasolabial', 'rightNasolabial', 'chin'];
  } else if (metaVuScores.pores.large > 400 || (metaVuScores.pores.large / metaVuScores.pores.totalCount) > 0.3) {
    primaryTreatmentId = 'T010'; // Skin Botox
    primaryRationale = `확대모공이 ${metaVuScores.pores.large}개(${Math.round(metaVuScores.pores.large / metaVuScores.pores.totalCount * 100)}%)로 모공 집중 치료가 필요합니다.`;
    targetedMetrics = [
      { metric: '확대모공', currentValue: metaVuScores.pores.large, expectedImprovement: 30 },
    ];
    targetedZones = ['nose', 'leftLowerCheek', 'rightLowerCheek'];
  } else if (metaVuScores.vascular.score > 60) {
    primaryTreatmentId = 'T008'; // Genesis
    primaryRationale = `홍조 점수가 ${metaVuScores.vascular.score}/100으로 높아 제네시스 레이저를 권장합니다. 붉은 반점 ${metaVuScores.vascular.redSpots.count}개 개선이 기대됩니다.`;
    targetedMetrics = [
      { metric: '붉은반점', currentValue: metaVuScores.vascular.redSpots.count, expectedImprovement: 40 },
    ];
    targetedZones = ['leftUpperCheek', 'rightUpperCheek'];
  } else {
    primaryRationale = '종합적인 피부 개선을 위한 시술입니다.';
  }

  const primary = availableTreatments.find(t => t.id === primaryTreatmentId) || availableTreatments[0];

  // Generate wrinkle depth analysis
  const wrinkleDepthAnalysis = metaVuScores.wrinkles.deep > 10
    ? `깊은주름(${metaVuScores.wrinkles.deep}개)이 전체의 ${Math.round(metaVuScores.wrinkles.deep / metaVuScores.wrinkles.totalCount * 100)}%를 차지합니다. 보톡스/필러 등 침습적 시술이 효과적입니다.`
    : `깊은주름이 ${metaVuScores.wrinkles.deep}개로 관리 가능한 수준입니다. 잔주름(${metaVuScores.wrinkles.light}개) 중심의 토피컬/레이저 관리를 권장합니다.`;

  // Generate pore type strategy
  const largeRatio = metaVuScores.pores.large / metaVuScores.pores.totalCount;
  const poreTypeStrategy = largeRatio > 0.25
    ? `확대모공 비율이 ${Math.round(largeRatio * 100)}%로 높아 프락셀 레이저 또는 화학적 박피가 필요합니다.`
    : `확대모공 비율이 ${Math.round(largeRatio * 100)}%로 적당합니다. 정기적인 모공 관리로 유지하세요.`;

  // Generate skin age analysis
  const skinAgeAnalysis = ageComparison.skinAgeDifference > 5
    ? `피부나이가 실제 나이보다 ${ageComparison.skinAgeDifference}세 높습니다. 집중적인 안티에이징 관리가 필요합니다.`
    : ageComparison.skinAgeDifference < -3
    ? `피부나이가 실제 나이보다 ${Math.abs(ageComparison.skinAgeDifference)}세 젊습니다. 현재 관리를 유지하세요.`
    : `피부나이와 실제 나이가 비슷합니다. 균형 잡힌 관리를 권장합니다.`;

  // Preventive recommendations
  const preventiveRecommendations: string[] = [];
  if (uvRatio > 1.2) {
    preventiveRecommendations.push('자외선 차단제 SPF 50+ 매일 사용 필수');
    preventiveRecommendations.push('정기적인 피코토닝으로 UV 손상 예방');
  }
  if (metaVuScores.moisture.score > 50) {
    preventiveRecommendations.push('보습 강화 - 히알루론산 세럼 사용 권장');
  }
  if (metaVuScores.wrinkles.deep < 5 && metaVuScores.wrinkles.intermediate > 20) {
    preventiveRecommendations.push('중간주름이 깊어지기 전 예방적 보톡스 고려');
  }

  return {
    primaryTreatment: {
      treatmentId: primary.id,
      nameKo: primary.nameKo,
      nameEn: primary.nameEn,
      sessions: primary.typicalSessions.min + Math.floor((primary.typicalSessions.max - primary.typicalSessions.min) / 2),
      interval: `${Math.floor(primary.intervalDays.min / 7)}주`,
      intensity: metaVuScores.vascular.score > 60 ? '저강도' : '중강도',
      rationale: primaryRationale,
      confidence: 0.8,
      targetedMetrics,
      targetedZones,
    },
    secondaryTreatments: [],
    contraindications: input.allergies.length > 0 ? [`${input.allergies.join(', ')} 알레르기 주의`] : [],
    expectedOutcome: '4-8주 후 Meta-Vu 3D 재분석 시 개선 효과 확인 가능',
    aiReasoning: `Meta-Vu 3D 분석 결과, ${analysis.summary.topConcerns[0]?.concern || '피부 상태'} 개선이 가장 시급합니다. ${primaryRationale} 환자의 피부나이는 ${ageComparison.skinAge}세로, ${skinAgeAnalysis}`,
    confidence: 0.8,
    metaVuInsights: {
      uvDamageWarning,
      wrinkleDepthAnalysis,
      poreTypeStrategy,
      preventiveRecommendations,
      skinAgeAnalysis,
    },
  };
}

// ============================================================
// STREAMING RECOMMENDATION
// ============================================================

export async function streamRecommendation(
  input: GenerateRecommendationInput,
  onChunk: (text: string) => void
): Promise<void> {
  const { analysis, patientAge, skinType, concerns, allergies } = input;
  const { metaVuScores, ageComparison } = analysis;

  const prompt = `
## Meta-Vu 3D 분석 기반 실시간 추천

환자: ${patientAge}세 (피부나이: ${ageComparison.skinAge}세), 피부타입 ${skinType}
고민: ${concerns.join(', ')}
${allergies.length > 0 ? `알레르기: ${allergies.join(', ')}` : ''}

### Meta-Vu 3D 핵심 지표
- 모공: 총 ${metaVuScores.pores.totalCount}개 (확대모공 ${metaVuScores.pores.large}개)
- 주름: 총 ${metaVuScores.wrinkles.totalCount}개 (깊은주름 ${metaVuScores.wrinkles.deep}개)
- 색소: 갈색반점 ${metaVuScores.pigmentation.brownSpots.count}개, UV손상 ${metaVuScores.pigmentation.uvSpots.count}개
- 홍조: ${metaVuScores.vascular.redSpots.count}개 붉은반점

위 데이터를 기반으로 추천 시술과 그 이유를 한국어로 자연스럽게 설명해주세요.
특히 UV 손상에 대한 경고와 예방적 권고사항을 포함해주세요.`;

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-flash-latest',
      contents: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT + '\n\n' + prompt }],
        },
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      },
    });

    for await (const chunk of response) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error('Gemini streaming error:', error);
    onChunk('추천 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  }
}

// ============================================================
// ANALYSIS SUMMARY GENERATOR
// ============================================================

export async function generateAnalysisSummary(
  analysis: MetaVuSkinAnalysis
): Promise<string> {
  const { metaVuScores, ageComparison, summary } = analysis;

  const prompt = `
다음 Meta-Vu 3D 피부 분석 결과를 바탕으로 환자에게 설명할 수 있는 2-3문장의 한국어 요약을 작성해주세요.

- 모공: ${metaVuScores.pores.totalCount}개 (확대 ${metaVuScores.pores.large}, 중간 ${metaVuScores.pores.medium}, 미세 ${metaVuScores.pores.small})
- 주름: ${metaVuScores.wrinkles.totalCount}개 (깊은 ${metaVuScores.wrinkles.deep}, 중간 ${metaVuScores.wrinkles.intermediate}, 잔 ${metaVuScores.wrinkles.light})
- 색소: 갈색반점 ${metaVuScores.pigmentation.brownSpots.count}개, UV손상 ${metaVuScores.pigmentation.uvSpots.count}개
- 홍조: ${metaVuScores.vascular.score}/100
- 피부나이: ${ageComparison.skinAge}세 (실제 ${ageComparison.actualAge}세)
- 주요 문제: ${summary.topConcerns.map(c => c.concern).join(', ') || '특별한 문제 없음'}

친절하고 전문적인 톤으로 작성해주세요.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.6, maxOutputTokens: 300 },
    });

    return response.text || summary.skinTypeAnalysis;
  } catch (error) {
    console.error('Summary generation error:', error);
    return summary.skinTypeAnalysis;
  }
}
