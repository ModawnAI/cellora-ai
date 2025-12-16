// Cellora AI Type Definitions - Meta-Vu 3D Integration

export type Gender = '남성' | '여성';
export type SkinType = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
export type TreatmentCategory = 'laser' | 'injectable' | 'device' | 'topical' | 'combination';
export type PatientStatus = '분석 대기' | '상담 중' | '완료' | '예약됨';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  skinType: SkinType;
  phoneNumber: string;
  registrationDate: string;
  lastVisit: string;
  primaryConcerns: string[];
  allergies: string[];
  medicalHistory: string[];
  visitCount: number;
  status: PatientStatus;
  profileImage?: string;
}

// ============================================================
// META-VU 3D ANALYSIS DATA STRUCTURES
// ============================================================

// Pore Analysis with size breakdown
export interface MetaVuPoreAnalysis {
  totalCount: number;           // Total pore count
  density: number;              // Pores per cm²
  large: number;                // Large pore count (확대모공)
  medium: number;               // Medium pore count (중간모공)
  small: number;                // Small/fine pore count (미세모공)
  score: number;                // Normalized 0-100 score
}

// Wrinkle Analysis with depth classification
export interface MetaVuWrinkleAnalysis {
  totalCount: number;           // Total wrinkle count
  density: number;              // Wrinkles per cm
  deep: number;                 // Deep wrinkle count (깊은주름)
  intermediate: number;         // Intermediate wrinkle count (중간주름)
  light: number;                // Fine line count (잔주름)
  score: number;                // Normalized 0-100 score
}

// Pigmentation Analysis - separating visible and UV-revealed damage
export interface MetaVuPigmentationAnalysis {
  brownSpots: {
    count: number;              // Visible brown spot count
    area: number;               // Total area in mm²
    density: number;            // Spots per cm²
  };
  uvSpots: {
    count: number;              // Hidden UV damage spots (미래 색소)
    area: number;               // Total area in mm²
    density: number;            // Spots per cm²
  };
  score: number;                // Normalized 0-100 score
}

// Vascular/Redness Analysis
export interface MetaVuVascularAnalysis {
  redSpots: {
    count: number;              // Red spot/vessel count
    area: number;               // Total area in mm²
    density: number;            // Spots per cm²
  };
  score: number;                // Normalized 0-100 score
}

// Texture Analysis
export interface MetaVuTextureAnalysis {
  roughness: number;            // Surface roughness index
  uniformity: number;           // Texture uniformity (0-100, higher = more uniform)
  score: number;                // Normalized 0-100 score
}

// Sebum/Oil Analysis
export interface MetaVuSebumAnalysis {
  level: number;                // Sebum level measurement
  distribution: 'uniform' | 'tzone' | 'patchy';  // Distribution pattern
  score: number;                // Normalized 0-100 score
}

// Moisture/Hydration Analysis
export interface MetaVuMoistureAnalysis {
  level: number;                // Moisture level measurement
  distribution: 'uniform' | 'dry-patches' | 'mixed';  // Distribution pattern
  score: number;                // Normalized 0-100 score (higher = more dehydrated/worse)
}

// Comprehensive Meta-Vu Scores
export interface MetaVuScores {
  pores: MetaVuPoreAnalysis;
  wrinkles: MetaVuWrinkleAnalysis;
  pigmentation: MetaVuPigmentationAnalysis;
  vascular: MetaVuVascularAnalysis;
  texture: MetaVuTextureAnalysis;
  sebum: MetaVuSebumAnalysis;
  moisture: MetaVuMoistureAnalysis;
  // Elasticity is inferred from wrinkle depth ratio
  elasticityInferred: number;   // 0-100 (higher = worse elasticity loss)
}

// Legacy simple scores for backward compatibility
export interface SkinScores {
  pigmentation: number;    // 색소침착
  pores: number;           // 모공
  wrinkles: number;        // 주름
  redness: number;         // 홍조
  sebum: number;           // 피지
  moisture: number;        // 수분
  elasticity: number;      // 탄력
  texture: number;         // 피부결
}

