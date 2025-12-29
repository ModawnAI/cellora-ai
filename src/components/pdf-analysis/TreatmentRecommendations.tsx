'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LightningIcon,
  ClockIcon,
  CalendarIcon,
  CurrencyKrwIcon,
  CaretDownIcon,
  StarIcon,
  CheckCircleIcon,
  InfoIcon,
} from '@phosphor-icons/react';
import type { TreatmentRecommendation } from '@/lib/pdf-skin-analysis/types';

interface TreatmentRecommendationsProps {
  immediate: TreatmentRecommendation[];
  shortTerm: TreatmentRecommendation[];
  longTerm: TreatmentRecommendation[];
  maintenance: TreatmentRecommendation[];
  totalInvestment: {
    min: number;
    max: number;
    currency: string;
  };
}

type TimeframeKey = 'immediate' | 'shortTerm' | 'longTerm' | 'maintenance';

const timeframeLabels: Record<TimeframeKey, { label: string; icon: React.ReactNode; color: string }> = {
  immediate: {
    label: '즉시 시술',
    icon: <LightningIcon weight="fill" className="w-4 h-4" />,
    color: 'text-[var(--cellora-brown)] bg-[var(--cellora-brown-lighter)]',
  },
  shortTerm: {
    label: '1-3개월',
    icon: <ClockIcon weight="fill" className="w-4 h-4" />,
    color: 'text-[var(--cellora-warm-gray)] bg-[var(--muted)]',
  },
  longTerm: {
    label: '3-12개월',
    icon: <CalendarIcon weight="fill" className="w-4 h-4" />,
    color: 'text-[var(--cellora-dark-green)] bg-[var(--cellora-green-lighter)]',
  },
  maintenance: {
    label: '유지 관리',
    icon: <CheckCircleIcon weight="fill" className="w-4 h-4" />,
    color: 'text-[var(--cellora-mint)] bg-[var(--cellora-mint)]/20',
  },
};

const categoryLabels: Record<string, { ko: string; en: string }> = {
  laser: { ko: '레이저', en: 'Laser' },
  injectable: { ko: '주사', en: 'Injectable' },
  device: { ko: '기기', en: 'Device' },
  topical: { ko: '도포', en: 'Topical' },
  combination: { ko: '복합', en: 'Combination' },
};

const priorityLabels: Record<string, { label: string; color: string }> = {
  essential: { label: '필수', color: 'bg-[var(--cellora-brown)] text-white' },
  recommended: { label: '권장', color: 'bg-[var(--cellora-mint)] text-[var(--cellora-dark-green)]' },
  optional: { label: '선택', color: 'bg-[var(--muted)] text-[var(--cellora-warm-gray)]' },
};

