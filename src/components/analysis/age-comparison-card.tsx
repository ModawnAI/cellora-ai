'use client';

import { motion } from 'motion/react';
import { ChartLine, TrendUp, TrendDown, Minus, Users } from '@phosphor-icons/react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { AgeComparison, getPercentileDescription } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AgeComparisonCardProps {
  ageComparison: AgeComparison;
  className?: string;
}

export function AgeComparisonCard({ ageComparison, className }: AgeComparisonCardProps) {
  const { ko: overallLabel, status: overallStatus } = getPercentileDescription(ageComparison.overallPercentile);

  const metricLabels: Record<keyof typeof ageComparison.metrics, string> = {
    pores: '모공',
    wrinkles: '주름',
    pigmentation: '색소침착',
    vascular: '홍조',
    texture: '피부결',
    sebum: '피지',
    moisture: '수분',
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 80) return 'text-[var(--cellora-green-dark)]';
    if (percentile >= 60) return 'text-[var(--cellora-green)]';
    if (percentile >= 40) return 'text-[var(--cellora-brown)]';
    return 'text-[#8B4513]';
  };

  const getPercentileBg = (percentile: number) => {
    if (percentile >= 80) return 'bg-[var(--cellora-green-lighter)]';
    if (percentile >= 60) return 'bg-[var(--cellora-green-lighter)]';
    if (percentile >= 40) return 'bg-[var(--cellora-brown-lighter)]';
    return 'bg-[#F5E6E6]';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ChartLine size={20} className="text-[var(--cellora-dark-green)]" />
            연령대 비교 분석
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            <Users size={12} className="mr-1" />
            {ageComparison.ageGroup}세 {ageComparison.sampleSize.toLocaleString()}명 기준
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Skin Age Comparison */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6 p-4 rounded-xl bg-gradient-to-br from-[var(--cellora-mint)]/20 to-[var(--cellora-mint)]/5 border border-[var(--cellora-mint)]/30"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--muted-foreground)]">피부 나이</span>
            <div className="flex items-center gap-2">
              {ageComparison.skinAgeDifference > 0 ? (
                <TrendDown size={16} className="text-[#8B4513]" />
              ) : ageComparison.skinAgeDifference < 0 ? (
                <TrendUp size={16} className="text-[var(--cellora-green-dark)]" />
              ) : (
                <Minus size={16} className="text-[var(--muted-foreground)]" />
              )}
              <span className={cn(
                'text-sm font-medium',
                ageComparison.skinAgeDifference > 0 ? 'text-[#8B4513]' :
                ageComparison.skinAgeDifference < 0 ? 'text-[var(--cellora-green-dark)]' :
                'text-[var(--muted-foreground)]'
              )}>
                {ageComparison.skinAgeDifference > 0 ? '+' : ''}{ageComparison.skinAgeDifference}세
              </span>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[var(--cellora-dark-green)]">
                  {ageComparison.skinAge}
                </span>
                <span className="text-lg text-[var(--muted-foreground)]">세</span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                실제 나이: {ageComparison.actualAge}세
              </p>
            </div>

            <div className="text-right">
              <div className={cn(
                'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium',
                overallStatus === 'excellent' ? 'bg-[var(--cellora-green-lighter)] text-[var(--cellora-green-dark)]' :
                overallStatus === 'good' ? 'bg-[var(--cellora-green-lighter)] text-[var(--cellora-green)]' :
                overallStatus === 'average' ? 'bg-[var(--cellora-brown-lighter)] text-[var(--cellora-brown)]' :
                'bg-[#F5E6E6] text-[#8B4513]'
              )}>
                {overallLabel}
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                상위 {100 - ageComparison.overallPercentile}%
              </p>
            </div>
          </div>
        </motion.div>

        {/* Metrics Comparison */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[var(--foreground)] mb-3">
            항목별 동일 연령대 비교
          </h4>

          {(Object.keys(ageComparison.metrics) as (keyof typeof ageComparison.metrics)[]).map((key, index) => {
            const metric = ageComparison.metrics[key];
            const { ko: label } = getPercentileDescription(metric.percentile);

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="flex items-center gap-3"
              >
                <span className="w-16 text-xs text-[var(--muted-foreground)]">
                  {metricLabels[key]}
                </span>

                {/* Progress Bar */}
                <div className="flex-1 relative">
                  <div className="h-2 rounded-full bg-[var(--muted)]/30 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.percentile}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className={cn(
                        'h-full rounded-full',
                        metric.percentile >= 80 ? 'bg-[var(--cellora-green-dark)]' :
                        metric.percentile >= 60 ? 'bg-[var(--cellora-green)]' :
                        metric.percentile >= 40 ? 'bg-[var(--cellora-brown)]' :
                        'bg-[#8B4513]'
                      )}
                    />
                  </div>

                  {/* Average marker */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[var(--foreground)]/30"
                    style={{ left: `${Math.min(95, metric.average)}%` }}
                    title={`평균: ${metric.average}`}
                  />
                </div>

                <div className="flex items-center gap-2 w-24 justify-end">
                  <span className={cn(
                    'text-xs font-medium w-8 text-right',
                    getPercentileColor(metric.percentile)
                  )}>
                    {metric.percentile}%
                  </span>
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded',
                    getPercentileBg(metric.percentile),
                    getPercentileColor(metric.percentile)
                  )}>
                    {label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <div className="flex items-center justify-center gap-4 text-[10px] text-[var(--muted-foreground)]">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[var(--cellora-green-dark)]" />
              <span>매우 우수 (80%+)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[var(--cellora-brown)]" />
              <span>보통 (40-60%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#8B4513]" />
              <span>관리 필요 (-40%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-0.5 h-3 bg-[var(--foreground)]/30" />
              <span>평균</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
