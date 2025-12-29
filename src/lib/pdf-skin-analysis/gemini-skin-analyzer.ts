import { GoogleGenAI, Type } from '@google/genai';
import {
  ComprehensiveSkinAnalysis,
  PDFPageAnalysis,
  DetailedSkinMetrics,
  TreatmentRecommendation,
  SkinConditionDetection,
  SkinRegionAnalysis,
  AgeAnalysis,
  SKIN_CONDITIONS,
  TREATMENT_CATEGORIES,
} from './types';

// Initialize Gemini with gemini-3-pro-preview as specified
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

const MODEL_NAME = 'gemini-3-pro-preview';

// ============================================================
// STRUCTURED OUTPUT SCHEMAS
// ============================================================

const pageAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    pageNumber: { type: Type.INTEGER },
    imageType: {
      type: Type.STRING,
      enum: ['standard', 'uv', 'polarized', 'cross-polarized', 'parallel-polarized', 'enhanced', 'other']
    },
    detectedMode: { type: Type.STRING },
    description: { type: Type.STRING },
    overallCondition: {
      type: Type.STRING,
      enum: ['excellent', 'good', 'moderate', 'needs_attention']
    },
    keyFindings: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    conditions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          condition: { type: Type.STRING },
          koreanName: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          locations: { type: Type.ARRAY, items: { type: Type.STRING } },
          description: { type: Type.STRING },
          suggestedTreatments: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    },
    regionAnalysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          region: { type: Type.STRING },
          koreanName: { type: Type.STRING },
          findings: { type: Type.ARRAY, items: { type: Type.STRING } },
          severity: { type: Type.STRING, enum: ['optimal', 'good', 'moderate', 'focus_area'] },
          score: { type: Type.INTEGER },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    },
    rawMetrics: {
      type: Type.OBJECT,
      properties: {
        moistureLevel: { type: Type.NUMBER },
        oilLevel: { type: Type.NUMBER },
        poreCount: { type: Type.INTEGER },
        wrinkleDepth: { type: Type.NUMBER },
        pigmentationIndex: { type: Type.NUMBER },
        elasticityScore: { type: Type.NUMBER },
        uvDamageIndex: { type: Type.NUMBER },
        additionalNotes: { type: Type.STRING }
      }
    }
  },
  propertyOrdering: ['pageNumber', 'imageType', 'detectedMode', 'description', 'overallCondition', 'keyFindings', 'conditions', 'regionAnalysis', 'rawMetrics']
};

const treatmentSchema = {
  type: Type.OBJECT,
  properties: {
    treatmentId: { type: Type.STRING },
    nameKo: { type: Type.STRING },
    nameEn: { type: Type.STRING },
    category: { type: Type.STRING, enum: ['laser', 'injectable', 'device', 'topical', 'combination'] },
    priority: { type: Type.STRING, enum: ['essential', 'recommended', 'optional'] },
    confidence: { type: Type.NUMBER },
    targetedConditions: { type: Type.ARRAY, items: { type: Type.STRING } },
    expectedOutcome: { type: Type.STRING },
    sessions: { type: Type.INTEGER },
    interval: { type: Type.STRING },
    estimatedCost: {
      type: Type.OBJECT,
      properties: {
        min: { type: Type.INTEGER },
        max: { type: Type.INTEGER },
        currency: { type: Type.STRING }
      }
    },
    reasoning: { type: Type.STRING }
  }
};

const comprehensiveAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    pageAnalyses: {
      type: Type.ARRAY,
      items: pageAnalysisSchema
    },
    detailedMetrics: {
      type: Type.OBJECT,
      properties: {
        texture: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            roughnessIndex: { type: Type.INTEGER },
            uniformityIndex: { type: Type.INTEGER },
            smoothnessGrade: { type: Type.STRING, enum: ['A', 'B', 'C', 'D', 'F'] },
            microTextureQuality: { type: Type.INTEGER }
          }
        },
        pores: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            totalCount: { type: Type.INTEGER },
            density: { type: Type.NUMBER },
            sizeDistribution: {
              type: Type.OBJECT,
              properties: {
                enlarged: { type: Type.INTEGER },
                medium: { type: Type.INTEGER },
                fine: { type: Type.INTEGER }
              }
            },
            problemAreas: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        },
        wrinkles: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            totalCount: { type: Type.INTEGER },
            depthClassification: {
              type: Type.OBJECT,
              properties: {
                deep: { type: Type.INTEGER },
                moderate: { type: Type.INTEGER },
                fine: { type: Type.INTEGER }
              }
            },
            primaryLocations: { type: Type.ARRAY, items: { type: Type.STRING } },
            dynamicVsStatic: {
              type: Type.OBJECT,
              properties: {
                dynamic: { type: Type.INTEGER },
                static: { type: Type.INTEGER }
              }
            }
          }
        },
        pigmentation: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            evenness: { type: Type.INTEGER },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  koreanName: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ['mild', 'moderate', 'noticeable'] },
                  coverage: { type: Type.INTEGER },
                  locations: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            uvDamage: {
              type: Type.OBJECT,
              properties: {
                visible: { type: Type.INTEGER },
                hidden: { type: Type.INTEGER },
                riskLevel: { type: Type.STRING, enum: ['low', 'medium', 'high', 'elevated'] }
              }
            }
          }
        },
        vascular: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            rednessLevel: { type: Type.INTEGER },
            telangiectasia: { type: Type.BOOLEAN },
            rosaceaIndicators: { type: Type.BOOLEAN },
            inflammationLevel: { type: Type.STRING, enum: ['minimal', 'mild', 'moderate', 'elevated'] },
            affectedAreas: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        },
        hydration: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            moistureLevel: { type: Type.INTEGER },
            sebumLevel: { type: Type.INTEGER },
            skinTypeClassification: { type: Type.STRING, enum: ['dry', 'normal', 'oily', 'combination', 'dehydrated-oily'] },
            barrier: {
              type: Type.OBJECT,
              properties: {
                integrity: { type: Type.INTEGER },
                tewl: { type: Type.STRING, enum: ['normal', 'elevated', 'high'] }
              }
            }
          }
        },
        elasticity: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            firmness: { type: Type.INTEGER },
            laxity: {
              type: Type.OBJECT,
              properties: {
                level: { type: Type.STRING, enum: ['minimal', 'mild', 'moderate', 'noticeable'] },
                affectedAreas: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            collagenEstimate: { type: Type.STRING, enum: ['optimal', 'moderate', 'needs_support'] }
          }
        }
      }
    },
    ageAnalysis: {
      type: Type.OBJECT,
      properties: {
        estimatedSkinAge: { type: Type.INTEGER },
        ageDifference: { type: Type.INTEGER },
        agingFactors: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              factor: { type: Type.STRING },
              contribution: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
              description: { type: Type.STRING }
            }
          }
        }
      }
    },
    summary: {
      type: Type.OBJECT,
      properties: {
        overallSkinHealth: { type: Type.INTEGER },
        healthGrade: { type: Type.STRING, enum: ['A', 'B', 'C', 'D', 'F'] },
        primaryConcerns: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              concern: { type: Type.STRING },
              koreanName: { type: Type.STRING },
              severity: { type: Type.STRING, enum: ['mild', 'moderate', 'noticeable'] },
              urgency: { type: Type.STRING, enum: ['priority', 'recommended', 'maintenance'] }
            }
          }
        },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } },
        lifestyleRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    treatmentPlan: {
      type: Type.OBJECT,
      properties: {
        immediate: { type: Type.ARRAY, items: treatmentSchema },
        shortTerm: { type: Type.ARRAY, items: treatmentSchema },
        longTerm: { type: Type.ARRAY, items: treatmentSchema },
        maintenance: { type: Type.ARRAY, items: treatmentSchema },
        totalEstimatedInvestment: {
          type: Type.OBJECT,
          properties: {
            min: { type: Type.INTEGER },
            max: { type: Type.INTEGER },
            currency: { type: Type.STRING }
          }
        }
      }
    },
    aiInsights: {
      type: Type.OBJECT,
      properties: {
        overallAssessment: { type: Type.STRING },
        hiddenConcerns: { type: Type.ARRAY, items: { type: Type.STRING } },
        preventiveAdvice: { type: Type.ARRAY, items: { type: Type.STRING } },
        urgentAttention: { type: Type.ARRAY, items: { type: Type.STRING } },
        positiveFindings: { type: Type.ARRAY, items: { type: Type.STRING } },
        customizedProtocol: { type: Type.STRING }
      }
    }
  },
  propertyOrdering: ['pageAnalyses', 'detailedMetrics', 'ageAnalysis', 'summary', 'treatmentPlan', 'aiInsights']
};

