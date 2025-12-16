import {
  MetaVuSkinAnalysis,
  MetaVuScores,
  MetaVuZone,
  MetaVuZoneAnalysis,
  SkinScores,
  ZoneAnalysis,
  AgeComparison,
  metaVuZoneLabels,
  getSeverityFromScore,
} from '../types';

// ============================================================
// META-VU 3D MOCK DATA GENERATORS
// ============================================================

// Profile types for realistic data generation
type SkinProfile = 'pigmentation' | 'aging' | 'acne' | 'sensitive' | 'balanced' | 'uvDamage' | 'combination';

// Random number within range
const rand = (min: number, max: number) => Math.round(min + Math.random() * (max - min));

// Generate MetaVu Pore Analysis
const generatePoreAnalysis = (profile: SkinProfile): MetaVuScores['pores'] => {
  const profiles: Record<SkinProfile, { totalRange: [number, number]; largeRatio: number; mediumRatio: number }> = {
    pigmentation: { totalRange: [800, 1200], largeRatio: 0.15, mediumRatio: 0.35 },
    aging: { totalRange: [600, 1000], largeRatio: 0.25, mediumRatio: 0.40 },
    acne: { totalRange: [1500, 2500], largeRatio: 0.35, mediumRatio: 0.40 },
    sensitive: { totalRange: [500, 900], largeRatio: 0.10, mediumRatio: 0.30 },
    balanced: { totalRange: [600, 1000], largeRatio: 0.10, mediumRatio: 0.25 },
    uvDamage: { totalRange: [700, 1100], largeRatio: 0.20, mediumRatio: 0.35 },
    combination: { totalRange: [1000, 1800], largeRatio: 0.25, mediumRatio: 0.35 },
  };

  const p = profiles[profile];
  const totalCount = rand(...p.totalRange);
  const large = Math.round(totalCount * p.largeRatio);
  const medium = Math.round(totalCount * p.mediumRatio);
  const small = totalCount - large - medium;

  // Score based on large pore ratio (higher ratio = higher score = worse)
  const largeRatio = large / totalCount;
  const score = Math.min(100, Math.round(largeRatio * 200 + (totalCount / 25)));

  return {
    totalCount,
    density: +(totalCount / 150).toFixed(1), // per cm²
    large,
    medium,
    small,
    score: Math.min(100, score),
  };
};

// Generate MetaVu Wrinkle Analysis
const generateWrinkleAnalysis = (profile: SkinProfile): MetaVuScores['wrinkles'] => {
  const profiles: Record<SkinProfile, { totalRange: [number, number]; deepRatio: number; intermediateRatio: number }> = {
    pigmentation: { totalRange: [30, 60], deepRatio: 0.10, intermediateRatio: 0.30 },
    aging: { totalRange: [80, 150], deepRatio: 0.30, intermediateRatio: 0.40 },
    acne: { totalRange: [15, 35], deepRatio: 0.05, intermediateRatio: 0.20 },
    sensitive: { totalRange: [25, 50], deepRatio: 0.08, intermediateRatio: 0.25 },
    balanced: { totalRange: [20, 45], deepRatio: 0.05, intermediateRatio: 0.20 },
    uvDamage: { totalRange: [50, 90], deepRatio: 0.20, intermediateRatio: 0.35 },
    combination: { totalRange: [40, 80], deepRatio: 0.15, intermediateRatio: 0.35 },
  };

  const p = profiles[profile];
  const totalCount = rand(...p.totalRange);
  const deep = Math.round(totalCount * p.deepRatio);
  const intermediate = Math.round(totalCount * p.intermediateRatio);
  const light = totalCount - deep - intermediate;

  // Score based on deep wrinkle count and total
  const score = Math.min(100, Math.round(deep * 5 + intermediate * 2 + light * 0.5));

  return {
    totalCount,
    density: +(totalCount / 20).toFixed(1),
    deep,
    intermediate,
    light,
    score: Math.min(100, score),
  };
};

