// Comprehensive PDF Skin Analysis Types for Medspa

export interface PDFPageImage {
  pageNumber: number;
  imageData: string; // Base64 encoded PNG
  width: number;
  height: number;
}

export interface SkinRegionAnalysis {
  region: string;
  koreanName: string;
  findings: string[];
  severity: 'normal' | 'mild' | 'moderate' | 'severe';
  score: number; // 0-100, 100 being healthiest
  recommendations: string[];
}

export interface SkinConditionDetection {
  condition: string;
  koreanName: string;
  confidence: number; // 0-1
  locations: string[];
  description: string;
  suggestedTreatments: string[];
}

export interface AgeAnalysis {
  estimatedSkinAge: number;
  actualAge?: number;
  ageDifference: number;
  agingFactors: {
    factor: string;
    contribution: 'low' | 'medium' | 'high';
    description: string;
  }[];
}

export interface TreatmentRecommendation {
  treatmentId: string;
  nameKo: string;
  nameEn: string;
  category: 'laser' | 'injectable' | 'device' | 'topical' | 'combination';
  priority: 'essential' | 'recommended' | 'optional';
  confidence: number;
  targetedConditions: string[];
  expectedOutcome: string;
  sessions: number;
  interval: string;
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
  };
  reasoning: string;
}

export interface DetailedSkinMetrics {
  // Texture Analysis
  texture: {
    overallScore: number;
    roughnessIndex: number;
    uniformityIndex: number;
    smoothnessGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    microTextureQuality: number;
  };

  // Pore Analysis
  pores: {
    overallScore: number;
    totalCount: number;
    density: number; // per cm²
    sizeDistribution: {
      enlarged: number;
      medium: number;
      fine: number;
    };
    problemAreas: string[];
  };

  // Wrinkle Analysis
  wrinkles: {
    overallScore: number;
    totalCount: number;
    depthClassification: {
      deep: number;
      moderate: number;
      fine: number;
    };
    primaryLocations: string[];
    dynamicVsStatic: {
      dynamic: number;
      static: number;
    };
  };

  // Pigmentation Analysis
  pigmentation: {
    overallScore: number;
    evenness: number;
    issues: {
      type: string;
      koreanName: string;
      severity: 'mild' | 'moderate' | 'severe';
      coverage: number; // percentage
      locations: string[];
    }[];
    uvDamage: {
      visible: number;
      hidden: number;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
    };
  };

  // Vascular Analysis
  vascular: {
    overallScore: number;
    rednessLevel: number;
    telangiectasia: boolean;
    rosaceaIndicators: boolean;
    inflammationLevel: 'none' | 'mild' | 'moderate' | 'severe';
    affectedAreas: string[];
  };

  // Hydration & Oil Balance
  hydration: {
    overallScore: number;
    moistureLevel: number;
    sebumLevel: number;
    skinTypeClassification: 'dry' | 'normal' | 'oily' | 'combination' | 'dehydrated-oily';
    barrier: {
      integrity: number;
      tewl: 'normal' | 'elevated' | 'high'; // Trans-Epidermal Water Loss
    };
  };

  // Elasticity & Firmness
  elasticity: {
    overallScore: number;
    firmness: number;
    laxity: {
      level: 'none' | 'mild' | 'moderate' | 'severe';
      affectedAreas: string[];
    };
    collagenEstimate: 'adequate' | 'declining' | 'depleted';
  };
}

export interface PDFPageAnalysis {
  pageNumber: number;
  imageType: 'standard' | 'uv' | 'polarized' | 'cross-polarized' | 'parallel-polarized' | 'enhanced' | 'other';
  detectedMode: string;
  description: string;
  keyFindings: string[];
  conditions: SkinConditionDetection[];
  regionAnalysis: SkinRegionAnalysis[];
  rawMetrics: Record<string, number | string>;
}

export interface ComprehensiveSkinAnalysis {
  id: string;
  analyzedAt: string;
  sourceFile: string;
  totalPages: number;