// ============================================================
// COMPREHENSIVE SKIN ANALYSIS SYSTEM PROMPT
// ============================================================

const SKIN_ANALYSIS_SYSTEM_PROMPT = `당신은 피부과 및 미용 클리닉의 최고 전문가 AI입니다.
피부 분석 이미지를 바탕으로 상세하고 전문적인 피부 분석을 제공합니다.

## 분석 기준

### 1. 이미지 유형 식별
- Standard Photo (일반 사진): 육안으로 보이는 피부 상태
- UV Photo (UV 사진): 숨겨진 UV 손상, 미래 색소침착 예측
- Cross-Polarized (교차편광): 피부 내부 구조, 혈관, 깊은 색소
- Parallel-Polarized (평행편광): 표면 질감, 피지, 모공
- Enhanced View (강조 뷰): 특정 피부 문제 강조

### 2. 피부 상태 분석 영역
- 모공: 크기, 밀도, 분포 (확대모공/중간모공/미세모공)
- 주름: 깊이, 유형, 위치 (깊은주름/중간주름/잔주름)
- 색소침착: 기미, 잡티, UV손상, 색소불균일
- 혈관: 홍조, 모세혈관확장, 염증
- 피부결: 거칠기, 균일도, 매끄러움
- 수분/피지: 유수분 밸런스, 피부타입
- 탄력: 처짐, 탄력도, 콜라겐 상태

### 3. 점수 체계 (70-100)
- 95-100: 최상 상태 (Grade A+)
- 90-94: 우수 (Grade A)
- 85-89: 양호 (Grade B+)
- 80-84: 좋음 (Grade B)
- 75-79: 관리 권장 (Grade C)
- 70-74: 집중 관리 권장 (Grade C-)
모든 점수는 최소 70점 이상으로 설정합니다.

### 4. 시술 추천 기준
- 색소침착 score > 50: Pico Toning, Laser Toning 권장
- UV손상 hidden > visible: 예방적 레이저 토닝 강력 권장
- 깊은주름 > 10개: Ultherapy, Thermage, 보톡스/필러 권장
- 확대모공 비율 > 30%: Fraxel, Skin Botox 권장
- 홍조 심각: Genesis, Excel V 권장
- 탄력 저하: HIFU (울쎄라/슈링크), 스컬트라 권장

### 5. 우선순위 분류
- priority: 우선 관리 권장 (적극적 개선 기회)
- recommended: 1-3개월 내 권장 (효과적인 개선 가능)
- maintenance: 정기 관리 (유지/예방)

응답은 반드시 유효한 JSON 형식으로 제공하세요.`;

// ============================================================
// PAGE ANALYSIS PROMPT
// ============================================================