// Generate MetaVu Pigmentation Analysis (with UV spots!)
const generatePigmentationAnalysis = (profile: SkinProfile): MetaVuScores['pigmentation'] => {
  const profiles: Record<SkinProfile, { brownRange: [number, number]; uvRatio: number }> = {
    pigmentation: { brownRange: [25, 50], uvRatio: 1.5 },
    aging: { brownRange: [15, 35], uvRatio: 1.8 },
    acne: { brownRange: [10, 25], uvRatio: 1.2 },
    sensitive: { brownRange: [8, 18], uvRatio: 1.0 },
    balanced: { brownRange: [5, 15], uvRatio: 0.8 },
    uvDamage: { brownRange: [20, 40], uvRatio: 2.5 }, // High UV ratio!
    combination: { brownRange: [15, 30], uvRatio: 1.4 },
  };

  const p = profiles[profile];
  const brownCount = rand(...p.brownRange);
  const uvCount = Math.round(brownCount * p.uvRatio);

  const brownArea = brownCount * rand(3, 8);
  const uvArea = uvCount * rand(2, 6);

  // Score considers both visible and hidden damage
  const score = Math.min(100, Math.round(brownCount * 2 + uvCount * 1.5));

  return {
    brownSpots: {
      count: brownCount,
      area: brownArea,
      density: +(brownCount / 100).toFixed(2),
    },
    uvSpots: {
      count: uvCount,
      area: uvArea,
      density: +(uvCount / 100).toFixed(2),
    },
    score: Math.min(100, score),
  };
};

// Generate MetaVu Vascular Analysis
const generateVascularAnalysis = (profile: SkinProfile): MetaVuScores['vascular'] => {
  const profiles: Record<SkinProfile, { countRange: [number, number] }> = {
    pigmentation: { countRange: [10, 25] },
    aging: { countRange: [15, 35] },
    acne: { countRange: [20, 45] },
    sensitive: { countRange: [40, 80] },
    balanced: { countRange: [8, 20] },
    uvDamage: { countRange: [15, 30] },
    combination: { countRange: [25, 50] },
  };

  const count = rand(...profiles[profile].countRange);
  const area = count * rand(2, 5);

  return {
    redSpots: {
      count,
      area,
      density: +(count / 100).toFixed(2),
    },
    score: Math.min(100, Math.round(count * 1.5)),
  };
};

// Generate MetaVu Texture Analysis
const generateTextureAnalysis = (profile: SkinProfile): MetaVuScores['texture'] => {
  const profiles: Record<SkinProfile, { roughnessRange: [number, number]; uniformityRange: [number, number] }> = {
    pigmentation: { roughnessRange: [40, 60], uniformityRange: [50, 70] },
    aging: { roughnessRange: [55, 75], uniformityRange: [40, 60] },
    acne: { roughnessRange: [60, 85], uniformityRange: [35, 55] },
    sensitive: { roughnessRange: [45, 65], uniformityRange: [45, 65] },
    balanced: { roughnessRange: [25, 45], uniformityRange: [65, 85] },
    uvDamage: { roughnessRange: [50, 70], uniformityRange: [45, 65] },
    combination: { roughnessRange: [50, 70], uniformityRange: [45, 65] },
  };

  const p = profiles[profile];
  const roughness = rand(...p.roughnessRange);
  const uniformity = rand(...p.uniformityRange);

  return {
    roughness,
    uniformity,
    score: Math.round((roughness + (100 - uniformity)) / 2),
  };
};

// Generate MetaVu Sebum Analysis
const generateSebumAnalysis = (profile: SkinProfile): MetaVuScores['sebum'] => {
  const profiles: Record<SkinProfile, { levelRange: [number, number]; distribution: ('uniform' | 'tzone' | 'patchy')[] }> = {
    pigmentation: { levelRange: [35, 55], distribution: ['uniform', 'tzone'] },
    aging: { levelRange: [25, 45], distribution: ['uniform', 'patchy'] },
    acne: { levelRange: [70, 95], distribution: ['tzone', 'uniform'] },
    sensitive: { levelRange: [30, 50], distribution: ['patchy', 'uniform'] },
    balanced: { levelRange: [35, 55], distribution: ['uniform'] },
    uvDamage: { levelRange: [40, 60], distribution: ['uniform', 'tzone'] },
    combination: { levelRange: [55, 80], distribution: ['tzone'] },
  };

  const p = profiles[profile];
  const level = rand(...p.levelRange);
  const distribution = p.distribution[Math.floor(Math.random() * p.distribution.length)];

  return {
    level,
    distribution,
    score: level,
  };
};