  // Patient Demographics (if detected)
  patient?: {
    estimatedAge?: number;
    gender?: 'male' | 'female' | 'unknown';
    skinType?: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
  };

  // Per-page analysis
  pageAnalyses: PDFPageAnalysis[];

  // Aggregated detailed metrics
  detailedMetrics: DetailedSkinMetrics;

  // Age analysis
  ageAnalysis: AgeAnalysis;

  // Overall summary
  summary: {
    overallSkinHealth: number; // 0-100
    healthGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    primaryConcerns: {
      concern: string;
      koreanName: string;
      severity: 'mild' | 'moderate' | 'severe';
      urgency: 'immediate' | 'soon' | 'routine';
    }[];
    strengths: string[];
    areasForImprovement: string[];
    lifestyleRecommendations: string[];
  };

  // Treatment recommendations
  treatmentPlan: {
    immediate: TreatmentRecommendation[];
    shortTerm: TreatmentRecommendation[]; // 1-3 months
    longTerm: TreatmentRecommendation[]; // 3-12 months
    maintenance: TreatmentRecommendation[];
    totalEstimatedInvestment: {
      min: number;
      max: number;
      currency: string;
    };
  };

  // Comparison data
  comparison?: {
    percentileRank: number; // Among similar age/gender
    comparedToAgeGroup: string;
    betterThanPercentage: number;
  };

  // AI Insights
  aiInsights: {
    overallAssessment: string;
    hiddenConcerns: string[];
    preventiveAdvice: string[];
    urgentAttention: string[];
    positiveFindings: string[];
    customizedProtocol: string;
  };
}

// Zone mapping for facial analysis
export const FACIAL_ZONES = {
  forehead: { ko: '이마', en: 'Forehead' },
  glabella: { ko: '미간', en: 'Glabella' },
  leftTemple: { ko: '왼쪽 관자놀이', en: 'Left Temple' },
  rightTemple: { ko: '오른쪽 관자놀이', en: 'Right Temple' },
  leftPeriorbital: { ko: '왼쪽 눈가', en: 'Left Periorbital' },
  rightPeriorbital: { ko: '오른쪽 눈가', en: 'Right Periorbital' },
  leftUpperCheek: { ko: '왼쪽 상부볼', en: 'Left Upper Cheek' },
  rightUpperCheek: { ko: '오른쪽 상부볼', en: 'Right Upper Cheek' },
  leftLowerCheek: { ko: '왼쪽 하부볼', en: 'Left Lower Cheek' },
  rightLowerCheek: { ko: '오른쪽 하부볼', en: 'Right Lower Cheek' },
  nose: { ko: '코', en: 'Nose' },
  leftNasolabial: { ko: '왼쪽 팔자', en: 'Left Nasolabial' },
  rightNasolabial: { ko: '오른쪽 팔자', en: 'Right Nasolabial' },
  upperLip: { ko: '윗입술', en: 'Upper Lip' },
  lowerLip: { ko: '아랫입술', en: 'Lower Lip' },
  chin: { ko: '턱', en: 'Chin' },
  jawlineLeft: { ko: '왼쪽 턱선', en: 'Left Jawline' },
  jawlineRight: { ko: '오른쪽 턱선', en: 'Right Jawline' },
  neck: { ko: '목', en: 'Neck' },
} as const;