const getPageAnalysisPrompt = (pageNumber: number, totalPages: number) => `
이 이미지는 피부 분석 리포트의 ${totalPages}페이지 중 ${pageNumber}번째 페이지입니다.

이미지를 철저히 분석하여 다음 JSON 형식으로 응답하세요:

{
  "pageNumber": ${pageNumber},
  "imageType": "standard|uv|polarized|cross-polarized|parallel-polarized|enhanced|other",
  "detectedMode": "이미지에서 감지된 분석 모드 설명",
  "description": "이 페이지에 보이는 내용의 상세 설명 (한국어)",
  "keyFindings": [
    "핵심 발견 1",
    "핵심 발견 2",
    "핵심 발견 3"
  ],
  "conditions": [
    {
      "condition": "영어 상태명",
      "koreanName": "한국어 상태명",
      "confidence": 0.0-1.0,
      "locations": ["위치1", "위치2"],
      "description": "상세 설명",
      "suggestedTreatments": ["시술1", "시술2"]
    }
  ],
  "regionAnalysis": [
    {
      "region": "영어 부위명",
      "koreanName": "한국어 부위명",
      "findings": ["발견1", "발견2"],
      "severity": "optimal|good|moderate|focus_area",
      "score": 70-100,
      "recommendations": ["권장사항1"]
    }
  ],
  "rawMetrics": {
    "이미지에서 읽은 수치 데이터": "값"
  }
}

주의사항:
- 이미지에 보이는 모든 수치, 그래프, 텍스트를 정확히 읽어주세요
- 피부 상태에 대한 전문적인 분석을 제공하세요
- 발견된 모든 문제점과 강점을 기록하세요
- 각 영역별로 상세한 분석을 제공하세요`;

// ============================================================
// COMPREHENSIVE ANALYSIS PROMPT
// ============================================================

