'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Syringe,
  Timer,
  Lightning,
  Warning,
  CheckCircle,
  User,
  Calendar,
  ArrowRight,
  Sun,
  Drop,
  Sparkle,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import {
  Patient,
  MetaVuSkinAnalysis,
  Recommendation,
  getSeverityFromScore,
} from '@/lib/types';

interface FullscreenPatientViewProps {
  patient: Patient;
  analysis: MetaVuSkinAnalysis;
  recommendation: Recommendation | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FullscreenPatientView({
  patient,
  analysis,
  recommendation,
  isOpen,
  onClose,
}: FullscreenPatientViewProps) {
  const [showContent, setShowContent] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'protocol'>('overview');

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowContent(true), 100);
      document.body.style.overflow = 'hidden';
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const scores = analysis.metaVuScores;
  const uvRatio = scores.pigmentation.uvSpots.count / Math.max(scores.pigmentation.brownSpots.count, 1);
  const hasUvWarning = uvRatio > 1.5;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-[#FAFAFA]"
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-[#FAFAFA] to-[#F0F7ED] opacity-80" />

          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(#172C23 1px, transparent 1px), linear-gradient(90deg, #172C23 1px, transparent 1px)`,
              backgroundSize: '80px 80px',
            }}
          />

          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={onClose}
            className="absolute top-8 right-8 z-50 p-3 rounded-full bg-white border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow"
          >
            <X size={20} className="text-[var(--cellora-dark-green)]" weight="light" />
          </motion.button>

          {/* Main Content */}
          <div className="relative z-10 w-full h-screen flex flex-col px-12 py-8 overflow-hidden">
            {showContent && (
              <>
                {/* Header */}
                <motion.header
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-start justify-between mb-8"
                >
                  <div className="flex items-center gap-6">
                    {/* Patient Avatar */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--cellora-mint)] to-[var(--cellora-green)] flex items-center justify-center shadow-lg">
                      <User size={32} className="text-white" weight="light" />
                    </div>

                    <div>
                      <h1 className="text-3xl font-light text-[var(--cellora-dark-green)] tracking-tight">
                        {patient.name}
                      </h1>
                      <p className="text-[var(--cellora-warm-gray)] mt-1">
                        {patient.age}세 · {patient.gender} · 피부타입 {patient.skinType}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {patient.primaryConcerns.slice(0, 3).map((concern, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full bg-[var(--cellora-mint)]/20 text-[var(--cellora-dark-green)] text-xs"
                          >
                            {concern}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Analysis Info */}
                  <div className="text-right">
                    <p className="text-xs text-[var(--cellora-warm-gray)] uppercase tracking-wider">분석일</p>
                    <p className="text-[var(--cellora-dark-green)] font-medium">
                      {new Date(analysis.analyzedAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </motion.header>

                {/* Tab Navigation */}
                <motion.nav
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-1 mb-6 p-1 bg-white rounded-xl border border-[var(--border)] w-fit shadow-sm"
                >
                  {[
                    { id: 'overview' as const, label: '개요' },
                    { id: 'metrics' as const, label: '상세 지표' },
                    { id: 'protocol' as const, label: '치료 프로토콜' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'px-6 py-2.5 rounded-lg text-sm font-medium transition-all',
                        activeTab === tab.id
                          ? 'bg-[var(--cellora-dark-green)] text-white shadow-sm'
                          : 'text-[var(--cellora-warm-gray)] hover:text-[var(--cellora-dark-green)]'
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </motion.nav>

                {/* Content Area */}
                <div className="flex-1 overflow-auto">
                  <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                      <OverviewTab
                        key="overview"
                        analysis={analysis}
                        recommendation={recommendation}
                        hasUvWarning={hasUvWarning}
                        uvRatio={uvRatio}
                      />
                    )}
                    {activeTab === 'metrics' && (
                      <MetricsTab key="metrics" analysis={analysis} />
                    )}
                    {activeTab === 'protocol' && (
                      <ProtocolTab key="protocol" recommendation={recommendation} />
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                {recommendation && (
                  <motion.footer
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 pt-6 border-t border-[var(--border)] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[var(--cellora-mint)] animate-pulse" />
                      <span className="text-sm text-[var(--cellora-warm-gray)]">
                        Cellora AI 분석 완료
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[var(--cellora-warm-gray)]">신뢰도</span>
                      <span className="text-[var(--cellora-dark-green)] font-semibold">
                        {Math.round(recommendation.confidence * 100)}%
                      </span>
                    </div>
                  </motion.footer>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Overview Tab
function OverviewTab({
  analysis,
  recommendation,
  hasUvWarning,
  uvRatio,
}: {
  analysis: MetaVuSkinAnalysis;
  recommendation: Recommendation | null;
  hasUvWarning: boolean;
  uvRatio: number;
}) {
  const scores = analysis.metaVuScores;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-3 gap-6"
    >
      {/* Left Column - Score Overview */}
      <div className="space-y-6">
        {/* Overall Score Card */}
        <div className="bg-white rounded-2xl p-8 border border-[var(--border)] shadow-sm">
          <p className="text-xs text-[var(--cellora-warm-gray)] uppercase tracking-wider mb-4">
            종합 피부 점수
          </p>
          <div className="flex items-end gap-3">
            <span className="text-6xl font-light text-[var(--cellora-dark-green)]">
              {analysis.overallScore}
            </span>
            <span className="text-xl text-[var(--cellora-warm-gray)] mb-2">/100</span>
          </div>
          <div className="mt-4 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${analysis.overallScore}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[var(--cellora-mint)] to-[var(--cellora-green)] rounded-full"
            />
          </div>
        </div>

        {/* Skin Age Card */}
        <div className="bg-white rounded-2xl p-8 border border-[var(--border)] shadow-sm">
          <p className="text-xs text-[var(--cellora-warm-gray)] uppercase tracking-wider mb-4">
            피부 나이
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-light text-[var(--cellora-dark-green)]">
              {analysis.ageComparison.skinAge}
            </span>
            <span className="text-lg text-[var(--cellora-warm-gray)]">세</span>
          </div>
          <p className={cn(
            'mt-2 text-sm font-medium',
            analysis.ageComparison.skinAgeDifference > 0
              ? 'text-[var(--cellora-brown)]'
              : 'text-[var(--cellora-green-dark)]'
          )}>
            실제 나이 대비 {analysis.ageComparison.skinAgeDifference > 0 ? '+' : ''}
            {analysis.ageComparison.skinAgeDifference}세
          </p>
        </div>

        {/* UV Warning */}
        {hasUvWarning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--cellora-green-lighter)] rounded-2xl p-6 border border-[var(--cellora-mint)]"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--cellora-mint)]/30 flex items-center justify-center">
                <Sun size={20} className="text-[var(--cellora-dark-green)]" weight="fill" />
              </div>
              <div>
                <p className="font-medium text-[var(--cellora-dark-green)]">UV 손상 감지</p>
                <p className="text-sm text-[var(--cellora-dark-green)]/70 mt-1">
                  숨겨진 UV 손상이 현재 색소의 {uvRatio.toFixed(1)}배 발견됨
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Middle Column - Key Metrics */}
      <div className="space-y-4">
        <p className="text-xs text-[var(--cellora-warm-gray)] uppercase tracking-wider mb-2">
          주요 지표
        </p>
        {[
          { label: '모공', score: scores.pores.score, count: scores.pores.totalCount, unit: '개' },
          { label: '주름', score: scores.wrinkles.score, count: scores.wrinkles.totalCount, unit: '개' },
          { label: '색소', score: scores.pigmentation.score, count: scores.pigmentation.brownSpots.count, unit: '개' },
          { label: '홍조', score: scores.vascular.score, count: scores.vascular.redSpots.count, unit: '개' },
          { label: '피부결', score: scores.texture.score, count: scores.texture.roughness, unit: '' },
          { label: '수분', score: scores.moisture.score, count: scores.moisture.level, unit: '%' },
        ].map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-xl p-4 border border-[var(--border)] shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[var(--cellora-dark-green)]">
                {metric.label}
              </span>
              <span className="text-sm text-[var(--cellora-warm-gray)]">
                {metric.count}{metric.unit}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.score}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.05 }}
                  className={cn(
                    'h-full rounded-full',
                    metric.score > 70 ? 'bg-[var(--cellora-brown)]' :
                    metric.score > 40 ? 'bg-[var(--cellora-warm-gray)]' :
                    'bg-[var(--cellora-green)]'
                  )}
                />
              </div>
              <span className={cn(
                'text-sm font-semibold w-8 text-right',
                metric.score > 70 ? 'text-[var(--cellora-brown)]' :
                metric.score > 40 ? 'text-[var(--cellora-warm-gray)]' :
                'text-[var(--cellora-green-dark)]'
              )}>
                {metric.score}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Right Column - Treatment Preview */}
      <div className="space-y-6">
        {recommendation ? (
          <>
            <div className="bg-white rounded-2xl p-8 border border-[var(--border)] shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Sparkle size={16} className="text-[var(--cellora-mint)]" weight="fill" />
                <p className="text-xs text-[var(--cellora-warm-gray)] uppercase tracking-wider">
                  AI 추천 시술
                </p>
              </div>

              <h3 className="text-2xl font-medium text-[var(--cellora-dark-green)] mb-1">
                {recommendation.primaryTreatment.nameKo}
              </h3>
              <p className="text-sm text-[var(--cellora-warm-gray)]">
                {recommendation.primaryTreatment.nameEn}
              </p>

              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="text-center p-3 bg-[var(--muted)]/30 rounded-xl">
                  <p className="text-2xl font-light text-[var(--cellora-dark-green)]">
                    {recommendation.primaryTreatment.sessions}
                  </p>
                  <p className="text-xs text-[var(--cellora-warm-gray)] mt-1">회</p>
                </div>
                <div className="text-center p-3 bg-[var(--muted)]/30 rounded-xl">
                  <p className="text-2xl font-light text-[var(--cellora-dark-green)]">
                    {recommendation.primaryTreatment.interval}
                  </p>
                  <p className="text-xs text-[var(--cellora-warm-gray)] mt-1">간격</p>
                </div>
                <div className="text-center p-3 bg-[var(--muted)]/30 rounded-xl">
                  <p className="text-2xl font-light text-[var(--cellora-dark-green)]">
                    {recommendation.primaryTreatment.intensity}
                  </p>
                  <p className="text-xs text-[var(--cellora-warm-gray)] mt-1">강도</p>
                </div>
              </div>
            </div>

            {/* Expected Outcome */}
            <div className="bg-gradient-to-br from-[var(--cellora-mint)]/10 to-[var(--cellora-green)]/10 rounded-2xl p-6 border border-[var(--cellora-mint)]/30">
              <p className="text-xs text-[var(--cellora-dark-green)] uppercase tracking-wider mb-3">
                예상 결과
              </p>
              <p className="text-sm text-[var(--cellora-dark-green)] leading-relaxed">
                {recommendation.expectedOutcome}
              </p>
            </div>

            {/* Secondary Treatments */}
            {recommendation.secondaryTreatments.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm">
                <p className="text-xs text-[var(--cellora-warm-gray)] uppercase tracking-wider mb-4">
                  보조 시술
                </p>
                <div className="space-y-3">
                  {recommendation.secondaryTreatments.map((treatment, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                      <span className="text-sm text-[var(--cellora-dark-green)]">
                        {treatment.nameKo}
                      </span>
                      <span className="text-xs text-[var(--cellora-warm-gray)]">
                        {treatment.sessions}회 · {treatment.interval}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-[var(--border)] shadow-sm flex flex-col items-center justify-center h-64">
            <Syringe size={40} className="text-[var(--muted-foreground)]" weight="light" />
            <p className="text-[var(--cellora-warm-gray)] mt-4">추천 생성 중...</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Metrics Tab
function MetricsTab({ analysis }: { analysis: MetaVuSkinAnalysis }) {
  const scores = analysis.metaVuScores;

  const metricGroups = [
    {
      title: '모공 분석',
      score: scores.pores.score,
      items: [
        { label: '총 모공', value: scores.pores.totalCount.toLocaleString(), unit: '개' },
        { label: '확대모공', value: scores.pores.large, unit: '개', highlight: true },
        { label: '중간모공', value: scores.pores.medium, unit: '개' },
        { label: '미세모공', value: scores.pores.small, unit: '개' },
        { label: '밀도', value: scores.pores.density, unit: '/cm²' },
      ],
    },
    {
      title: '주름 분석',
      score: scores.wrinkles.score,
      items: [
        { label: '총 주름', value: scores.wrinkles.totalCount, unit: '개' },
        { label: '깊은주름', value: scores.wrinkles.deep, unit: '개', highlight: true },
        { label: '중간주름', value: scores.wrinkles.intermediate, unit: '개' },
        { label: '잔주름', value: scores.wrinkles.light, unit: '개' },
        { label: '탄력 손실', value: scores.elasticityInferred, unit: '%' },
      ],
    },
    {
      title: '색소침착 분석',
      score: scores.pigmentation.score,
      items: [
        { label: '갈색반점', value: scores.pigmentation.brownSpots.count, unit: '개' },
        { label: 'UV 손상', value: scores.pigmentation.uvSpots.count, unit: '개', highlight: true },
        { label: '갈색반점 면적', value: scores.pigmentation.brownSpots.area, unit: 'mm²' },
        { label: 'UV손상 면적', value: scores.pigmentation.uvSpots.area, unit: 'mm²' },
      ],
    },
    {
      title: '홍조/혈관',
      score: scores.vascular.score,
      items: [
        { label: '붉은반점', value: scores.vascular.redSpots.count, unit: '개' },
        { label: '면적', value: scores.vascular.redSpots.area, unit: 'mm²' },
        { label: '밀도', value: scores.vascular.redSpots.density, unit: '/cm²' },
      ],
    },
    {
      title: '피부결',
      score: scores.texture.score,
      items: [
        { label: '거칠기', value: scores.texture.roughness, unit: '' },
        { label: '균일도', value: scores.texture.uniformity, unit: '%' },
      ],
    },
    {
      title: '피지/수분',
      score: Math.round((scores.sebum.score + scores.moisture.score) / 2),
      items: [
        { label: '피지량', value: scores.sebum.level, unit: '' },
        { label: '피지 분포', value: scores.sebum.distribution === 'tzone' ? 'T존 집중' : scores.sebum.distribution === 'patchy' ? '불규칙' : '균일', unit: '' },
        { label: '수분량', value: scores.moisture.level, unit: '%' },
        { label: '수분 분포', value: scores.moisture.distribution === 'dry-patches' ? '건조부위' : scores.moisture.distribution === 'mixed' ? '복합' : '균일', unit: '' },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-3 gap-6"
    >
      {metricGroups.map((group, idx) => (
        <motion.div
          key={group.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium text-[var(--cellora-dark-green)]">{group.title}</h3>
            <span className={cn(
              'text-2xl font-light',
              group.score > 70 ? 'text-[var(--cellora-brown)]' :
              group.score > 40 ? 'text-[var(--cellora-warm-gray)]' :
              'text-[var(--cellora-green-dark)]'
            )}>
              {group.score}
            </span>
          </div>
          <div className="space-y-3">
            {group.items.map((item) => (
              <div
                key={item.label}
                className={cn(
                  'flex items-center justify-between py-2',
                  item.highlight && 'bg-[var(--cellora-brown-lighter)]/50 -mx-3 px-3 rounded-lg'
                )}
              >
                <span className="text-sm text-[var(--cellora-warm-gray)]">{item.label}</span>
                <span className={cn(
                  'text-sm font-medium',
                  item.highlight ? 'text-[var(--cellora-brown-dark)]' : 'text-[var(--cellora-dark-green)]'
                )}>
                  {item.value}{item.unit}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Protocol Tab
function ProtocolTab({ recommendation }: { recommendation: Recommendation | null }) {
  if (!recommendation) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-96"
      >
        <div className="text-center">
          <Syringe size={48} className="mx-auto text-[var(--muted-foreground)]" weight="light" />
          <p className="text-[var(--cellora-warm-gray)] mt-4">치료 프로토콜이 없습니다</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-2 gap-8"
    >
      {/* Primary Treatment */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-8 border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="px-3 py-1 rounded-full bg-[var(--cellora-mint)]/20 text-[var(--cellora-dark-green)] text-xs font-medium">
              Primary
            </div>
            <span className="text-sm text-[var(--cellora-warm-gray)]">
              신뢰도 {Math.round(recommendation.primaryTreatment.confidence * 100)}%
            </span>
          </div>

          <h2 className="text-3xl font-light text-[var(--cellora-dark-green)] mb-2">
            {recommendation.primaryTreatment.nameKo}
          </h2>
          <p className="text-[var(--cellora-warm-gray)]">
            {recommendation.primaryTreatment.nameEn}
          </p>

          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4 bg-[var(--muted)]/30 rounded-xl">
              <Calendar size={20} className="mx-auto text-[var(--cellora-dark-green)] mb-2" />
              <p className="text-3xl font-light text-[var(--cellora-dark-green)]">
                {recommendation.primaryTreatment.sessions}
              </p>
              <p className="text-xs text-[var(--cellora-warm-gray)] mt-1">Sessions</p>
            </div>
            <div className="text-center p-4 bg-[var(--muted)]/30 rounded-xl">
              <Timer size={20} className="mx-auto text-[var(--cellora-dark-green)] mb-2" />
              <p className="text-3xl font-light text-[var(--cellora-dark-green)]">
                {recommendation.primaryTreatment.interval}
              </p>
              <p className="text-xs text-[var(--cellora-warm-gray)] mt-1">Interval</p>
            </div>
            <div className="text-center p-4 bg-[var(--muted)]/30 rounded-xl">
              <Lightning size={20} className="mx-auto text-[var(--cellora-dark-green)] mb-2" />
              <p className="text-3xl font-light text-[var(--cellora-dark-green)]">
                {recommendation.primaryTreatment.intensity}
              </p>
              <p className="text-xs text-[var(--cellora-warm-gray)] mt-1">Intensity</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-[var(--muted)]/20 rounded-xl">
            <p className="text-xs text-[var(--cellora-warm-gray)] uppercase tracking-wider mb-2">
              AI 판단 근거
            </p>
            <p className="text-sm text-[var(--cellora-dark-green)] leading-relaxed">
              {recommendation.primaryTreatment.rationale}
            </p>
          </div>
        </div>

        {/* Contraindications */}
        {recommendation.contraindications.length > 0 && (
          <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
            <div className="flex items-center gap-2 mb-4">
              <Warning size={18} className="text-red-600" weight="fill" />
              <p className="font-medium text-red-800">주의사항</p>
            </div>
            <ul className="space-y-2">
              {recommendation.contraindications.map((item, idx) => (
                <li key={idx} className="text-sm text-red-700">• {item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Secondary Treatments */}
        {recommendation.secondaryTreatments.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm">
            <p className="text-xs text-[var(--cellora-warm-gray)] uppercase tracking-wider mb-6">
              보조 시술
            </p>
            <div className="space-y-4">
              {recommendation.secondaryTreatments.map((treatment, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[var(--muted)]/20 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-[var(--cellora-dark-green)]">
                      {treatment.nameKo}
                    </h4>
                    <span className="text-xs text-[var(--cellora-warm-gray)]">
                      {Math.round(treatment.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-sm text-[var(--cellora-warm-gray)]">
                    {treatment.sessions}회 · {treatment.interval} · {treatment.intensity}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expected Outcome */}
        <div className="bg-gradient-to-br from-[var(--cellora-mint)]/20 to-[var(--cellora-green)]/10 rounded-2xl p-6 border border-[var(--cellora-mint)]/30">
          <p className="text-xs text-[var(--cellora-dark-green)] uppercase tracking-wider mb-4">
            예상 결과
          </p>
          <p className="text-[var(--cellora-dark-green)] leading-relaxed">
            {recommendation.expectedOutcome}
          </p>
        </div>

        {/* Similar Cases */}
        {recommendation.similarCases.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm">
            <p className="text-xs text-[var(--cellora-warm-gray)] uppercase tracking-wider mb-6">
              유사 케이스 ({recommendation.similarCases.length}건)
            </p>
            <div className="space-y-4">
              {recommendation.similarCases.slice(0, 3).map((caseData, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--cellora-dark-green)]">
                      {caseData.diagnosis}
                    </p>
                    <p className="text-xs text-[var(--cellora-warm-gray)] mt-1">
                      {caseData.treatment}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-light text-[var(--cellora-green-dark)]">
                      {Math.round(caseData.similarity * 100)}%
                    </p>
                    <p className="text-xs text-[var(--cellora-warm-gray)]">유사도</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