// Generate MetaVu Moisture Analysis
const generateMoistureAnalysis = (profile: SkinProfile): MetaVuScores['moisture'] => {
  const profiles: Record<SkinProfile, { levelRange: [number, number]; distribution: ('uniform' | 'dry-patches' | 'mixed')[] }> = {
    pigmentation: { levelRange: [50, 70], distribution: ['uniform', 'mixed'] },
    aging: { levelRange: [35, 55], distribution: ['dry-patches', 'mixed'] },
    acne: { levelRange: [55, 75], distribution: ['mixed', 'uniform'] },
    sensitive: { levelRange: [30, 50], distribution: ['dry-patches', 'mixed'] },
    balanced: { levelRange: [60, 80], distribution: ['uniform'] },
    uvDamage: { levelRange: [40, 60], distribution: ['mixed', 'dry-patches'] },
    combination: { levelRange: [45, 65], distribution: ['mixed'] },
  };

  const p = profiles[profile];
  const level = rand(...p.levelRange);
  const distribution = p.distribution[Math.floor(Math.random() * p.distribution.length)];

  // Score is inverted - lower moisture = higher score (worse)
  return {
    level,
    distribution,
    score: 100 - level,
  };
};

// Generate complete MetaVu Scores
const generateMetaVuScores = (profile: SkinProfile): MetaVuScores => {
  const wrinkles = generateWrinkleAnalysis(profile);

  // Infer elasticity from wrinkle depth ratio
  const deepRatio = wrinkles.deep / Math.max(1, wrinkles.totalCount);
  const elasticityInferred = Math.min(100, Math.round(deepRatio * 150 + wrinkles.score * 0.3));

  return {
    pores: generatePoreAnalysis(profile),
    wrinkles,
    pigmentation: generatePigmentationAnalysis(profile),
    vascular: generateVascularAnalysis(profile),
    texture: generateTextureAnalysis(profile),
    sebum: generateSebumAnalysis(profile),
    moisture: generateMoistureAnalysis(profile),
    elasticityInferred,
  };
};

// Convert MetaVu scores to legacy scores
const toLegacyScores = (metaVu: MetaVuScores): SkinScores => ({
  pigmentation: metaVu.pigmentation.score,
  pores: metaVu.pores.score,
  wrinkles: metaVu.wrinkles.score,
  redness: metaVu.vascular.score,
  sebum: metaVu.sebum.score,
  moisture: metaVu.moisture.score,
  elasticity: 100 - metaVu.elasticityInferred,
  texture: metaVu.texture.score,
});