// Meta-Vu 3D Zone Types (13 facial zones)
export type MetaVuZone =
  | 'forehead'           // 이마
  | 'glabella'           // 미간
  | 'leftPeriorbital'    // 왼쪽 눈가
  | 'rightPeriorbital'   // 오른쪽 눈가
  | 'leftUpperCheek'     // 왼쪽 상부볼
  | 'rightUpperCheek'    // 오른쪽 상부볼
  | 'leftLowerCheek'     // 왼쪽 하부볼
  | 'rightLowerCheek'    // 오른쪽 하부볼
  | 'nose'               // 코
  | 'leftNasolabial'     // 왼쪽 팔자
  | 'rightNasolabial'    // 오른쪽 팔자
  | 'upperLip'           // 윗입술
  | 'chin';              // 턱

// Zone Labels for display
export const metaVuZoneLabels: Record<MetaVuZone, { ko: string; en: string }> = {
  forehead: { ko: '이마', en: 'Forehead' },
  glabella: { ko: '미간', en: 'Glabella' },
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
  chin: { ko: '턱', en: 'Chin' },
};

// Zone-specific analysis with granular metrics
export interface MetaVuZoneAnalysis {
  zone: MetaVuZone;
  label: string;                          // Korean label
  pores?: {
    count: number;
    large: number;
    medium: number;
    small: number;
  };
  wrinkles?: {
    count: number;
    deep: number;
    intermediate: number;
    light: number;
  };
  pigmentation?: {
    brownSpots: number;
    uvSpots: number;
  };
  vascular?: {
    redSpots: number;
  };
  sebum?: number;
  moisture?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  primaryConcern: string;                 // Main issue for this zone
}

// Legacy zone analysis for backward compatibility
export interface ZoneAnalysis {
  zone: string;
  scores: Partial<SkinScores>;
  severity: 'low' | 'medium' | 'high';
}

// Age Comparison Data
export interface AgeComparison {
  ageGroup: string;              // e.g., "30-39"
  sampleSize: number;            // Number of people in comparison
  metrics: {
    pores: { percentile: number; average: number; patient: number };
    wrinkles: { percentile: number; average: number; patient: number };
    pigmentation: { percentile: number; average: number; patient: number };
    vascular: { percentile: number; average: number; patient: number };
    texture: { percentile: number; average: number; patient: number };
    sebum: { percentile: number; average: number; patient: number };
    moisture: { percentile: number; average: number; patient: number };
  };
  overallPercentile: number;     // Overall skin condition percentile
  skinAge: number;               // Estimated skin age
  actualAge: number;             // Patient's actual age
  skinAgeDifference: number;     // Skin age - actual age (positive = looks older)
}

// Meta-Vu 3D Image URLs (6 image types)
export interface MetaVuImageUrls {
  standard: string;              // Standard photo
  crossPolarized: string;        // Cross polarized (sub-surface)
  parallelPolarized: string;     // Parallel polarized (surface)
  uv: string;                    // UV fluorescence
  brownSpotsEnhanced: string;    // Brown spots enhanced view
  redSpotsEnhanced: string;      // Red spots/vascular enhanced view
}

// Complete Meta-Vu 3D Skin Analysis
export interface MetaVuSkinAnalysis {
  id: string;
  patientId: string;
  analyzedAt: string;
  deviceInfo: {
    model: string;               // 'Meta-Vu 3D'
    version: string;             // Software version
    calibrationDate: string;     // Last calibration
  };

  // Comprehensive scores with granular data
  metaVuScores: MetaVuScores;

  // Legacy scores for backward compatibility
  scores: SkinScores;

  // Overall skin health score (0-100, higher = healthier)
  overallScore: number;

  // Image URLs (6 types)
  imageUrls: MetaVuImageUrls;

  // Legacy image URLs for backward compatibility
  legacyImageUrls: {
    normal: string;
    uv: string;
    polarized: string;
  };

  // 13-zone analysis
  metaVuZones: Record<MetaVuZone, MetaVuZoneAnalysis>;

  // Legacy 5-zone analysis for backward compatibility
  zones: {
    forehead: ZoneAnalysis;
    leftCheek: ZoneAnalysis;
    rightCheek: ZoneAnalysis;
    nose: ZoneAnalysis;
    chin: ZoneAnalysis;
  };