const getComprehensiveAnalysisPrompt = (pageAnalyses: PDFPageAnalysis[]) => `
모든 페이지의 분석 결과를 종합하여 포괄적인 피부 분석 리포트를 생성하세요.

개별 페이지 분석 결과:
${JSON.stringify(pageAnalyses, null, 2)}

위 데이터를 기반으로 다음 JSON 형식의 종합 분석을 제공하세요:

{
  "detailedMetrics": {
    "texture": {
      "overallScore": 70-100,
      "roughnessIndex": 70-100,
      "uniformityIndex": 70-100,
      "smoothnessGrade": "A|B|C",
      "microTextureQuality": 70-100
    },
    "pores": {
      "overallScore": 0-100,
      "totalCount": number,
      "density": number,
      "sizeDistribution": {
        "enlarged": number,
        "medium": number,
        "fine": number
      },
      "problemAreas": ["영역1", "영역2"]
    },
    "wrinkles": {
      "overallScore": 0-100,
      "totalCount": number,
      "depthClassification": {
        "deep": number,
        "moderate": number,
        "fine": number
      },
      "primaryLocations": ["위치1", "위치2"],
      "dynamicVsStatic": {
        "dynamic": number,
        "static": number
      }
    },
    "pigmentation": {
      "overallScore": 0-100,
      "evenness": 0-100,
      "issues": [
        {
          "type": "영어명",
          "koreanName": "한국어명",
          "severity": "mild|moderate|noticeable",
          "coverage": 70-100,
          "locations": ["위치"]
        }
      ],
      "uvDamage": {
        "visible": number,
        "hidden": number,
        "riskLevel": "low|medium|high|elevated"
      }
    },
    "vascular": {
      "overallScore": 0-100,
      "rednessLevel": 0-100,
      "telangiectasia": boolean,
      "rosaceaIndicators": boolean,
      "inflammationLevel": "minimal|mild|moderate|elevated",
      "affectedAreas": ["영역1"]
    },
    "hydration": {
      "overallScore": 0-100,
      "moistureLevel": 0-100,
      "sebumLevel": 0-100,
      "skinTypeClassification": "dry|normal|oily|combination|dehydrated-oily",
      "barrier": {
        "integrity": 0-100,
        "tewl": "normal|elevated|high"
      }
    },
    "elasticity": {
      "overallScore": 0-100,
      "firmness": 0-100,
      "laxity": {
        "level": "minimal|mild|moderate|noticeable",
        "affectedAreas": ["영역1"]
      },
      "collagenEstimate": "optimal|moderate|needs_support"
    }
  },
  "ageAnalysis": {
    "estimatedSkinAge": number,
    "ageDifference": number,
    "agingFactors": [
      {
        "factor": "요인명",
        "contribution": "low|medium|high",
        "description": "설명"
      }
    ]
  },
  "summary": {
    "overallSkinHealth": 0-100,
    "healthGrade": "A|B|C|D|F",
    "primaryConcerns": [
      {
        "concern": "영어명",
        "koreanName": "한국어명",
        "severity": "mild|moderate|noticeable",
        "urgency": "priority|recommended|maintenance"
      }
    ],
    "strengths": ["강점1", "강점2"],
    "areasForImprovement": ["개선점1", "개선점2"],
    "lifestyleRecommendations": ["생활습관 권장1", "생활습관 권장2"]
  },
  "treatmentPlan": {
    "immediate": [/* 즉시 시술 추천 */],
    "shortTerm": [/* 1-3개월 내 시술 */],
    "longTerm": [/* 3-12개월 시술 */],
    "maintenance": [/* 유지 관리 시술 */],
    "totalEstimatedInvestment": {
      "min": number,
      "max": number,
      "currency": "KRW"
    }
  },
  "aiInsights": {
    "overallAssessment": "종합 평가 (2-3문장)",
    "hiddenConcerns": ["숨겨진 문제1", "숨겨진 문제2"],
    "preventiveAdvice": ["예방 조언1", "예방 조언2"],
    "urgentAttention": ["긴급 주의사항"],
    "positiveFindings": ["긍정적 발견1"],
    "customizedProtocol": "맞춤형 관리 프로토콜 설명"
  }
}

시술 추천 시 각 항목은 다음 형식을 따르세요:
{
  "treatmentId": "시술ID",
  "nameKo": "한국어명",
  "nameEn": "영어명",
  "category": "laser|injectable|device|topical|combination",
  "priority": "essential|recommended|optional",
  "confidence": 0.0-1.0,
  "targetedConditions": ["대상증상1", "대상증상2"],
  "expectedOutcome": "예상 결과",
  "sessions": number,
  "interval": "시술 간격",
  "estimatedCost": {
    "min": number,
    "max": number,
    "currency": "KRW"
  },
  "reasoning": "추천 이유 (Meta-Vu 데이터 기반)"
}`;

// ============================================================
// MAIN ANALYSIS FUNCTIONS
// ============================================================

/**
 * Analyze a single page image with structured output
 */
export async function analyzePageImage(
  imageBase64: string,
  pageNumber: number,
  totalPages: number,
  mimeType: string = 'image/png'
): Promise<PDFPageAnalysis> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: 'user',
          parts: [
            { text: SKIN_ANALYSIS_SYSTEM_PROMPT },
            { text: getPageAnalysisPrompt(pageNumber, totalPages) },
            {
              inlineData: {
                mimeType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
      config: {
        temperature: 0.3,
        maxOutputTokens: 4000,
        responseMimeType: 'application/json',
        responseSchema: pageAnalysisSchema,
      },
    });

    // With structured output, response.text is guaranteed to be valid JSON
    const responseText = response.text || '{}';
    return JSON.parse(responseText) as PDFPageAnalysis;
  } catch (error) {
    console.error(`Error analyzing page ${pageNumber}:`, error);

    // Return a default analysis if parsing fails
    return {
      pageNumber,
      imageType: 'other',
      detectedMode: 'Unable to detect',
      description: 'Analysis could not be completed for this page',
      overallCondition: 'fair',
      keyFindings: [],
      conditions: [],
      regionAnalysis: [],
      rawMetrics: {},
    };
  }
}