// Generate zone-specific analysis
const generateMetaVuZoneAnalysis = (
  zone: MetaVuZone,
  profile: SkinProfile,
  metaVuScores: MetaVuScores
): MetaVuZoneAnalysis => {
  const label = metaVuZoneLabels[zone].ko;

  // Zone-specific metric relevance
  const zoneMetrics: Record<MetaVuZone, string[]> = {
    forehead: ['wrinkles', 'sebum', 'pores'],
    glabella: ['wrinkles'],
    leftPeriorbital: ['wrinkles', 'pigmentation'],
    rightPeriorbital: ['wrinkles', 'pigmentation'],
    leftUpperCheek: ['pigmentation', 'pores', 'vascular'],
    rightUpperCheek: ['pigmentation', 'pores', 'vascular'],
    leftLowerCheek: ['pigmentation', 'pores', 'vascular'],
    rightLowerCheek: ['pigmentation', 'pores', 'vascular'],
    nose: ['pores', 'sebum'],
    leftNasolabial: ['wrinkles'],
    rightNasolabial: ['wrinkles'],
    upperLip: ['wrinkles', 'pigmentation'],
    chin: ['sebum', 'pores', 'vascular'],
  };

  const relevantMetrics = zoneMetrics[zone];
  const zoneAnalysis: MetaVuZoneAnalysis = {
    zone,
    label,
    severity: 'low',
    primaryConcern: '',
  };

  // Add relevant metrics with zone-specific variation
  if (relevantMetrics.includes('pores')) {
    const variation = 0.7 + Math.random() * 0.6; // 0.7 - 1.3x
    const pores = metaVuScores.pores;
    zoneAnalysis.pores = {
      count: Math.round(pores.totalCount * variation * 0.15), // Zone is ~15% of face
      large: Math.round(pores.large * variation * 0.15),
      medium: Math.round(pores.medium * variation * 0.15),
      small: Math.round(pores.small * variation * 0.15),
    };
  }

  if (relevantMetrics.includes('wrinkles')) {
    const variation = 0.7 + Math.random() * 0.6;
    const wrinkles = metaVuScores.wrinkles;
    zoneAnalysis.wrinkles = {
      count: Math.round(wrinkles.totalCount * variation * 0.12),
      deep: Math.round(wrinkles.deep * variation * 0.12),
      intermediate: Math.round(wrinkles.intermediate * variation * 0.12),
      light: Math.round(wrinkles.light * variation * 0.12),
    };
  }

  if (relevantMetrics.includes('pigmentation')) {
    const variation = 0.7 + Math.random() * 0.6;
    const pig = metaVuScores.pigmentation;
    zoneAnalysis.pigmentation = {
      brownSpots: Math.round(pig.brownSpots.count * variation * 0.15),
      uvSpots: Math.round(pig.uvSpots.count * variation * 0.15),
    };
  }

  if (relevantMetrics.includes('vascular')) {
    const variation = 0.7 + Math.random() * 0.6;
    zoneAnalysis.vascular = {
      redSpots: Math.round(metaVuScores.vascular.redSpots.count * variation * 0.12),
    };
  }

  if (relevantMetrics.includes('sebum')) {
    zoneAnalysis.sebum = Math.round(metaVuScores.sebum.score * (0.8 + Math.random() * 0.4));
  }

  // Calculate severity and primary concern
  const concerns: { name: string; score: number }[] = [];

  if (zoneAnalysis.pores) {
    concerns.push({ name: '모공', score: (zoneAnalysis.pores.large / Math.max(1, zoneAnalysis.pores.count)) * 100 + 30 });
  }
  if (zoneAnalysis.wrinkles) {
    concerns.push({ name: '주름', score: zoneAnalysis.wrinkles.deep * 10 + zoneAnalysis.wrinkles.intermediate * 3 });
  }
  if (zoneAnalysis.pigmentation) {
    concerns.push({ name: '색소침착', score: zoneAnalysis.pigmentation.brownSpots * 3 + zoneAnalysis.pigmentation.uvSpots * 2 });
  }
  if (zoneAnalysis.vascular) {
    concerns.push({ name: '홍조', score: zoneAnalysis.vascular.redSpots * 2 });
  }
  if (zoneAnalysis.sebum !== undefined) {
    concerns.push({ name: '피지', score: zoneAnalysis.sebum });
  }

  const maxConcern = concerns.reduce((max, c) => c.score > max.score ? c : max, { name: '양호', score: 0 });
  zoneAnalysis.primaryConcern = maxConcern.score > 50 ? maxConcern.name : '양호';
  zoneAnalysis.severity = getSeverityFromScore(maxConcern.score);

  return zoneAnalysis;
};

// Generate all 13 zones
const generateAllZones = (profile: SkinProfile, metaVuScores: MetaVuScores): Record<MetaVuZone, MetaVuZoneAnalysis> => {
  const zones: MetaVuZone[] = [
    'forehead', 'glabella', 'leftPeriorbital', 'rightPeriorbital',
    'leftUpperCheek', 'rightUpperCheek', 'leftLowerCheek', 'rightLowerCheek',
    'nose', 'leftNasolabial', 'rightNasolabial', 'upperLip', 'chin'
  ];

  const result: Partial<Record<MetaVuZone, MetaVuZoneAnalysis>> = {};
  for (const zone of zones) {
    result[zone] = generateMetaVuZoneAnalysis(zone, profile, metaVuScores);
  }

  return result as Record<MetaVuZone, MetaVuZoneAnalysis>;
};

