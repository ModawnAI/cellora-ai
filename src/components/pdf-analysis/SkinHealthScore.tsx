'use client';

import { motion } from 'motion/react';
import { HeartIcon, TrendUpIcon, TrendDownIcon, MinusIcon } from '@phosphor-icons/react';

interface SkinHealthScoreProps {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  estimatedSkinAge?: number;
  actualAge?: number;
}

export function SkinHealthScore({
  score,
  grade,
  estimatedSkinAge,
  actualAge,
}: SkinHealthScoreProps) {
  const getGradeColor = (g: string) => {
    switch (g) {
      case 'A':
        return 'text-[var(--cellora-green)]';
      case 'B':
        return 'text-[var(--cellora-mint)]';
      case 'C':
        return 'text-[var(--cellora-warm-gray)]';
      case 'D':
        return 'text-[var(--cellora-brown)]';
      case 'F':
        return 'text-[var(--cellora-brown-dark)]';
      default:
        return 'text-[var(--cellora-warm-gray)]';
    }
  };

  const getScoreColor = (s: number) => {
    if (s >= 80) return '#72AE6C';
    if (s >= 60) return '#D0EBBA';
    if (s >= 40) return '#827263';
    if (s >= 20) return '#6D593E';
    return '#5A4832';
  };

  const ageDifference = estimatedSkinAge && actualAge ? estimatedSkinAge - actualAge : 0;

  const getAgeDifferenceIcon = () => {
    if (ageDifference < -2) return <TrendDownIcon weight="bold" className="w-5 h-5 text-[var(--cellora-green)]" />;
    if (ageDifference > 2) return <TrendUpIcon weight="bold" className="w-5 h-5 text-[var(--cellora-brown)]" />;
    return <MinusIcon weight="bold" className="w-5 h-5 text-[var(--cellora-warm-gray)]" />;
  };

  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <HeartIcon weight="fill" className="w-5 h-5 text-[var(--cellora-mint)]" />
        <h3 className="text-lg font-semibold text-[var(--cellora-dark-green)]">
          종합 피부 건강 점수
        </h3>
      </div>

      <div className="flex items-center justify-center gap-8">
        {/* Circular Progress */}
        <div className="relative">
          <svg className="w-40 h-40 transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="60"
              stroke="#E4E4E7"
              strokeWidth="12"
              fill="none"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="60"
              stroke={getScoreColor(score)}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-4xl font-bold text-[var(--cellora-dark-green)]"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {score}
            </motion.span>
            <span className="text-sm text-[var(--cellora-warm-gray)]">/ 100</span>
          </div>
        </div>

        {/* Grade and Age Info */}
        <div className="space-y-4">
          <div className="text-center">
            <span className="text-sm text-[var(--cellora-warm-gray)] block mb-1">
              등급
            </span>
            <motion.span
              className={`text-5xl font-bold ${getGradeColor(grade)}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              {grade}
            </motion.span>
          </div>

          {estimatedSkinAge && (
            <div className="border-t border-[var(--border)] pt-4">
              <div className="flex items-center gap-2 justify-center">
                {getAgeDifferenceIcon()}
                <div className="text-center">
                  <span className="text-sm text-[var(--cellora-warm-gray)] block">
                    피부 나이
                  </span>
                  <span className="text-2xl font-bold text-[var(--cellora-dark-green)]">
                    {estimatedSkinAge}세
                  </span>
                </div>
              </div>
              {actualAge && (
                <p className="text-xs text-center mt-2 text-[var(--cellora-warm-gray)]">
                  {ageDifference > 0 ? (
                    <span className="text-[var(--cellora-brown)]">
                      실제 나이보다 {ageDifference}세 높음
                    </span>
                  ) : ageDifference < 0 ? (
                    <span className="text-[var(--cellora-green)]">
                      실제 나이보다 {Math.abs(ageDifference)}세 젊음
                    </span>
                  ) : (
                    <span>실제 나이와 동일</span>
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