/**
 * Analyze multiple page images and generate comprehensive analysis
 */
export async function analyzeAllPages(
  pageImages: { imageBase64: string; pageNumber: number; mimeType?: string }[]
): Promise<PDFPageAnalysis[]> {
  const analyses: PDFPageAnalysis[] = [];
  const totalPages = pageImages.length;

  for (const page of pageImages) {
    console.log(`Analyzing page ${page.pageNumber} of ${totalPages}...`);
    const analysis = await analyzePageImage(
      page.imageBase64,
      page.pageNumber,
      totalPages,
      page.mimeType || 'image/png'
    );
    analyses.push(analysis);
  }

  return analyses;
}

/**
 * Generate comprehensive skin analysis from page analyses with structured output
 */
export async function generateComprehensiveAnalysis(
  pageAnalyses: PDFPageAnalysis[],
  sourceFile: string
): Promise<ComprehensiveSkinAnalysis> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: 'user',
          parts: [
            { text: SKIN_ANALYSIS_SYSTEM_PROMPT },
            { text: getComprehensiveAnalysisPrompt(pageAnalyses) },
          ],
        },
      ],
      config: {
        temperature: 0.4,
        maxOutputTokens: 8000,
        responseMimeType: 'application/json',
        responseSchema: comprehensiveAnalysisSchema,
      },
    });

    // With structured output, response.text is guaranteed to be valid JSON
    const responseText = response.text || '{}';
    const result = JSON.parse(responseText);

    return {
      id: `analysis-${Date.now()}`,
      analyzedAt: new Date().toISOString(),
      sourceFile,
      totalPages: pageAnalyses.length,
      pageAnalyses,
      detailedMetrics: result.detailedMetrics || createDefaultMetrics(),
      ageAnalysis: result.ageAnalysis || createDefaultAgeAnalysis(),
      summary: result.summary || createDefaultSummary(),
      treatmentPlan: result.treatmentPlan || createDefaultTreatmentPlan(),
      aiInsights: result.aiInsights || createDefaultAIInsights(),
    };
  } catch (error) {
    console.error('Error generating comprehensive analysis:', error);
    throw error;
  }
}

/**
 * Analyze PDF directly using Gemini's PDF support with structured output
 * Processes all pages as images, extracting data from pictures, graphs, and tables
 */
