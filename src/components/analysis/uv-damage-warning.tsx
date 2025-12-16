'use client';

import { motion } from 'motion/react';
import { SunHorizon, Warning, ShieldWarning, Lightbulb } from '@phosphor-icons/react';
import { MetaVuScores } from '@/lib/types';
import { cn } from '@/lib/utils';

interface UvDamageWarningProps {
  metaVuScores: MetaVuScores;
  className?: string;
}

export function UvDamageWarning({ metaVuScores, className }: UvDamageWarningProps) {
  const { brownSpots, uvSpots } = metaVuScores.pigmentation;
  const uvRatio = uvSpots.count / Math.max(1, brownSpots.count);

  // Don't render if UV damage is minimal
  if (uvRatio < 1.2) return null;

  const severity = uvRatio > 2 ? 'critical' : uvRatio > 1.5 ? 'warning' : 'info';

  const severityConfig = {
    critical: {
      bg: 'bg-gradient-to-r from-[#F5E6E6] to-[var(--cellora-brown-lighter)]',
      border: 'border-[#8B4513]/30',
      iconBg: 'bg-[#F5E6E6]',
      iconColor: 'text-[#8B4513]',
      titleColor: 'text-[#8B4513]',
      title: '심각한 UV 손상 감지',
      description: '눈에 보이지 않는 UV 손상이 현재 갈색반점보다 현저히 많습니다. 조기 치료를 강력히 권장합니다.',
    },
    warning: {
      bg: 'bg-gradient-to-r from-[var(--cellora-brown-lighter)] to-[#F5F0EA]',
      border: 'border-[var(--cellora-brown)]/30',
      iconBg: 'bg-[var(--cellora-brown-lighter)]',
      iconColor: 'text-[var(--cellora-brown)]',
      titleColor: 'text-[var(--cellora-brown-dark)]',
      title: 'UV 손상 주의 필요',
      description: 'UV 손상이 현재 갈색반점보다 많아 향후 색소침착 위험이 있습니다.',
    },
    info: {
      bg: 'bg-gradient-to-r from-[#E8EFEB] to-[var(--cellora-green-lighter)]',
      border: 'border-[var(--cellora-dark-green)]/20',
      iconBg: 'bg-[#E8EFEB]',
      iconColor: 'text-[var(--cellora-dark-green)]',
      titleColor: 'text-[var(--cellora-dark-green)]',
      title: 'UV 손상 모니터링 권장',
      description: 'UV 손상이 발견되었습니다. 정기적인 모니터링을 권장합니다.',
    },
  };

  const config = severityConfig[severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'rounded-xl p-4 border',
        config.bg,
        config.border,
        className
      )}
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className={cn(
          'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
          config.iconBg
        )}>
          {severity === 'critical' ? (
            <ShieldWarning size={24} className={config.iconColor} weight="fill" />
          ) : severity === 'warning' ? (
            <Warning size={24} className={config.iconColor} weight="fill" />
          ) : (
            <SunHorizon size={24} className={config.iconColor} weight="fill" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={cn('font-semibold mb-1', config.titleColor)}>
            {config.title}
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-3">
            {config.description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-white/60 rounded-lg p-2 text-center">
              <p className="text-xs text-[var(--muted-foreground)]">갈색반점</p>
              <p className="text-lg font-bold text-[var(--foreground)]">{brownSpots.count}</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">현재 보이는</p>
            </div>
            <div className="bg-[#E8EFEB]/60 rounded-lg p-2 text-center border border-[var(--cellora-dark-green)]/20">
              <p className="text-xs text-[var(--cellora-dark-green)] font-medium">UV손상</p>
              <p className="text-lg font-bold text-[var(--cellora-dark-green)]">{uvSpots.count}</p>
              <p className="text-[10px] text-[var(--cellora-green-dark)]">미래 색소</p>
            </div>
            <div className="bg-white/60 rounded-lg p-2 text-center">
              <p className="text-xs text-[var(--muted-foreground)]">UV/갈색 비율</p>
              <p className={cn(
                'text-lg font-bold',
                severity === 'critical' ? 'text-[#8B4513]' :
                severity === 'warning' ? 'text-[var(--cellora-brown)]' : 'text-[var(--cellora-dark-green)]'
              )}>
                {uvRatio.toFixed(1)}x
              </p>
              <p className="text-[10px] text-[var(--muted-foreground)]">
                {uvRatio > 2 ? '매우 높음' : uvRatio > 1.5 ? '높음' : '주의'}
              </p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="flex items-start gap-2 bg-white/40 rounded-lg p-2">
            <Lightbulb size={16} className="text-[var(--cellora-brown)] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[var(--muted-foreground)]">
              <span className="font-medium text-[var(--foreground)]">권장 조치: </span>
              {severity === 'critical' ? (
                '피코토닝 또는 레이저토닝 즉시 시작, 자외선 차단제 SPF 50+ 필수'
              ) : severity === 'warning' ? (
                '예방적 피코토닝 권장, 자외선 차단 강화'
              ) : (
                '정기적인 피부 분석 및 자외선 차단제 사용'
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