function TreatmentCard({ treatment }: { treatment: TreatmentRecommendation }) {
  const [expanded, setExpanded] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <motion.div
      layout
      className="border border-[var(--border)] rounded-xl overflow-hidden bg-white"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left hover:bg-[var(--muted)]/50 transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-[var(--cellora-dark-green)]">
                {treatment.nameKo}
              </span>
              <span className="text-xs text-[var(--cellora-warm-gray)]">
                {treatment.nameEn}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  priorityLabels[treatment.priority]?.color
                }`}
              >
                {priorityLabels[treatment.priority]?.label}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--cellora-warm-gray)]">
                {categoryLabels[treatment.category]?.ko}
              </span>
              <span className="text-xs text-[var(--cellora-warm-gray)] flex items-center gap-1">
                <StarIcon weight="fill" className="w-3 h-3 text-[var(--cellora-mint)]" />
                {Math.round(treatment.confidence * 100)}%
              </span>
            </div>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <CaretDownIcon className="w-5 h-5 text-[var(--cellora-warm-gray)]" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-[var(--border)]"
          >
            <div className="p-4 space-y-4">
              {/* Target Conditions */}
              <div>
                <span className="text-xs text-[var(--cellora-warm-gray)] block mb-1">
                  대상 증상
                </span>
                <div className="flex flex-wrap gap-1">
                  {treatment.targetedConditions.map((condition, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 rounded bg-[var(--cellora-green-lighter)] text-[var(--cellora-green-dark)]"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>

              {/* Expected Outcome */}
              <div>
                <span className="text-xs text-[var(--cellora-warm-gray)] block mb-1">
                  예상 결과
                </span>
                <p className="text-sm text-[var(--cellora-dark-green)]">
                  {treatment.expectedOutcome}
                </p>
              </div>

              {/* Treatment Details */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-2 rounded-lg bg-[var(--muted)]">
                  <span className="text-xs text-[var(--cellora-warm-gray)] block">
                    회차
                  </span>
                  <span className="text-lg font-bold text-[var(--cellora-dark-green)]">
                    {treatment.sessions}회
                  </span>
                </div>
                <div className="text-center p-2 rounded-lg bg-[var(--muted)]">
                  <span className="text-xs text-[var(--cellora-warm-gray)] block">
                    간격
                  </span>
                  <span className="text-lg font-bold text-[var(--cellora-dark-green)]">
                    {treatment.interval}
                  </span>
                </div>
                <div className="text-center p-2 rounded-lg bg-[var(--muted)]">
                  <span className="text-xs text-[var(--cellora-warm-gray)] block">
                    예상 비용
                  </span>
                  <span className="text-sm font-bold text-[var(--cellora-dark-green)]">
                    {formatPrice(treatment.estimatedCost.min)}~
                    {formatPrice(treatment.estimatedCost.max)}원
                  </span>
                </div>
              </div>

              {/* Reasoning */}
              <div className="bg-[var(--cellora-mint)]/10 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <InfoIcon weight="fill" className="w-4 h-4 text-[var(--cellora-green)] mt-0.5" />
                  <p className="text-sm text-[var(--cellora-dark-green)]">
                    {treatment.reasoning}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function TreatmentRecommendations({
  immediate,
  shortTerm,
  longTerm,
  maintenance,
  totalInvestment,
}: TreatmentRecommendationsProps) {
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeKey>('immediate');

  const treatments: Record<TimeframeKey, TreatmentRecommendation[]> = {
    immediate,
    shortTerm,
    longTerm,
    maintenance,
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LightningIcon weight="fill" className="w-5 h-5 text-[var(--cellora-mint)]" />
          <h3 className="text-lg font-semibold text-[var(--cellora-dark-green)]">
            맞춤 시술 추천
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CurrencyKrwIcon weight="bold" className="w-4 h-4 text-[var(--cellora-warm-gray)]" />
          <span className="text-[var(--cellora-dark-green)]">
            총 예상 비용:{' '}
            <span className="font-bold">
              {formatPrice(totalInvestment.min)}~{formatPrice(totalInvestment.max)}원
            </span>
          </span>
        </div>
      </div>

      {/* Timeframe Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(Object.keys(timeframeLabels) as TimeframeKey[]).map((key) => {
          const timeframe = timeframeLabels[key];
          const count = treatments[key].length;
          return (
            <button
              key={key}
              onClick={() => setActiveTimeframe(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTimeframe === key
                  ? timeframe.color
                  : 'text-[var(--cellora-warm-gray)] hover:bg-[var(--muted)]'
              }`}
            >
              {timeframe.icon}
              {timeframe.label}
              {count > 0 && (
                <span className="w-5 h-5 rounded-full bg-[var(--cellora-dark-green)] text-white text-xs flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Treatment List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        <AnimatePresence mode="wait">
          {treatments[activeTimeframe].length > 0 ? (
            <motion.div
              key={activeTimeframe}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {treatments[activeTimeframe].map((treatment, idx) => (
                <TreatmentCard key={`${treatment.treatmentId}-${idx}`} treatment={treatment} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-[var(--cellora-warm-gray)]"
            >
              <InfoIcon weight="light" className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>이 기간에 권장되는 시술이 없습니다.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