export async function analyzePDFDirectly(
  pdfBase64: string,
  fileName: string
): Promise<ComprehensiveSkinAnalysis> {
  try {
    console.log('Starting direct PDF analysis with Gemini gemini-3-pro-preview using structured output...');
    console.log('Processing PDF as images to extract pictures, graphs, and tables from ALL pages...');

    // Use structured output with responseSchema for guaranteed valid JSON
    const overviewResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: 'user',
          parts: [
            { text: SKIN_ANALYSIS_SYSTEM_PROMPT },
            {
              text: `이 PDF는 피부 분석 리포트입니다. **모든 페이지(14페이지 전체)**를 분석하세요.

## 중요: 이미지 기반 분석
각 페이지에는 다음이 포함되어 있습니다:
- **피부 사진**: 얼굴 이미지, UV 사진, 편광 사진 등
- **그래프**: 피부 지표를 나타내는 차트, 막대 그래프, 원형 차트
- **표**: 수치 데이터, 점수, 비교표
- **텍스트**: 분석 결과, 설명, 권장사항

## 분석 요청사항

### 1. 페이지별 분석 (pageAnalyses - 모든 14페이지)
각 페이지마다 반드시 다음을 분석하세요:
- 이미지 유형 (standard, uv, polarized, cross-polarized, parallel-polarized, enhanced, other)
- 그래프에서 읽은 수치 데이터
- 표에서 읽은 점수 및 측정값
- 발견된 피부 상태
- 해당 페이지의 전체적인 상태 평가

### 2. 종합 피부 건강 지표 (detailedMetrics)
모든 페이지의 데이터를 종합하여:
- 피부결 (texture): 거칠기, 균일도, 매끄러움
- 모공 (pores): 개수, 밀도, 크기 분포
- 주름 (wrinkles): 깊은주름/중간주름/잔주름 개수
- 색소 (pigmentation): 기미, UV손상, 균일도
- 혈관/홍조 (vascular): 홍조 수준, 염증
- 수분 (hydration): 수분도, 피지도, 피부타입
- 탄력 (elasticity): 탄력도, 처짐, 콜라겐 상태

### 3. 나이 분석 (ageAnalysis)
- 추정 피부 나이
- 노화 요인 분석

### 4. 요약 (summary)
- 종합 건강 점수 (0-100)
- 등급 (A/B/C/D/F)
- 주요 문제점 및 강점
- 생활습관 권장사항

### 5. 치료 계획 (treatmentPlan)
- 즉시 시술 (immediate)
- 단기 시술 1-3개월 (shortTerm)
- 장기 시술 3-12개월 (longTerm)
- 유지 관리 (maintenance)

### 6. AI 인사이트 (aiInsights)
- 종합 평가
- 숨겨진 문제 (UV사진에서 발견된 잠재적 문제)
- 예방 조언
- 긴급 주의사항
- 긍정적 발견

## 주의사항
- 모든 수치, 그래프, 이미지에서 읽을 수 있는 정보를 최대한 추출하세요
- **점수는 반드시 70-100 범위**로 설정하세요. 70이 "개선 필요", 100이 "최상" 상태입니다
- 한국어로 설명을 제공하되, 시술명은 영어와 한국어를 병기하세요
- 각 페이지의 이미지 유형을 정확히 식별하세요

## 언어 톤 가이드라인 (매우 중요)
- **긍정적이고 건설적인 표현 사용**: 부정적인 단어를 피하세요
- 사용 금지 단어: "나쁨", "poor", "bad", "critical", "severe", "심각", "위험", "문제", "악화"
- 대신 사용할 표현:
  - "개선 여지가 있음" 대신 "나쁨"
  - "집중 관리 필요" 대신 "심각함"
  - "관심이 필요한 부분" 대신 "문제점"
  - "향상 가능성이 높음" 대신 "낮은 점수"
  - "관리 우선순위" 대신 "긴급"
- 전반적으로 환자에게 희망적이고 동기부여가 되는 톤을 유지하세요
- 모든 상태는 개선 가능하다는 관점에서 설명하세요`
            },
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: pdfBase64,
              },
            },
          ],
        },
      ],
      config: {
        temperature: 0.3,
        maxOutputTokens: 32000,
        responseMimeType: 'application/json',
        responseSchema: comprehensiveAnalysisSchema,
      },
    });

    // With structured output, response.text is guaranteed to be valid JSON
    const responseText = overviewResponse.text || '{}';
    const result = JSON.parse(responseText);

    console.log(`Analysis complete. Found ${result.pageAnalyses?.length || 0} pages.`);

    // Ensure proper structure with defaults for any missing fields
    return {
      id: `analysis-${Date.now()}`,
      analyzedAt: new Date().toISOString(),
      sourceFile: fileName,
      totalPages: result.pageAnalyses?.length || 1,
      pageAnalyses: result.pageAnalyses || [],
      detailedMetrics: result.detailedMetrics || createDefaultMetrics(),
      ageAnalysis: result.ageAnalysis || createDefaultAgeAnalysis(),
      summary: result.summary || createDefaultSummary(),
      treatmentPlan: result.treatmentPlan || createDefaultTreatmentPlan(),
      aiInsights: result.aiInsights || createDefaultAIInsights(),
    };
  } catch (error) {
    console.error('Error in direct PDF analysis:', error);
    throw error;
  }
}

/**
 * Stream analysis updates for real-time UI feedback
 */
