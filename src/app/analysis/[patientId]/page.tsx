'use client';

import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Download,
  Printer,
  Warning,
  CheckCircle,
  XCircle,
  PencilSimple,
  CaretDown,
  CaretUp,
  User,
  Calendar,
  Phone,
  FirstAid,
  ChartPolar,
  MapPin,
  Image as ImageIcon,
  Sparkle,
  TrendUp,
  TrendDown,
  Sun,
  ArrowsOut,
} from '@phosphor-icons/react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { SkinAnalysisRadar, FullscreenPatientView } from '@/components/analysis';
import {
  getPatientById,
  getAnalysisByPatientId,
  getRecommendationByPatientId,
} from '@/lib/mock-data';
import {
  metaVuZoneLabels,
  MetaVuZone,
  getPercentileDescription,
} from '@/lib/types';
import { cn, getScoreColor, formatDateTime } from '@/lib/utils';

interface PageProps {
  params: Promise<{ patientId: string }>;
}

type TabType = 'overview' | 'detailed' | 'zones' | 'images';

export default function PatientAnalysisPage({ params }: PageProps) {
  const { patientId } = use(params);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  const patient = getPatientById(patientId);
  const analysis = getAnalysisByPatientId(patientId);
  const recommendation = getRecommendationByPatientId(patientId);

  if (!patient) {
    notFound();
  }

  const handleAccept = () => {
    console.log('Recommendation accepted');
  };

  const handleModify = () => {
    console.log('Modify recommendation');
  };

  const handleReject = () => {
    console.log('Recommendation rejected');
  };

  // Calculate UV ratio for warning
  const uvRatio = analysis
    ? analysis.metaVuScores.pigmentation.uvSpots.count /
      Math.max(1, analysis.metaVuScores.pigmentation.brownSpots.count)
    : 0;

  // Get top 3 concerns sorted by severity
  const topConcerns = analysis?.summary.topConcerns.slice(0, 3) || [];

  // Get problem zones
  const problemZones = analysis
    ? (Object.entries(analysis.metaVuZones) as [MetaVuZone, typeof analysis.metaVuZones[MetaVuZone]][])
        .filter(([, z]) => z.severity === 'high' || z.severity === 'critical')
        .slice(0, 4)
    : [];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 max-w-[1600px] mx-auto">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href="/analysis">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-[var(--foreground)]">
              피부 분석 결과
            </h1>
            <p className="text-xs text-[var(--muted-foreground)]">
              {analysis && formatDateTime(analysis.analyzedAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {analysis && (
            <Button
              variant="primary"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setIsFullscreenOpen(true)}
            >
              <ArrowsOut size={14} weight="bold" />
              프레젠테이션 모드
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-8 text-xs">
            <Printer size={14} />
            인쇄
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs">
            <Download size={14} />
            PDF
          </Button>
        </div>
      </div>

      {/* Patient Quick Info Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 p-3 rounded-xl bg-[var(--card)] border border-[var(--border)]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Patient Avatar & Name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--cellora-mint)]/30 flex items-center justify-center">
                <User size={20} className="text-[var(--cellora-dark-green)]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--foreground)]">{patient.name}</span>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {patient.age}세 · {patient.gender} · 피부타입 {patient.skinType}
                  </span>
                </div>
                <button
                  onClick={() => setShowPatientDetails(!showPatientDetails)}
                  className="text-xs text-[var(--cellora-dark-green)] hover:underline flex items-center gap-1"
                >
                  상세정보 {showPatientDetails ? <CaretUp size={12} /> : <CaretDown size={12} />}
                </button>
              </div>
            </div>

            {/* Allergies Warning */}
            {patient.allergies.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200">
                <Warning size={16} className="text-red-600" weight="fill" />
                <span className="text-xs font-medium text-red-700">
                  알레르기: {patient.allergies.join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Skin Age & Score */}
          {analysis && (
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-[10px] text-[var(--muted-foreground)]">피부나이</p>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-bold text-[var(--foreground)]">
                    {analysis.ageComparison.skinAge}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">세</span>
                  {analysis.ageComparison.skinAgeDifference !== 0 && (
                    <span className={cn(
                      'text-xs font-medium ml-1',
                      analysis.ageComparison.skinAgeDifference > 0 ? 'text-orange-600' : 'text-green-600'
                    )}>
                      ({analysis.ageComparison.skinAgeDifference > 0 ? '+' : ''}{analysis.ageComparison.skinAgeDifference})
                    </span>
                  )}
                </div>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-[var(--muted-foreground)]">종합점수</p>
                <span className="text-xl font-bold text-[var(--cellora-dark-green)]">
                  {analysis.overallScore}
                  <span className="text-xs text-[var(--muted-foreground)] font-normal">/100</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Expandable Patient Details */}
        <AnimatePresence>
          {showPatientDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-4 gap-4 pt-3 mt-3 border-t border-[var(--border)]">
                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <Phone size={14} />
                  {patient.phoneNumber}
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <Calendar size={14} />
                  등록일: {patient.registrationDate}
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <FirstAid size={14} />
                  병력: {patient.medicalHistory.length > 0 ? patient.medicalHistory.join(', ') : '없음'}
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <Sparkle size={14} />
                  주요 고민: {patient.primaryConcerns.slice(0, 2).join(', ')}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main Content: Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* LEFT: AI Recommendation & Decision (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Critical Alerts */}
          {analysis && uvRatio > 1.5 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl bg-gradient-to-r from-[var(--cellora-brown-lighter)] to-[#F5F0EA] border border-[var(--cellora-brown)]/30"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--cellora-brown-lighter)] flex items-center justify-center flex-shrink-0">
                  <Sun size={20} className="text-[var(--cellora-brown-dark)]" weight="fill" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--cellora-brown-dark)] text-sm">UV 손상 감지</h3>
                  <p className="text-xs text-[var(--cellora-brown)] mt-0.5">
                    숨겨진 UV 손상 {analysis.metaVuScores.pigmentation.uvSpots.count}개 발견
                    (갈색반점의 {uvRatio.toFixed(1)}배)
                  </p>
                  <p className="text-[10px] text-[var(--cellora-warm-gray)] mt-1">
                    향후 색소침착 위험 - 예방적 치료 권장
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Top Concerns Summary */}
          {topConcerns.length > 0 && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">주요 개선 필요 항목</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {topConcerns.map((concern, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[var(--muted)]/20">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={concern.severity === 'critical' ? 'error' : concern.severity === 'high' ? 'warning' : 'default'}
                          className="text-[10px]"
                        >
                          {concern.severity === 'critical' ? '심각' : concern.severity === 'high' ? '주의' : '보통'}
                        </Badge>
                        <span className="text-sm font-medium text-[var(--foreground)]">{concern.concern}</span>
                      </div>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {concern.affectedZones.length}개 부위
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Recommendation - THE MAIN DECISION */}
          {recommendation ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-2 border-[var(--cellora-mint)]/50 shadow-lg">
                <CardHeader className="py-3 bg-[var(--cellora-mint)]/10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkle size={16} className="text-[var(--cellora-dark-green)]" />
                      AI 추천 시술
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-[var(--muted-foreground)]">신뢰도</span>
                      <span className={cn(
                        'text-sm font-bold',
                        recommendation.confidence >= 0.8 ? 'text-green-600' :
                        recommendation.confidence >= 0.6 ? 'text-yellow-600' : 'text-orange-600'
                      )}>
                        {Math.round(recommendation.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {/* Primary Treatment */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-[var(--foreground)]">
                          {recommendation.primaryTreatment.nameEn}
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {recommendation.primaryTreatment.nameKo}
                        </p>
                      </div>
                      <Badge variant="success">{recommendation.primaryTreatment.intensity}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="p-2 rounded bg-[var(--muted)]/20">
                        <span className="text-[var(--muted-foreground)]">권장 회수</span>
                        <p className="font-semibold">{recommendation.primaryTreatment.sessions}회</p>
                      </div>
                      <div className="p-2 rounded bg-[var(--muted)]/20">
                        <span className="text-[var(--muted-foreground)]">시술 간격</span>
                        <p className="font-semibold">{recommendation.primaryTreatment.interval}</p>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      {recommendation.primaryTreatment.rationale}
                    </p>
                  </div>

                  {/* Secondary Treatments */}
                  {recommendation.secondaryTreatments.length > 0 && (
                    <div className="mb-4 pt-3 border-t border-[var(--border)]">
                      <p className="text-xs font-medium text-[var(--muted-foreground)] mb-2">보조 시술</p>
                      <div className="flex flex-wrap gap-2">
                        {recommendation.secondaryTreatments.map((t, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {t.nameKo}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expected Outcome */}
                  <div className="p-3 rounded-lg bg-[var(--cellora-mint)]/10 mb-4">
                    <p className="text-xs font-medium text-[var(--cellora-dark-green)] mb-1">예상 결과</p>
                    <p className="text-sm text-[var(--foreground)]">{recommendation.expectedOutcome}</p>
                  </div>

                  {/* Contraindications Warning */}
                  {recommendation.contraindications.length > 0 && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-100 mb-4">
                      <p className="text-xs font-medium text-red-700 mb-1">주의사항</p>
                      <ul className="text-xs text-red-600 space-y-0.5">
                        {recommendation.contraindications.map((c, i) => (
                          <li key={i}>• {c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ACTION BUTTONS */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="primary"
                      className="flex-1 h-11"
                      onClick={handleAccept}
                    >
                      <CheckCircle size={18} weight="fill" />
                      수락
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-11"
                      onClick={handleModify}
                    >
                      <PencilSimple size={18} />
                      수정
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-11 px-4"
                      onClick={handleReject}
                    >
                      <XCircle size={18} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-[var(--muted-foreground)]">AI 추천 생성 중...</p>
              </CardContent>
            </Card>
          )}

          {/* Similar Cases */}
          {recommendation && recommendation.similarCases.length > 0 && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">유사 케이스 ({recommendation.similarCases.length}건)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {recommendation.similarCases.slice(0, 2).map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[var(--muted)]/20">
                      <div>
                        <p className="text-xs font-medium text-[var(--foreground)]">{c.treatment}</p>
                        <p className="text-[10px] text-[var(--muted-foreground)]">{c.outcome}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[var(--cellora-dark-green)]">{Math.round(c.similarity * 100)}%</p>
                        <p className="text-[10px] text-[var(--muted-foreground)]">유사도</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT: Supporting Evidence (3 cols) */}
        <div className="lg:col-span-3">
          {/* Tab Navigation */}
          <div className="flex items-center gap-1 mb-4 p-1 rounded-lg bg-[var(--muted)]/30">
            {[
              { id: 'overview' as const, label: '개요', icon: ChartPolar },
              { id: 'detailed' as const, label: '상세 수치', icon: TrendUp },
              { id: 'zones' as const, label: '부위별 분석', icon: MapPin },
              { id: 'images' as const, label: '촬영 이미지', icon: ImageIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-white shadow-sm text-[var(--foreground)]'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                )}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && analysis && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-2 gap-4"
              >
                {/* Radar Chart */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">피부 상태 레이더</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <SkinAnalysisRadar scores={analysis.scores} size={240} />
                  </CardContent>
                </Card>

                {/* Age Comparison */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">동일 연령대 비교</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(['pores', 'wrinkles', 'pigmentation', 'vascular'] as const).map((key) => {
                        const metric = analysis.ageComparison.metrics[key];
                        const { ko, status } = getPercentileDescription(metric.percentile);
                        const labels = { pores: '모공', wrinkles: '주름', pigmentation: '색소', vascular: '홍조' };
                        return (
                          <div key={key} className="flex items-center gap-3">
                            <span className="w-12 text-xs text-[var(--muted-foreground)]">{labels[key]}</span>
                            <div className="flex-1 h-2 bg-[var(--muted)]/30 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${metric.percentile}%` }}
                                className={cn(
                                  'h-full rounded-full',
                                  status === 'excellent' || status === 'good' ? 'bg-[var(--cellora-green)]' :
                                  status === 'average' ? 'bg-[var(--cellora-brown)]' : 'bg-orange-400'
                                )}
                              />
                            </div>
                            <span className={cn(
                              'w-12 text-xs font-medium text-right',
                              status === 'excellent' || status === 'good' ? 'text-[var(--cellora-green-dark)]' :
                              status === 'average' ? 'text-[var(--cellora-brown)]' : 'text-orange-600'
                            )}>
                              {metric.percentile}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-3 text-center">
                      {analysis.ageComparison.ageGroup}세 {analysis.ageComparison.sampleSize.toLocaleString()}명 기준
                    </p>
                  </CardContent>
                </Card>

                {/* Problem Zones Quick View */}
                <Card className="col-span-2">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">문제 부위 요약</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {problemZones.length > 0 ? (
                      <div className="grid grid-cols-4 gap-2">
                        {problemZones.map(([zone, data]) => (
                          <div
                            key={zone}
                            className={cn(
                              'p-3 rounded-lg border text-center',
                              data.severity === 'critical'
                                ? 'bg-red-50 border-red-200'
                                : 'bg-orange-50 border-orange-200'
                            )}
                          >
                            <p className="text-xs font-medium text-[var(--foreground)]">{data.label}</p>
                            <Badge
                              variant={data.severity === 'critical' ? 'error' : 'warning'}
                              className="mt-1 text-[10px]"
                            >
                              {data.primaryConcern}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-center text-[var(--muted-foreground)] py-4">
                        심각한 문제 부위 없음
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'detailed' && analysis && (
              <motion.div
                key="detailed"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Pores Card */}
                <Card>
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">모공 분석</CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--muted-foreground)]">점수</span>
                        <span className={cn(
                          'text-lg font-bold',
                          analysis.metaVuScores.pores.score > 70 ? 'text-[var(--cellora-brown-dark)]' :
                          analysis.metaVuScores.pores.score > 40 ? 'text-[var(--cellora-brown)]' : 'text-[var(--cellora-green-dark)]'
                        )}>{analysis.metaVuScores.pores.score}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">/100</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      <div className="text-center p-3 rounded-lg bg-[var(--muted)]/20">
                        <p className="text-xs text-[var(--muted-foreground)]">총 모공</p>
                        <p className="text-xl font-bold">{analysis.metaVuScores.pores.totalCount.toLocaleString()}</p>
                        <p className="text-[10px] text-[var(--muted-foreground)]">개</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-[var(--cellora-brown-lighter)]">
                        <p className="text-xs text-[var(--cellora-brown-dark)]">확대모공</p>
                        <p className="text-xl font-bold text-[var(--cellora-brown-dark)]">{analysis.metaVuScores.pores.large.toLocaleString()}</p>
                        <p className="text-[10px] text-[var(--cellora-brown)]">{Math.round(analysis.metaVuScores.pores.large / analysis.metaVuScores.pores.totalCount * 100)}%</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-[var(--muted)]/20">
                        <p className="text-xs text-[var(--muted-foreground)]">중간모공</p>
                        <p className="text-xl font-bold">{analysis.metaVuScores.pores.medium.toLocaleString()}</p>
                        <p className="text-[10px] text-[var(--muted-foreground)]">{Math.round(analysis.metaVuScores.pores.medium / analysis.metaVuScores.pores.totalCount * 100)}%</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-[var(--cellora-green-lighter)]">
                        <p className="text-xs text-[var(--cellora-green-dark)]">미세모공</p>
                        <p className="text-xl font-bold text-[var(--cellora-green-dark)]">{analysis.metaVuScores.pores.small.toLocaleString()}</p>
                        <p className="text-[10px] text-[var(--cellora-green)]">{Math.round(analysis.metaVuScores.pores.small / analysis.metaVuScores.pores.totalCount * 100)}%</p>
                      </div>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden flex bg-[var(--muted)]/30">
                      <div className="h-full bg-[var(--cellora-brown-dark)]" style={{ width: `${(analysis.metaVuScores.pores.large / analysis.metaVuScores.pores.totalCount) * 100}%` }} />
                      <div className="h-full bg-[var(--cellora-brown)]" style={{ width: `${(analysis.metaVuScores.pores.medium / analysis.metaVuScores.pores.totalCount) * 100}%` }} />
                      <div className="h-full bg-[var(--cellora-green)]" style={{ width: `${(analysis.metaVuScores.pores.small / analysis.metaVuScores.pores.totalCount) * 100}%` }} />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-[var(--muted-foreground)]">
                      <span>확대</span><span>중간</span><span>미세</span>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mt-3">밀도: {analysis.metaVuScores.pores.density}/cm²</p>
                  </CardContent>
                </Card>

                {/* Wrinkles Card */}
                <Card>
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">주름 분석</CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--muted-foreground)]">점수</span>
                        <span className={cn(
                          'text-lg font-bold',
                          analysis.metaVuScores.wrinkles.score > 70 ? 'text-[var(--cellora-brown-dark)]' :
                          analysis.metaVuScores.wrinkles.score > 40 ? 'text-[var(--cellora-brown)]' : 'text-[var(--cellora-green-dark)]'
                        )}>{analysis.metaVuScores.wrinkles.score}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">/100</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      <div className="text-center p-3 rounded-lg bg-[var(--muted)]/20">
                        <p className="text-xs text-[var(--muted-foreground)]">총 주름</p>
                        <p className="text-xl font-bold">{analysis.metaVuScores.wrinkles.totalCount}</p>
                        <p className="text-[10px] text-[var(--muted-foreground)]">개</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-[var(--cellora-brown-lighter)]">
                        <p className="text-xs text-[var(--cellora-brown-dark)]">깊은주름</p>
                        <p className="text-xl font-bold text-[var(--cellora-brown-dark)]">{analysis.metaVuScores.wrinkles.deep}</p>
                        <p className="text-[10px] text-[var(--cellora-brown)]">{Math.round(analysis.metaVuScores.wrinkles.deep / analysis.metaVuScores.wrinkles.totalCount * 100)}%</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-[var(--muted)]/20">
                        <p className="text-xs text-[var(--muted-foreground)]">중간주름</p>
                        <p className="text-xl font-bold">{analysis.metaVuScores.wrinkles.intermediate}</p>
                        <p className="text-[10px] text-[var(--muted-foreground)]">{Math.round(analysis.metaVuScores.wrinkles.intermediate / analysis.metaVuScores.wrinkles.totalCount * 100)}%</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-[var(--cellora-green-lighter)]">
                        <p className="text-xs text-[var(--cellora-green-dark)]">잔주름</p>
                        <p className="text-xl font-bold text-[var(--cellora-green-dark)]">{analysis.metaVuScores.wrinkles.light}</p>
                        <p className="text-[10px] text-[var(--cellora-green)]">{Math.round(analysis.metaVuScores.wrinkles.light / analysis.metaVuScores.wrinkles.totalCount * 100)}%</p>
                      </div>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden flex bg-[var(--muted)]/30">
                      <div className="h-full bg-[var(--cellora-brown-dark)]" style={{ width: `${(analysis.metaVuScores.wrinkles.deep / analysis.metaVuScores.wrinkles.totalCount) * 100}%` }} />
                      <div className="h-full bg-[var(--cellora-brown)]" style={{ width: `${(analysis.metaVuScores.wrinkles.intermediate / analysis.metaVuScores.wrinkles.totalCount) * 100}%` }} />
                      <div className="h-full bg-[var(--cellora-green)]" style={{ width: `${(analysis.metaVuScores.wrinkles.light / analysis.metaVuScores.wrinkles.totalCount) * 100}%` }} />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-[var(--muted-foreground)]">
                      <span>깊은</span><span>중간</span><span>잔</span>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mt-3">밀도: {analysis.metaVuScores.wrinkles.density}/cm</p>
                  </CardContent>
                </Card>

                {/* Pigmentation Card */}
                <Card>
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">색소침착 분석</CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--muted-foreground)]">점수</span>
                        <span className={cn(
                          'text-lg font-bold',
                          analysis.metaVuScores.pigmentation.score > 70 ? 'text-[var(--cellora-brown-dark)]' :
                          analysis.metaVuScores.pigmentation.score > 40 ? 'text-[var(--cellora-brown)]' : 'text-[var(--cellora-green-dark)]'
                        )}>{analysis.metaVuScores.pigmentation.score}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">/100</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-[var(--muted)]/20">
                        <h5 className="text-xs font-medium text-[var(--muted-foreground)] mb-2">갈색반점 (현재 보이는)</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span>개수</span><span className="font-bold">{analysis.metaVuScores.pigmentation.brownSpots.count}개</span></div>
                          <div className="flex justify-between"><span>면적</span><span className="font-bold">{analysis.metaVuScores.pigmentation.brownSpots.area}mm²</span></div>
                          <div className="flex justify-between"><span>밀도</span><span className="font-bold">{analysis.metaVuScores.pigmentation.brownSpots.density}/cm²</span></div>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-[var(--cellora-brown-lighter)] border border-[var(--cellora-brown)]/30">
                        <h5 className="text-xs font-medium text-[var(--cellora-brown-dark)] mb-2">UV손상 (미래 색소)</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span>개수</span><span className="font-bold text-[var(--cellora-brown-dark)]">{analysis.metaVuScores.pigmentation.uvSpots.count}개</span></div>
                          <div className="flex justify-between"><span>면적</span><span className="font-bold text-[var(--cellora-brown-dark)]">{analysis.metaVuScores.pigmentation.uvSpots.area}mm²</span></div>
                          <div className="flex justify-between"><span>밀도</span><span className="font-bold text-[var(--cellora-brown-dark)]">{analysis.metaVuScores.pigmentation.uvSpots.density}/cm²</span></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-[var(--cellora-mint)]/10 border border-[var(--cellora-mint)]/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--cellora-dark-green)]">UV/갈색반점 비율</span>
                        <span className={cn('text-sm font-bold', uvRatio > 1.5 ? 'text-[var(--cellora-brown-dark)]' : 'text-[var(--cellora-green-dark)]')}>
                          {uvRatio.toFixed(2)}배 {uvRatio > 1.5 && <span className="text-xs font-normal">(주의)</span>}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Other Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">홍조/혈관</CardTitle>
                        <span className={cn('text-lg font-bold', analysis.metaVuScores.vascular.score > 70 ? 'text-[var(--cellora-brown-dark)]' : analysis.metaVuScores.vascular.score > 40 ? 'text-[var(--cellora-brown)]' : 'text-[var(--cellora-green-dark)]')}>{analysis.metaVuScores.vascular.score}<span className="text-xs text-[var(--muted-foreground)] font-normal">/100</span></span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">붉은반점</span><span className="font-medium">{analysis.metaVuScores.vascular.redSpots.count}개</span></div>
                      <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">면적</span><span className="font-medium">{analysis.metaVuScores.vascular.redSpots.area}mm²</span></div>
                      <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">밀도</span><span className="font-medium">{analysis.metaVuScores.vascular.redSpots.density}/cm²</span></div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">피부결</CardTitle>
                        <span className={cn('text-lg font-bold', analysis.metaVuScores.texture.score > 70 ? 'text-[var(--cellora-brown-dark)]' : analysis.metaVuScores.texture.score > 40 ? 'text-[var(--cellora-brown)]' : 'text-[var(--cellora-green-dark)]')}>{analysis.metaVuScores.texture.score}<span className="text-xs text-[var(--muted-foreground)] font-normal">/100</span></span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">거칠기</span><span className="font-medium">{analysis.metaVuScores.texture.roughness}/100</span></div>
                      <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">균일도</span><span className="font-medium">{analysis.metaVuScores.texture.uniformity}/100</span></div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">피지</CardTitle>
                        <span className={cn('text-lg font-bold', analysis.metaVuScores.sebum.score > 70 ? 'text-[var(--cellora-brown-dark)]' : analysis.metaVuScores.sebum.score > 40 ? 'text-[var(--cellora-brown)]' : 'text-[var(--cellora-green-dark)]')}>{analysis.metaVuScores.sebum.score}<span className="text-xs text-[var(--muted-foreground)] font-normal">/100</span></span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">피지량</span><span className="font-medium">{analysis.metaVuScores.sebum.level}/100</span></div>
                      <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">분포</span><span className="font-medium">{analysis.metaVuScores.sebum.distribution === 'tzone' ? 'T존 집중' : analysis.metaVuScores.sebum.distribution === 'patchy' ? '불규칙' : '균일'}</span></div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">수분</CardTitle>
                        <span className={cn('text-lg font-bold', analysis.metaVuScores.moisture.score > 70 ? 'text-[var(--cellora-brown-dark)]' : analysis.metaVuScores.moisture.score > 40 ? 'text-[var(--cellora-brown)]' : 'text-[var(--cellora-green-dark)]')}>{analysis.metaVuScores.moisture.score}<span className="text-xs text-[var(--muted-foreground)] font-normal">/100</span></span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">수분량</span><span className="font-medium">{analysis.metaVuScores.moisture.level}/100</span></div>
                      <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">분포</span><span className="font-medium">{analysis.metaVuScores.moisture.distribution === 'dry-patches' ? '건조부위 있음' : analysis.metaVuScores.moisture.distribution === 'mixed' ? '복합' : '균일'}</span></div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'zones' && analysis && (
              <motion.div
                key="zones"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">13개 부위별 분석</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.entries(analysis.metaVuZones) as [MetaVuZone, typeof analysis.metaVuZones[MetaVuZone]][]).map(([zone, data]) => (
                        <div
                          key={zone}
                          className={cn(
                            'p-3 rounded-lg border text-center transition-all hover:shadow-md cursor-pointer',
                            data.severity === 'critical' ? 'bg-red-50 border-red-200' :
                            data.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                            data.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                            'bg-green-50 border-green-200'
                          )}
                        >
                          <p className="text-xs font-medium text-[var(--foreground)]">{data.label}</p>
                          <p className="text-[10px] text-[var(--muted-foreground)]">{metaVuZoneLabels[zone].en}</p>
                          {data.primaryConcern !== '양호' && (
                            <Badge
                              variant={data.severity === 'critical' ? 'error' : data.severity === 'high' ? 'warning' : 'default'}
                              className="mt-1 text-[10px]"
                            >
                              {data.primaryConcern}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'images' && analysis && (
              <motion.div
                key="images"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Meta-Vu 3D 촬영 이미지</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { key: 'standard', label: '기본 촬영', desc: '일반 조명' },
                        { key: 'uv', label: 'UV 촬영', desc: '숨겨진 손상 확인' },
                        { key: 'crossPolarized', label: '교차편광', desc: '피하 분석' },
                        { key: 'parallelPolarized', label: '평행편광', desc: '표면 분석' },
                        { key: 'brownSpotsEnhanced', label: '색소 강조', desc: '갈색반점 하이라이트' },
                        { key: 'redSpotsEnhanced', label: '홍조 강조', desc: '혈관 하이라이트' },
                      ].map((img) => (
                        <div
                          key={img.key}
                          className="aspect-[4/3] rounded-lg bg-[var(--muted)]/30 border border-[var(--border)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--cellora-mint)] hover:shadow-md transition-all group"
                        >
                          <ImageIcon size={32} className="text-[var(--muted-foreground)] group-hover:text-[var(--cellora-dark-green)] transition-colors" />
                          <span className="text-xs font-medium mt-2">{img.label}</span>
                          <span className="text-[10px] text-[var(--muted-foreground)]">{img.desc}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fullscreen Patient View */}
      {analysis && (
        <FullscreenPatientView
          patient={patient}
          analysis={analysis}
          recommendation={recommendation ?? null}
          isOpen={isFullscreenOpen}
          onClose={() => setIsFullscreenOpen(false)}
        />
      )}
    </div>
  );
}