// Skin conditions mapping
export const SKIN_CONDITIONS = {
  melasma: { ko: '기미', en: 'Melasma' },
  freckles: { ko: '주근깨', en: 'Freckles' },
  sunSpots: { ko: '잡티', en: 'Sun Spots' },
  acneScars: { ko: '여드름 흉터', en: 'Acne Scars' },
  activeAcne: { ko: '활성 여드름', en: 'Active Acne' },
  rosacea: { ko: '주사', en: 'Rosacea' },
  telangiectasia: { ko: '모세혈관 확장', en: 'Telangiectasia' },
  seborrhea: { ko: '지루', en: 'Seborrhea' },
  dehydration: { ko: '수분 부족', en: 'Dehydration' },
  enlargedPores: { ko: '모공 확대', en: 'Enlarged Pores' },
  fineLines: { ko: '잔주름', en: 'Fine Lines' },
  deepWrinkles: { ko: '깊은 주름', en: 'Deep Wrinkles' },
  sagging: { ko: '피부 처짐', en: 'Skin Sagging' },
  lossOfElasticity: { ko: '탄력 저하', en: 'Loss of Elasticity' },
  unevenTone: { ko: '피부톤 불균일', en: 'Uneven Skin Tone' },
  dullness: { ko: '칙칙함', en: 'Dullness' },
  sensitiveReactive: { ko: '민감/반응성', en: 'Sensitive/Reactive Skin' },
  hyperpigmentation: { ko: '색소 침착', en: 'Hyperpigmentation' },
  undereye: { ko: '다크서클', en: 'Under-eye Circles' },
  textureIrregularity: { ko: '피부결 불규칙', en: 'Texture Irregularity' },
} as const;

// Treatment categories with Korean names
export const TREATMENT_CATEGORIES = {
  laser: {
    ko: '레이저 시술',
    en: 'Laser Treatment',
    treatments: [
      { id: 'pico-toning', ko: '피코토닝', en: 'Pico Toning' },
      { id: 'pico-laser', ko: '피코레이저', en: 'Pico Laser' },
      { id: 'genesis', ko: '제네시스', en: 'Genesis' },
      { id: 'fraxel', ko: '프락셀', en: 'Fraxel' },
      { id: 'co2-laser', ko: 'CO2 레이저', en: 'CO2 Laser' },
      { id: 'excel-v', ko: '엑셀브이', en: 'Excel V' },
      { id: 'ipl', ko: 'IPL', en: 'IPL' },
      { id: 'q-switch', ko: 'Q스위치', en: 'Q-Switch' },
    ],
  },
  injectable: {
    ko: '주사 시술',
    en: 'Injectable Treatment',
    treatments: [
      { id: 'botox', ko: '보톡스', en: 'Botox' },
      { id: 'filler', ko: '필러', en: 'Filler' },
      { id: 'rejuran', ko: '리쥬란', en: 'Rejuran' },
      { id: 'skin-botox', ko: '스킨보톡스', en: 'Skin Botox' },
      { id: 'hydra-boost', ko: '물광주사', en: 'Hydra Boost' },
      { id: 'sculptra', ko: '스컬트라', en: 'Sculptra' },
      { id: 'dermotoxin', ko: '더모톡신', en: 'Dermotoxin' },
      { id: 'prp', ko: 'PRP', en: 'PRP' },
    ],
  },
  device: {
    ko: '기기 시술',
    en: 'Device Treatment',
    treatments: [
      { id: 'ultherapy', ko: '울쎄라', en: 'Ultherapy' },
      { id: 'thermage', ko: '써마지', en: 'Thermage' },
      { id: 'shurink', ko: '슈링크', en: 'Shurink' },
      { id: 'inmode', ko: '인모드', en: 'InMode' },
      { id: 'aqua-peel', ko: '아쿠아필', en: 'Aqua Peel' },
      { id: 'microneedling', ko: '마이크로니들링', en: 'Microneedling' },
      { id: 'rf-therapy', ko: 'RF 테라피', en: 'RF Therapy' },
    ],
  },
  combination: {
    ko: '복합 시술',
    en: 'Combination Treatment',
    treatments: [
      { id: 'skin-booster-combo', ko: '스킨부스터 콤보', en: 'Skin Booster Combo' },
      { id: 'anti-aging-protocol', ko: '안티에이징 프로토콜', en: 'Anti-aging Protocol' },
      { id: 'brightening-package', ko: '브라이트닝 패키지', en: 'Brightening Package' },
    ],
  },
} as const;