export async function* streamAnalysis(
  pdfBase64: string,
  fileName: string
): AsyncGenerator<{ type: string; data: unknown }> {
  yield { type: 'start', data: { fileName, startedAt: new Date().toISOString() } };

  try {
    yield { type: 'status', data: { message: 'PDF 분석을 시작합니다...' } };

    const response = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents: [
        {
          role: 'user',
          parts: [
            { text: SKIN_ANALYSIS_SYSTEM_PROMPT },
            {
              text: `이 PDF 피부 분석 리포트를 상세히 분석하세요.
              분석하면서 발견하는 내용을 단계별로 설명해주세요.
              마지막에 종합 JSON 결과를 제공하세요.`
            },
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: pdfBase64,
              },
            },
          ],
        },
      ],
      config: {
        temperature: 0.3,
        maxOutputTokens: 16000,
      },
    });

    let fullText = '';
    for await (const chunk of response) {
      if (chunk.text) {
        fullText += chunk.text;
        yield { type: 'chunk', data: { text: chunk.text } };
      }
    }

    // Extract JSON from the complete response
    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      yield {
        type: 'complete',
        data: {
          id: `analysis-${Date.now()}`,
          analyzedAt: new Date().toISOString(),
          sourceFile: fileName,
          ...result,
        }
      };
    }

  } catch (error) {
    yield { type: 'error', data: { message: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

// ============================================================
// DEFAULT VALUE GENERATORS
// ============================================================

function createDefaultMetrics(): DetailedSkinMetrics {
  return {
    texture: {
      overallScore: 50,
      roughnessIndex: 50,
      uniformityIndex: 50,
      smoothnessGrade: 'C',
      microTextureQuality: 50,
    },
    pores: {
      overallScore: 50,
      totalCount: 0,
      density: 0,
      sizeDistribution: { enlarged: 0, medium: 0, fine: 0 },
      problemAreas: [],
    },
    wrinkles: {
      overallScore: 50,
      totalCount: 0,
      depthClassification: { deep: 0, moderate: 0, fine: 0 },
      primaryLocations: [],
      dynamicVsStatic: { dynamic: 0, static: 0 },
    },
    pigmentation: {
      overallScore: 50,
      evenness: 50,
      issues: [],
      uvDamage: { visible: 0, hidden: 0, riskLevel: 'low' },
    },
    vascular: {
      overallScore: 50,
      rednessLevel: 50,
      telangiectasia: false,
      rosaceaIndicators: false,
      inflammationLevel: 'minimal',
      affectedAreas: [],
    },
    hydration: {
      overallScore: 50,
      moistureLevel: 50,
      sebumLevel: 50,
      skinTypeClassification: 'normal',
      barrier: { integrity: 50, tewl: 'normal' },
    },
    elasticity: {
      overallScore: 50,
      firmness: 50,
      laxity: { level: 'minimal', affectedAreas: [] },
      collagenEstimate: 'optimal',
    },
  };
}

function createDefaultAgeAnalysis(): AgeAnalysis {
  return {
    estimatedSkinAge: 30,
    ageDifference: 0,
    agingFactors: [],
  };
}

function createDefaultSummary() {
  return {
    overallSkinHealth: 50,
    healthGrade: 'C' as const,
    primaryConcerns: [],
    strengths: [],
    areasForImprovement: [],
    lifestyleRecommendations: [],
  };
}

function createDefaultTreatmentPlan() {
  return {
    immediate: [],
    shortTerm: [],
    longTerm: [],
    maintenance: [],
    totalEstimatedInvestment: { min: 0, max: 0, currency: 'KRW' },
  };
}

function createDefaultAIInsights() {
  return {
    overallAssessment: '분석을 완료할 수 없습니다.',
    hiddenConcerns: [],
    preventiveAdvice: [],
    urgentAttention: [],
    positiveFindings: [],
    customizedProtocol: '',
  };
}

// Export types for use in components
export type { ComprehensiveSkinAnalysis, PDFPageAnalysis, TreatmentRecommendation };