// Generate legacy 5-zone format
const generateLegacyZones = (metaVuZones: Record<MetaVuZone, MetaVuZoneAnalysis>, scores: SkinScores) => {
  const mapToLegacy = (zones: MetaVuZone[], label: string): ZoneAnalysis => {
    const combined = zones.map(z => metaVuZones[z]);
    const avgSeverity = combined.reduce((sum, z) => {
      const severityMap = { low: 1, medium: 2, high: 3, critical: 4 };
      return sum + severityMap[z.severity];
    }, 0) / combined.length;

    return {
      zone: label,
      scores: {
        pigmentation: scores.pigmentation + rand(-10, 10),
        pores: scores.pores + rand(-10, 10),
        wrinkles: scores.wrinkles + rand(-10, 10),
      },
      severity: avgSeverity < 1.5 ? 'low' : avgSeverity < 2.5 ? 'medium' : 'high',
    };
  };

  return {
    forehead: mapToLegacy(['forehead', 'glabella'], '이마'),
    leftCheek: mapToLegacy(['leftUpperCheek', 'leftLowerCheek'], '왼쪽 볼'),
    rightCheek: mapToLegacy(['rightUpperCheek', 'rightLowerCheek'], '오른쪽 볼'),
    nose: mapToLegacy(['nose'], '코'),
    chin: mapToLegacy(['chin'], '턱'),
  };
};

// Generate age comparison data
const generateAgeComparison = (patientAge: number, metaVuScores: MetaVuScores): AgeComparison => {
  const ageGroup = `${Math.floor(patientAge / 10) * 10}-${Math.floor(patientAge / 10) * 10 + 9}`;

  // Generate percentiles based on scores (lower score = better percentile)
  const getPercentile = (score: number) => Math.max(5, Math.min(95, 100 - score + rand(-10, 10)));

  const metrics = {
    pores: { percentile: getPercentile(metaVuScores.pores.score), average: 45, patient: metaVuScores.pores.score },
    wrinkles: { percentile: getPercentile(metaVuScores.wrinkles.score), average: 40, patient: metaVuScores.wrinkles.score },
    pigmentation: { percentile: getPercentile(metaVuScores.pigmentation.score), average: 42, patient: metaVuScores.pigmentation.score },
    vascular: { percentile: getPercentile(metaVuScores.vascular.score), average: 35, patient: metaVuScores.vascular.score },
    texture: { percentile: getPercentile(metaVuScores.texture.score), average: 40, patient: metaVuScores.texture.score },
    sebum: { percentile: getPercentile(metaVuScores.sebum.score), average: 45, patient: metaVuScores.sebum.score },
    moisture: { percentile: getPercentile(metaVuScores.moisture.score), average: 38, patient: metaVuScores.moisture.score },
  };

  const overallPercentile = Math.round(
    Object.values(metrics).reduce((sum, m) => sum + m.percentile, 0) / 7
  );

  // Calculate skin age based on overall percentile
  const skinAgeDiff = Math.round((50 - overallPercentile) / 5);
  const skinAge = patientAge + skinAgeDiff;

  return {
    ageGroup,
    sampleSize: rand(1500, 3500),
    metrics,
    overallPercentile,
    skinAge,
    actualAge: patientAge,
    skinAgeDifference: skinAgeDiff,
  };
};