  // Age comparison data
  ageComparison: AgeComparison;

  // Analysis summary
  summary: {
    topConcerns: Array<{
      concern: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      affectedZones: MetaVuZone[];
      recommendation: string;
    }>;
    preventiveConcerns: Array<{
      concern: string;
      riskLevel: 'low' | 'medium' | 'high';
      description: string;
    }>;
    skinTypeAnalysis: string;
  };
}

// For backward compatibility - alias to MetaVuSkinAnalysis
export type SkinAnalysis = MetaVuSkinAnalysis;

export interface Treatment {
  id: string;
  nameKo: string;
  nameEn: string;
  category: TreatmentCategory;
  description: string;
  indications: string[];
  contraindications: string[];
  typicalSessions: { min: number; max: number };
  intervalDays: { min: number; max: number };
  downtime: string;
  priceRange: { min: number; max: number };
  effectiveness: Record<string, number>; // concern -> effectiveness score
  // Meta-Vu specific effectiveness mapping
  metaVuEffectiveness?: {
    pores?: { large?: number; medium?: number; small?: number };
    wrinkles?: { deep?: number; intermediate?: number; light?: number };
    pigmentation?: { brownSpots?: number; uvSpots?: number };
    vascular?: number;
    texture?: number;
    sebum?: number;
    moisture?: number;
  };
}

export interface SimilarCase {
  caseId: string;
  patientName: string;
  similarity: number;
  diagnosis: string;
  treatment: string;
  outcome: string;
  satisfaction: number;
}

export interface RecommendedTreatment {
  treatmentId: string;
  nameKo: string;
  nameEn: string;
  sessions: number;
  interval: string;
  intensity: string;
  rationale: string;
  confidence: number;
  // Meta-Vu specific targeting
  targetedMetrics?: {
    metric: string;
    currentValue: number;
    expectedImprovement: number;
  }[];
  targetedZones?: MetaVuZone[];
}

export interface Recommendation {
  id: string;
  analysisId: string;
  patientId: string;
  generatedAt: string;
  confidence: number;
  primaryTreatment: RecommendedTreatment;
  secondaryTreatments: RecommendedTreatment[];
  contraindications: string[];
  expectedOutcome: string;
  similarCases: SimilarCase[];
  aiReasoning: string;
  // Meta-Vu enhanced analysis reasoning
  metaVuInsights?: {
    uvDamageWarning?: string;         // Warning about hidden UV damage
    wrinkleDepthAnalysis?: string;    // Analysis of wrinkle severity
    poreTypeStrategy?: string;        // Strategy based on pore sizes
    preventiveRecommendations?: string[];
    skinAgeAnalysis?: string;         // Comparison to age group
  };
}

export interface DashboardStats {
  todayPatients: number;
  pendingAnalysis: number;
  completedConsultations: number;
  acceptanceRate: number;
  averageSatisfaction: number;
}

export interface RecentActivity {
  id: string;
  type: 'analysis' | 'recommendation' | 'consultation' | 'treatment';
  patientName: string;
  description: string;
  timestamp: string;
}

// Score Label Mapping (Legacy)
export const scoreLabels: Record<keyof SkinScores, { ko: string; en: string }> = {
  pigmentation: { ko: '색소침착', en: 'Pigmentation' },
  pores: { ko: '모공', en: 'Pores' },
  wrinkles: { ko: '주름', en: 'Wrinkles' },
  redness: { ko: '홍조', en: 'Redness' },
  sebum: { ko: '피지', en: 'Sebum' },
  moisture: { ko: '수분', en: 'Moisture' },
  elasticity: { ko: '탄력', en: 'Elasticity' },
  texture: { ko: '피부결', en: 'Texture' },
};

