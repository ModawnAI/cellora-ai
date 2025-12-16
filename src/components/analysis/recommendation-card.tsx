'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LightbulbIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  CaretDownIcon,
  SparkleIcon,
  ClockIcon,
  FireIcon,
} from '@phosphor-icons/react';
import { Card, CardContent, Badge, Button, Progress } from '@/components/ui';
import { Recommendation, RecommendedTreatment } from '@/lib/types';
import { cn, getConfidenceLabel, getConfidenceColor } from '@/lib/utils';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAccept?: () => void;
  onModify?: () => void;
  onReject?: () => void;
}

export function RecommendationCard({
  recommendation,
  onAccept,
  onModify,
  onReject,
}: RecommendationCardProps) {
  const [showSecondary, setShowSecondary] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  const { primaryTreatment, secondaryTreatments, confidence, aiReasoning, expectedOutcome, contraindications } = recommendation;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card variant="highlight" className="overflow-hidden">
        {/* Header */}
        <div className="relative p-6 pb-4">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--cellora-mint)]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[var(--cellora-mint)]/30">
                  <LightbulbIcon size={20} weight="fill" className="text-[var(--cellora-dark-green)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">AI 추천 시술</p>
                  <p className="text-sm font-medium text-[var(--cellora-dark-green)]">
                    신뢰도 {Math.round(confidence * 100)}%
                  </p>
                </div>
              </div>

              <Badge variant="success" size="lg">
                {getConfidenceLabel(confidence)}
              </Badge>
            </div>

            {/* Primary Treatment */}
            <div className="space-y-3">
              <div>
                <h3 className="text-2xl font-bold text-[var(--foreground)]">
                  {primaryTreatment.nameEn}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {primaryTreatment.nameKo}
                </p>
              </div>

              {/* Treatment Details */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 text-sm">
                  <ClockIcon size={16} className="text-[var(--muted-foreground)]" />
                  <span className="text-[var(--foreground)]">{primaryTreatment.sessions}회</span>
                  <span className="text-[var(--muted-foreground)]">/ {primaryTreatment.interval} 간격</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <FireIcon size={16} className="text-[var(--muted-foreground)]" />
                  <span className="text-[var(--foreground)]">{primaryTreatment.intensity}</span>
                </div>
              </div>

              {/* Confidence Meter */}
              <div className="pt-2">
                <Progress value={primaryTreatment.confidence * 100} variant="success" size="md" />
              </div>
            </div>
          </div>
        </div>

        {/* Rationale */}
        <CardContent className="pt-0">
          <div className="p-4 rounded-lg bg-[var(--muted)]/50 mb-4">
            <p className="text-sm text-[var(--foreground)] leading-relaxed">
              {primaryTreatment.rationale}
            </p>
          </div>

          {/* Expected Outcome */}
          <div className="flex items-start gap-2 mb-4">
            <SparkleIcon size={16} className="text-[var(--cellora-dark-green)] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-[var(--muted-foreground)] mb-1">예상 결과</p>
              <p className="text-sm text-[var(--foreground)]">{expectedOutcome}</p>
            </div>
          </div>

          {/* Contraindications */}
          {contraindications.length > 0 && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
              <p className="text-xs font-medium text-red-400 mb-1">주의사항</p>
              {contraindications.map((c, i) => (
                <p key={i} className="text-sm text-red-400/80">{c}</p>
              ))}
            </div>
          )}

          {/* Secondary Treatments Toggle */}
          {secondaryTreatments.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setShowSecondary(!showSecondary)}
                className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                <CaretDownIcon
                  size={16}
                  className={cn('transition-transform', showSecondary && 'rotate-180')}
                />
                보조 시술 {secondaryTreatments.length}개 보기
              </button>

              <AnimatePresence>
                {showSecondary && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 mt-3">
                      {secondaryTreatments.map((treatment, index) => (
                        <SecondaryTreatmentItem key={index} treatment={treatment} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* AI Reasoning Toggle */}
          <div className="mb-4">
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="flex items-center gap-2 text-sm text-[var(--cellora-dark-green)] hover:text-[var(--cellora-dark-green)]/80 font-medium transition-colors"
            >
              <SparkleIcon size={16} />
              AI 분석 근거 {showReasoning ? '숨기기' : '보기'}
            </button>

            <AnimatePresence>
              {showReasoning && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 p-4 rounded-xl bg-[var(--cellora-mint)]/10 border-2 border-[var(--cellora-mint)]/30">
                    <div className="flex items-center gap-2 mb-2">
                      <SparkleIcon size={14} weight="fill" className="text-[var(--cellora-dark-green)]" />
                      <span className="text-xs font-semibold text-[var(--cellora-dark-green)] uppercase tracking-wide">AI 분석</span>
                    </div>
                    <p className="text-sm text-[var(--foreground)] leading-relaxed">
                      {aiReasoning}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="primary" className="flex-1" onClick={onAccept}>
              <CheckCircleIcon size={18} weight="fill" />
              수락
            </Button>
            <Button variant="outline" className="flex-1" onClick={onModify}>
              <PencilIcon size={18} />
              수정
            </Button>
            <Button variant="ghost" onClick={onReject}>
              <XCircleIcon size={18} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SecondaryTreatmentItem({ treatment }: { treatment: RecommendedTreatment }) {
  return (
    <div className="p-4 rounded-xl bg-[var(--card)] border-2 border-[var(--border)] shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-base font-bold text-[var(--foreground)]">
            {treatment.nameEn}
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            {treatment.nameKo}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-lg font-bold text-[var(--cellora-dark-green)]">
              {Math.round(treatment.confidence * 100)}%
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="outline" size="sm">
          {treatment.sessions}회
        </Badge>
        <Badge variant="outline" size="sm">
          {treatment.interval} 간격
        </Badge>
        <Badge variant="outline" size="sm">
          {treatment.intensity}
        </Badge>
      </div>
      <p className="text-sm text-[var(--foreground)] leading-relaxed p-3 bg-[var(--muted)]/50 rounded-lg">
        {treatment.rationale}
      </p>
    </div>
  );
}