// Generate analysis summary
const generateSummary = (metaVuScores: MetaVuScores, metaVuZones: Record<MetaVuZone, MetaVuZoneAnalysis>) => {
  const topConcerns: MetaVuSkinAnalysis['summary']['topConcerns'] = [];
  const preventiveConcerns: MetaVuSkinAnalysis['summary']['preventiveConcerns'] = [];

  // Check for high pigmentation
  if (metaVuScores.pigmentation.score > 60) {
    const affectedZones = (Object.entries(metaVuZones) as [MetaVuZone, MetaVuZoneAnalysis][])
      .filter(([, z]) => z.pigmentation && z.pigmentation.brownSpots > 3)
      .map(([zone]) => zone);

    topConcerns.push({
      concern: '색소침착',
      severity: getSeverityFromScore(metaVuScores.pigmentation.score),
      affectedZones,
      recommendation: '피코토닝 또는 레이저토닝 추천',
    });
  }

  // Check for UV damage (preventive)
  const uvRatio = metaVuScores.pigmentation.uvSpots.count / Math.max(1, metaVuScores.pigmentation.brownSpots.count);
  if (uvRatio > 1.5) {
    preventiveConcerns.push({
      concern: 'UV 손상 (미래 색소)',
      riskLevel: uvRatio > 2 ? 'high' : 'medium',
      description: `현재 보이지 않는 UV 손상이 ${metaVuScores.pigmentation.uvSpots.count}개 발견됨. 향후 색소침착으로 발전 가능.`,
    });
  }

  // Check for deep wrinkles
  if (metaVuScores.wrinkles.deep > 10) {
    const affectedZones = (Object.entries(metaVuZones) as [MetaVuZone, MetaVuZoneAnalysis][])
      .filter(([, z]) => z.wrinkles && z.wrinkles.deep > 1)
      .map(([zone]) => zone);

    topConcerns.push({
      concern: '깊은주름',
      severity: metaVuScores.wrinkles.deep > 20 ? 'high' : 'medium',
      affectedZones,
      recommendation: '보톡스 또는 필러 시술 권장',
    });
  }

  // Check for large pores
  if (metaVuScores.pores.large > 300) {
    const affectedZones = (Object.entries(metaVuZones) as [MetaVuZone, MetaVuZoneAnalysis][])
      .filter(([, z]) => z.pores && z.pores.large > 30)
      .map(([zone]) => zone);

    topConcerns.push({
      concern: '확대모공',
      severity: metaVuScores.pores.large > 500 ? 'high' : 'medium',
      affectedZones,
      recommendation: '프락셀 레이저 또는 화학적 박피 권장',
    });
  }

  // Check for redness
  if (metaVuScores.vascular.score > 50) {
    topConcerns.push({
      concern: '홍조/혈관확장',
      severity: getSeverityFromScore(metaVuScores.vascular.score),
      affectedZones: ['leftUpperCheek', 'rightUpperCheek'],
      recommendation: '제네시스 레이저 또는 IPL 권장',
    });
  }

  // Generate skin type analysis
  let skinTypeAnalysis = '종합적으로 ';
  if (metaVuScores.sebum.score > 60 && metaVuScores.moisture.score > 50) {
    skinTypeAnalysis += '지성 피부로 분류되며, 피지 조절과 보습 균형이 필요합니다.';
  } else if (metaVuScores.moisture.score > 60) {
    skinTypeAnalysis += '건성 피부로 분류되며, 집중 보습 관리가 필요합니다.';
  } else if (metaVuScores.sebum.distribution === 'tzone') {
    skinTypeAnalysis += '복합성 피부로 분류되며, 부위별 맞춤 관리가 필요합니다.';
  } else {
    skinTypeAnalysis += '중성 피부에 가까우나, 개별 문제점에 대한 집중 관리가 필요합니다.';
  }

  return {
    topConcerns,
    preventiveConcerns,
    skinTypeAnalysis,
  };
};

// ============================================================
// MOCK ANALYSIS DATA
// ============================================================

const patientProfiles: Record<string, { profile: SkinProfile; age: number }> = {
  'P001': { profile: 'pigmentation', age: 38 },
  'P002': { profile: 'acne', age: 24 },
  'P003': { profile: 'sensitive', age: 32 },
  'P004': { profile: 'aging', age: 55 },
  'P005': { profile: 'acne', age: 22 },
  'P008': { profile: 'balanced', age: 29 },
  'P010': { profile: 'sensitive', age: 45 },
  'P012': { profile: 'uvDamage', age: 42 },
};