// Meta-Vu Enhanced Score Labels
export const metaVuScoreLabels = {
  pores: {
    ko: '모공',
    en: 'Pores',
    subMetrics: {
      large: { ko: '확대모공', en: 'Large Pores' },
      medium: { ko: '중간모공', en: 'Medium Pores' },
      small: { ko: '미세모공', en: 'Fine Pores' },
    },
  },
  wrinkles: {
    ko: '주름',
    en: 'Wrinkles',
    subMetrics: {
      deep: { ko: '깊은주름', en: 'Deep Wrinkles' },
      intermediate: { ko: '중간주름', en: 'Intermediate Wrinkles' },
      light: { ko: '잔주름', en: 'Fine Lines' },
    },
  },
  pigmentation: {
    ko: '색소침착',
    en: 'Pigmentation',
    subMetrics: {
      brownSpots: { ko: '갈색반점', en: 'Brown Spots' },
      uvSpots: { ko: 'UV손상 (미래색소)', en: 'UV Damage (Future Pigmentation)' },
    },
  },
  vascular: {
    ko: '혈관/홍조',
    en: 'Vascular/Redness',
    subMetrics: {
      redSpots: { ko: '붉은반점', en: 'Red Spots' },
    },
  },
  texture: {
    ko: '피부결',
    en: 'Texture',
    subMetrics: {
      roughness: { ko: '거칠기', en: 'Roughness' },
      uniformity: { ko: '균일도', en: 'Uniformity' },
    },
  },
  sebum: {
    ko: '피지',
    en: 'Sebum',
    subMetrics: {
      level: { ko: '피지량', en: 'Sebum Level' },
      distribution: { ko: '분포', en: 'Distribution' },
    },
  },
  moisture: {
    ko: '수분',
    en: 'Moisture',
    subMetrics: {
      level: { ko: '수분량', en: 'Moisture Level' },
      distribution: { ko: '분포', en: 'Distribution' },
    },
  },
};

// Category Label Mapping
export const categoryLabels: Record<TreatmentCategory, { ko: string; en: string }> = {
  laser: { ko: '레이저', en: 'Laser' },
  injectable: { ko: '주사', en: 'Injectable' },
  device: { ko: '기기', en: 'Device' },
  topical: { ko: '도포', en: 'Topical' },
  combination: { ko: '복합', en: 'Combination' },
};

// Status Color Mapping - Using brand palette
export const statusColors: Record<PatientStatus, string> = {
  '분석 대기': 'bg-[var(--cellora-brown-lighter)] text-[var(--cellora-brown)]',
  '상담 중': 'bg-[var(--cellora-mint)]/30 text-[var(--cellora-dark-green)]',
  '완료': 'bg-[var(--cellora-green-lighter)] text-[var(--cellora-green-dark)]',
  '예약됨': 'bg-[#E8EFEB] text-[var(--cellora-dark-green)]',
};

// Severity Color Mapping - Using brand palette
export const severityColors: Record<'low' | 'medium' | 'high' | 'critical', string> = {
  low: 'bg-[var(--cellora-green-lighter)] text-[var(--cellora-green-dark)]',
  medium: 'bg-[var(--cellora-brown-lighter)] text-[var(--cellora-brown)]',
  high: 'bg-[var(--cellora-brown-lighter)] text-[var(--cellora-brown-dark)]',
  critical: 'bg-[#F5E6E6] text-[#8B4513]',
};

// Helper function to convert MetaVuScores to legacy SkinScores
export function convertToLegacyScores(metaVu: MetaVuScores): SkinScores {
  return {
    pigmentation: metaVu.pigmentation.score,
    pores: metaVu.pores.score,
    wrinkles: metaVu.wrinkles.score,
    redness: metaVu.vascular.score,
    sebum: metaVu.sebum.score,
    moisture: metaVu.moisture.score,
    elasticity: 100 - metaVu.elasticityInferred, // Invert for legacy format
    texture: metaVu.texture.score,
  };
}

// Helper function to calculate severity from score
export function getSeverityFromScore(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score < 30) return 'low';
  if (score < 55) return 'medium';
  if (score < 75) return 'high';
  return 'critical';
}

// Helper function to get percentile description
export function getPercentileDescription(percentile: number): { ko: string; en: string; status: 'excellent' | 'good' | 'average' | 'poor' } {
  if (percentile >= 80) return { ko: '매우 우수', en: 'Excellent', status: 'excellent' };
  if (percentile >= 60) return { ko: '양호', en: 'Good', status: 'good' };
  if (percentile >= 40) return { ko: '보통', en: 'Average', status: 'average' };
  return { ko: '관리 필요', en: 'Needs Attention', status: 'poor' };
}
