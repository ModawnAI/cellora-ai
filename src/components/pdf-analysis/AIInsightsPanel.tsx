'use client';

import { motion } from 'motion/react';
import {
  BrainIcon,
  EyeIcon,
  ShieldWarningIcon,
  SparkleIcon,
  TargetIcon,
  ClipboardIcon,
} from '@phosphor-icons/react';

interface AIInsightsPanelProps {
  overallAssessment: string;
  hiddenConcerns: string[];
  preventiveAdvice: string[];
  urgentAttention: string[];
  positiveFindings: string[];
  customizedProtocol: string;
}

export function AIInsightsPanel({
  overallAssessment,
  hiddenConcerns,
  preventiveAdvice,
  urgentAttention,
  positiveFindings,
  customizedProtocol,
}: AIInsightsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Overall Assessment */}
      <motion.div
        className="bg-gradient-to-br from-[var(--cellora-dark-green)] to-[#1a3529] rounded-2xl p-6 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <BrainIcon weight="fill" className="w-6 h-6 text-[var(--cellora-mint)]" />
          <h3 className="text-xl font-semibold">AI 종합 평가</h3>
        </div>
        <p className="text-lg leading-relaxed opacity-90">
          {overallAssessment || '분석 결과를 준비 중입니다...'}
        </p>
      </motion.div>

      {/* Urgent Attention */}
      {urgentAttention.length > 0 && (
        <motion.div
          className="bg-[var(--cellora-brown-lighter)] border border-[var(--cellora-brown)]/30 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <ShieldWarningIcon weight="fill" className="w-5 h-5 text-[var(--cellora-brown)]" />
            <h3 className="text-lg font-semibold text-[var(--cellora-brown-dark)]">
              긴급 주의 사항
            </h3>
          </div>
          <ul className="space-y-2">
            {urgentAttention.map((item, idx) => (
              <motion.li
                key={idx}
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
              >
                <span className="w-2 h-2 rounded-full bg-[var(--cellora-brown)] mt-2 flex-shrink-0" />
                <span className="text-[var(--cellora-brown-dark)]">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Hidden Concerns & Preventive Advice */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Hidden Concerns */}
        <motion.div
          className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <EyeIcon weight="fill" className="w-5 h-5 text-[var(--cellora-warm-gray)]" />
            <h3 className="text-lg font-semibold text-[var(--cellora-dark-green)]">
              숨겨진 문제점
            </h3>
          </div>
          <p className="text-xs text-[var(--cellora-warm-gray)] mb-3">
            육안으로 확인되지 않지만 AI가 감지한 잠재적 문제
          </p>
          <ul className="space-y-2">
            {hiddenConcerns.map((concern, idx) => (
              <motion.li
                key={idx}
                className="flex items-start gap-2 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
              >
                <EyeIcon weight="duotone" className="w-4 h-4 text-[var(--cellora-warm-gray)] mt-0.5 flex-shrink-0" />
                <span className="text-[var(--cellora-dark-green)]">{concern}</span>
              </motion.li>
            ))}
            {hiddenConcerns.length === 0 && (
              <li className="text-[var(--cellora-warm-gray)] text-sm">
                특별히 감지된 숨겨진 문제가 없습니다.
              </li>
            )}
          </ul>
        </motion.div>

        {/* Preventive Advice */}
        <motion.div
          className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TargetIcon weight="fill" className="w-5 h-5 text-[var(--cellora-mint)]" />
            <h3 className="text-lg font-semibold text-[var(--cellora-dark-green)]">
              예방적 조언
            </h3>
          </div>
          <p className="text-xs text-[var(--cellora-warm-gray)] mb-3">
            미래의 피부 문제를 예방하기 위한 조언
          </p>
          <ul className="space-y-2">
            {preventiveAdvice.map((advice, idx) => (
              <motion.li
                key={idx}
                className="flex items-start gap-2 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
              >
                <TargetIcon weight="duotone" className="w-4 h-4 text-[var(--cellora-mint)] mt-0.5 flex-shrink-0" />
                <span className="text-[var(--cellora-dark-green)]">{advice}</span>
              </motion.li>
            ))}
            {preventiveAdvice.length === 0 && (
              <li className="text-[var(--cellora-warm-gray)] text-sm">
                분석 중입니다...
              </li>
            )}
          </ul>
        </motion.div>
      </div>

      {/* Positive Findings */}
      {positiveFindings.length > 0 && (
        <motion.div
          className="bg-[var(--cellora-green-lighter)] border border-[var(--cellora-green)]/30 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <SparkleIcon weight="fill" className="w-5 h-5 text-[var(--cellora-green)]" />
            <h3 className="text-lg font-semibold text-[var(--cellora-green-dark)]">
              긍정적인 발견
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {positiveFindings.map((finding, idx) => (
              <motion.span
                key={idx}
                className="px-3 py-2 bg-white/70 rounded-lg text-sm text-[var(--cellora-green-dark)] border border-[var(--cellora-green)]/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.05 }}
              >
                ✓ {finding}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Customized Protocol */}
      {customizedProtocol && (
        <motion.div
          className="bg-white rounded-2xl p-6 border-2 border-[var(--cellora-mint)] shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <ClipboardIcon weight="fill" className="w-5 h-5 text-[var(--cellora-dark-green)]" />
            <h3 className="text-lg font-semibold text-[var(--cellora-dark-green)]">
              맞춤형 관리 프로토콜
            </h3>
          </div>
          <div className="bg-[var(--muted)] p-4 rounded-xl">
            <p className="text-[var(--cellora-dark-green)] leading-relaxed whitespace-pre-wrap">
              {customizedProtocol}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