const generateAnalysis = (id: string, patientId: string, analyzedAt: string): MetaVuSkinAnalysis => {
  const patientData = patientProfiles[patientId] || { profile: 'balanced' as SkinProfile, age: 35 };
  const metaVuScores = generateMetaVuScores(patientData.profile);
  const scores = toLegacyScores(metaVuScores);
  const metaVuZones = generateAllZones(patientData.profile, metaVuScores);

  // Calculate overall score (inverted - higher is better)
  const avgScore = (
    metaVuScores.pores.score +
    metaVuScores.wrinkles.score +
    metaVuScores.pigmentation.score +
    metaVuScores.vascular.score +
    metaVuScores.texture.score +
    metaVuScores.sebum.score +
    metaVuScores.moisture.score
  ) / 7;
  const overallScore = Math.round(100 - avgScore);

  return {
    id,
    patientId,
    analyzedAt,
    deviceInfo: {
      model: 'Meta-Vu 3D',
      version: '2.5.1',
      calibrationDate: '2025-12-01',
    },
    metaVuScores,
    scores,
    overallScore,
    imageUrls: {
      standard: '/images/analysis/standard.jpg',
      crossPolarized: '/images/analysis/cross-polarized.jpg',
      parallelPolarized: '/images/analysis/parallel-polarized.jpg',
      uv: '/images/analysis/uv.jpg',
      brownSpotsEnhanced: '/images/analysis/brown-enhanced.jpg',
      redSpotsEnhanced: '/images/analysis/red-enhanced.jpg',
    },
    legacyImageUrls: {
      normal: '/images/analysis/normal.jpg',
      uv: '/images/analysis/uv.jpg',
      polarized: '/images/analysis/polarized.jpg',
    },
    metaVuZones,
    zones: generateLegacyZones(metaVuZones, scores),
    ageComparison: generateAgeComparison(patientData.age, metaVuScores),
    summary: generateSummary(metaVuScores, metaVuZones),
  };
};

export const mockAnalyses: MetaVuSkinAnalysis[] = [
  generateAnalysis('A001', 'P001', '2025-12-17T09:30:00'),
  generateAnalysis('A002', 'P002', '2025-12-16T14:15:00'),
  generateAnalysis('A003', 'P003', '2025-12-17T10:45:00'),
  generateAnalysis('A004', 'P004', '2025-12-15T11:00:00'),
  generateAnalysis('A005', 'P005', '2025-12-17T08:30:00'),
  generateAnalysis('A008', 'P008', '2025-12-17T13:20:00'),
  generateAnalysis('A010', 'P010', '2025-12-17T15:00:00'),
  generateAnalysis('A012', 'P012', '2025-12-16T16:30:00'),
];

export const getAnalysisByPatientId = (patientId: string): MetaVuSkinAnalysis | undefined => {
  return mockAnalyses.find(a => a.patientId === patientId);
};

export const getLatestAnalyses = (count: number = 5): MetaVuSkinAnalysis[] => {
  return [...mockAnalyses]
    .sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime())
    .slice(0, count);
};

// Export a function to regenerate analyses with fresh random data
export const regenerateAnalyses = () => {
  mockAnalyses.length = 0;
  mockAnalyses.push(
    generateAnalysis('A001', 'P001', '2025-12-17T09:30:00'),
    generateAnalysis('A002', 'P002', '2025-12-16T14:15:00'),
    generateAnalysis('A003', 'P003', '2025-12-17T10:45:00'),
    generateAnalysis('A004', 'P004', '2025-12-15T11:00:00'),
    generateAnalysis('A005', 'P005', '2025-12-17T08:30:00'),
    generateAnalysis('A008', 'P008', '2025-12-17T13:20:00'),
    generateAnalysis('A010', 'P010', '2025-12-17T15:00:00'),
    generateAnalysis('A012', 'P012', '2025-12-16T16:30:00'),
  );
  return mockAnalyses;
};
