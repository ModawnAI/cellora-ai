'use client';

import { motion } from 'motion/react';
import {
  WarningIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  LightbulbIcon,
  ShieldCheckIcon,
} from '@phosphor-icons/react';

interface SkinConcern {
  concern: string;
  koreanName: string;
  severity: 'mild' | 'moderate' | 'severe';
  urgency: 'immediate' | 'soon' | 'routine';
}

interface SkinConcernsPanelProps {
  primaryConcerns: SkinConcern[];
  strengths: string[];
  areasForImprovement: string[];
  lifestyleRecommendations: string[];
}

const severityConfig = {
  mild: {
    label: '경미',
    color: 'text-[var(--cellora-green)] bg-[var(--cellora-green-lighter)]',
    icon: CheckCircleIcon,
  },
  moderate: {
    label: '중간',
    color: 'text-[var(--cellora-warm-gray)] bg-[var(--muted)]',
    icon: WarningIcon,
  },
  severe: {
    label: '심각',
    color: 'text-[var(--cellora-brown)] bg-[var(--cellora-brown-lighter)]',
    icon: WarningIcon,
  },
};

const urgencyConfig = {
  immediate: {
    label: '즉시',
    color: 'text-white bg-[var(--cellora-brown)]',
  },
  soon: {
    label: '조속히',
    color: 'text-[var(--cellora-dark-green)] bg-[var(--cellora-mint)]',
  },
  routine: {
    label: '정기',
    color: 'text-[var(--cellora-warm-gray)] bg-[var(--muted)]',
  },
};

export function SkinConcernsPanel({
  primaryConcerns,
  strengths,
  areasForImprovement,
  lifestyleRecommendations,
}: SkinConcernsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Primary Concerns */}
      <motion.div
        className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <WarningIcon weight="fill" className="w-5 h-5 text-[var(--cellora-brown)]" />
          <h3 className="text-lg font-semibold text-[var(--cellora-dark-green)]">
            주요 관심 사항
          </h3>
        </div>

        <div className="space-y-3">
          {primaryConcerns.map((concern, idx) => {
            const severity = severityConfig[concern.severity];
            const urgency = urgencyConfig[concern.urgency];
            const SeverityIcon = severity.icon;

            return (
              <motion.div
                key={idx}
                className="p-4 rounded-xl border border-[var(--border)] hover:shadow-sm transition-shadow"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${severity.color}`}>
                      <SeverityIcon weight="fill" className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--cellora-dark-green)]">
                        {concern.koreanName}
                      </h4>
                      <p className="text-sm text-[var(--cellora-warm-gray)]">
                        {concern.concern}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${severity.color}`}>
                      {severity.label}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${urgency.color}`}>
                      {urgency.label}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {primaryConcerns.length === 0 && (
            <div className="text-center py-8 text-[var(--cellora-warm-gray)]">
              <CheckCircleIcon weight="light" className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>특별한 관심 사항이 없습니다!</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Strengths and Improvements Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <motion.div
          className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheckIcon weight="fill" className="w-5 h-5 text-[var(--cellora-green)]" />
            <h3 className="text-lg font-semibold text-[var(--cellora-dark-green)]">
              피부 강점
            </h3>
          </div>

          <ul className="space-y-2">
            {strengths.map((strength, idx) => (
              <motion.li
                key={idx}
                className="flex items-start gap-2 text-sm"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
              >
                <CheckCircleIcon
                  weight="fill"
                  className="w-4 h-4 text-[var(--cellora-green)] mt-0.5 flex-shrink-0"
                />
                <span className="text-[var(--cellora-dark-green)]">{strength}</span>
              </motion.li>
            ))}
            {strengths.length === 0 && (
              <li className="text-[var(--cellora-warm-gray)] text-sm">
                분석 중...
              </li>
            )}
          </ul>
        </motion.div>

        {/* Areas for Improvement */}
        <motion.div
          className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpIcon weight="fill" className="w-5 h-5 text-[var(--cellora-mint)]" />
            <h3 className="text-lg font-semibold text-[var(--cellora-dark-green)]">
              개선 필요 영역
            </h3>
          </div>

          <ul className="space-y-2">
            {areasForImprovement.map((area, idx) => (
              <motion.li
                key={idx}
                className="flex items-start gap-2 text-sm"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
              >
                <ArrowUpIcon
                  weight="bold"
                  className="w-4 h-4 text-[var(--cellora-mint)] mt-0.5 flex-shrink-0"
                />
                <span className="text-[var(--cellora-dark-green)]">{area}</span>
              </motion.li>
            ))}
            {areasForImprovement.length === 0 && (
              <li className="text-[var(--cellora-warm-gray)] text-sm">
                분석 중...
              </li>
            )}
          </ul>
        </motion.div>
      </div>

      {/* Lifestyle Recommendations */}
      <motion.div
        className="bg-gradient-to-r from-[var(--cellora-mint)]/10 to-[var(--cellora-green-lighter)] rounded-2xl p-6 border border-[var(--cellora-mint)]/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <LightbulbIcon weight="fill" className="w-5 h-5 text-[var(--cellora-green)]" />
          <h3 className="text-lg font-semibold text-[var(--cellora-dark-green)]">
            생활 습관 권장 사항
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {lifestyleRecommendations.map((recommendation, idx) => (
            <motion.div
              key={idx}
              className="flex items-start gap-2 p-3 bg-white/50 rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + idx * 0.05 }}
            >
              <span className="w-6 h-6 rounded-full bg-[var(--cellora-green)] text-white text-xs flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>
              <span className="text-sm text-[var(--cellora-dark-green)]">
                {recommendation}
              </span>
            </motion.div>
          ))}
          {lifestyleRecommendations.length === 0 && (
            <div className="col-span-2 text-center py-4 text-[var(--cellora-warm-gray)]">
              권장 사항을 분석 중입니다...
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
