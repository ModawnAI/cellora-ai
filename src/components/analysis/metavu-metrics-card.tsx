'use client';

import { motion } from 'motion/react';
import {
  WarningCircle,
  Drop,
  Sun,
  Eye,
  CirclesFour,
  Sparkle,
  WaveSawtooth,
} from '@phosphor-icons/react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { MetaVuScores, metaVuScoreLabels, getSeverityFromScore, severityColors } from '@/lib/types';
import { cn, getScoreColor, getScoreBgColor } from '@/lib/utils';

interface MetaVuMetricsCardProps {
  metaVuScores: MetaVuScores;
  className?: string;
}

export function MetaVuMetricsCard({ metaVuScores, className }: MetaVuMetricsCardProps) {
  const metrics = [
    {
      key: 'pores',
      icon: CirclesFour,
      label: metaVuScoreLabels.pores.ko,
      score: metaVuScores.pores.score,
      details: [
        { label: '총 모공', value: metaVuScores.pores.totalCount.toLocaleString(), unit: '개' },
        { label: '확대모공', value: metaVuScores.pores.large.toLocaleString(), unit: '개', highlight: metaVuScores.pores.large > 300 },
        { label: '중간모공', value: metaVuScores.pores.medium.toLocaleString(), unit: '개' },
        { label: '미세모공', value: metaVuScores.pores.small.toLocaleString(), unit: '개' },
      ],
      breakdown: {
        large: metaVuScores.pores.large,
        medium: metaVuScores.pores.medium,
        small: metaVuScores.pores.small,
      },
    },
    {
      key: 'wrinkles',
      icon: WaveSawtooth,
      label: metaVuScoreLabels.wrinkles.ko,
      score: metaVuScores.wrinkles.score,
      details: [
        { label: '총 주름', value: metaVuScores.wrinkles.totalCount.toString(), unit: '개' },
        { label: '깊은주름', value: metaVuScores.wrinkles.deep.toString(), unit: '개', highlight: metaVuScores.wrinkles.deep > 10 },
        { label: '중간주름', value: metaVuScores.wrinkles.intermediate.toString(), unit: '개' },
        { label: '잔주름', value: metaVuScores.wrinkles.light.toString(), unit: '개' },
      ],
      breakdown: {
        deep: metaVuScores.wrinkles.deep,
        intermediate: metaVuScores.wrinkles.intermediate,
        light: metaVuScores.wrinkles.light,
      },
    },
    {
      key: 'pigmentation',
      icon: Sun,
      label: metaVuScoreLabels.pigmentation.ko,
      score: metaVuScores.pigmentation.score,
      details: [
        { label: '갈색반점', value: metaVuScores.pigmentation.brownSpots.count.toString(), unit: '개' },
        {
          label: 'UV손상',
          value: metaVuScores.pigmentation.uvSpots.count.toString(),
          unit: '개',
          highlight: true,
          isUV: true,
        },
        { label: '갈색면적', value: metaVuScores.pigmentation.brownSpots.area.toString(), unit: 'mm²' },
        { label: 'UV면적', value: metaVuScores.pigmentation.uvSpots.area.toString(), unit: 'mm²' },
      ],
      uvRatio: metaVuScores.pigmentation.uvSpots.count / Math.max(1, metaVuScores.pigmentation.brownSpots.count),
    },
    {
      key: 'vascular',
      icon: Drop,
      label: metaVuScoreLabels.vascular.ko,
      score: metaVuScores.vascular.score,
      details: [
        { label: '붉은반점', value: metaVuScores.vascular.redSpots.count.toString(), unit: '개' },
        { label: '면적', value: metaVuScores.vascular.redSpots.area.toString(), unit: 'mm²' },
        { label: '밀도', value: metaVuScores.vascular.redSpots.density.toString(), unit: '/cm²' },
      ],
    },
    {
      key: 'texture',
      icon: Sparkle,
      label: metaVuScoreLabels.texture.ko,
      score: metaVuScores.texture.score,
      details: [
        { label: '거칠기', value: metaVuScores.texture.roughness.toString(), unit: '/100' },
        { label: '균일도', value: metaVuScores.texture.uniformity.toString(), unit: '/100' },
      ],
    },
    {
      key: 'sebum',
      icon: WarningCircle,
      label: metaVuScoreLabels.sebum.ko,
      score: metaVuScores.sebum.score,
      details: [
        { label: '피지량', value: metaVuScores.sebum.level.toString(), unit: '/100' },
        {
          label: '분포',
          value: metaVuScores.sebum.distribution === 'tzone' ? 'T존 집중' :
                 metaVuScores.sebum.distribution === 'patchy' ? '불규칙' : '균일',
        },
      ],
    },
    {
      key: 'moisture',
      icon: Eye,
      label: metaVuScoreLabels.moisture.ko,
      score: metaVuScores.moisture.score,
      details: [
        { label: '수분량', value: metaVuScores.moisture.level.toString(), unit: '/100' },
        {
          label: '분포',
          value: metaVuScores.moisture.distribution === 'dry-patches' ? '건조부위 있음' :
                 metaVuScores.moisture.distribution === 'mixed' ? '복합' : '균일',
        },
      ],
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">Meta-Vu 3D 상세 분석</span>
            <Badge variant="success" className="text-[10px]">
              고정밀 측정
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const severity = getSeverityFromScore(metric.score);

            return (
              <motion.div
                key={metric.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={cn(
                  'p-4 rounded-xl border border-[var(--border)] transition-all hover:shadow-md',
                  getScoreBgColor(metric.score)
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      severity === 'critical' ? 'bg-[#F5E6E6]' :
                      severity === 'high' ? 'bg-[var(--cellora-brown-lighter)]' :
                      severity === 'medium' ? 'bg-[var(--cellora-brown-lighter)]' : 'bg-[var(--cellora-green-lighter)]'
                    )}>
                      <Icon
                        size={18}
                        className={cn(
                          severity === 'critical' ? 'text-[#8B4513]' :
                          severity === 'high' ? 'text-[var(--cellora-brown-dark)]' :
                          severity === 'medium' ? 'text-[var(--cellora-brown)]' : 'text-[var(--cellora-green-dark)]'
                        )}
                      />
                    </div>
                    <span className="font-medium text-[var(--foreground)]">
                      {metric.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={cn('text-xl font-bold', getScoreColor(metric.score))}>
                      {metric.score}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">/100</span>
                  </div>
                </div>

                {/* UV Warning for Pigmentation */}
                {'uvRatio' in metric && typeof metric.uvRatio === 'number' && metric.uvRatio > 1.5 && (
                  <div className="mb-3 p-2 rounded-lg bg-[#E8EFEB] border border-[var(--cellora-dark-green)]/20">
                    <p className="text-[10px] font-medium text-[var(--cellora-dark-green)]">
                      UV 손상이 갈색반점의 {metric.uvRatio.toFixed(1)}배
                    </p>
                  </div>
                )}

                {/* Breakdown Bar (for pores/wrinkles) */}
                {'breakdown' in metric && metric.breakdown && (
                  <div className="mb-3">
                    <div className="h-2 rounded-full overflow-hidden flex bg-[var(--muted)]/30">
                      {'large' in metric.breakdown && metric.breakdown.large !== undefined && metric.breakdown.medium !== undefined && metric.breakdown.small !== undefined && (
                        <>
                          <div
                            className="h-full bg-[#8B4513]"
                            style={{ width: `${(metric.breakdown.large / (metric.breakdown.large + metric.breakdown.medium + metric.breakdown.small)) * 100}%` }}
                          />
                          <div
                            className="h-full bg-[var(--cellora-brown)]"
                            style={{ width: `${(metric.breakdown.medium / (metric.breakdown.large + metric.breakdown.medium + metric.breakdown.small)) * 100}%` }}
                          />
                          <div
                            className="h-full bg-[var(--cellora-green)]"
                            style={{ width: `${(metric.breakdown.small / (metric.breakdown.large + metric.breakdown.medium + metric.breakdown.small)) * 100}%` }}
                          />
                        </>
                      )}
                      {'deep' in metric.breakdown && metric.breakdown.deep !== undefined && metric.breakdown.intermediate !== undefined && metric.breakdown.light !== undefined && (
                        <>
                          <div
                            className="h-full bg-[#8B4513]"
                            style={{ width: `${(metric.breakdown.deep / (metric.breakdown.deep + metric.breakdown.intermediate + metric.breakdown.light)) * 100}%` }}
                          />
                          <div
                            className="h-full bg-[var(--cellora-brown)]"
                            style={{ width: `${(metric.breakdown.intermediate / (metric.breakdown.deep + metric.breakdown.intermediate + metric.breakdown.light)) * 100}%` }}
                          />
                          <div
                            className="h-full bg-[var(--cellora-green)]"
                            style={{ width: `${(metric.breakdown.light / (metric.breakdown.deep + metric.breakdown.intermediate + metric.breakdown.light)) * 100}%` }}
                          />
                        </>
                      )}
                    </div>
                    <div className="flex justify-between mt-1 text-[9px] text-[var(--muted-foreground)]">
                      {'large' in metric.breakdown ? (
                        <>
                          <span>확대</span>
                          <span>중간</span>
                          <span>미세</span>
                        </>
                      ) : (
                        <>
                          <span>깊은</span>
                          <span>중간</span>
                          <span>잔</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Details */}
                <div className="space-y-1.5">
                  {metric.details.map((detail, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className={cn(
                        'text-[var(--muted-foreground)]',
                        'highlight' in detail && detail.highlight && 'font-medium text-[var(--foreground)]'
                      )}>
                        {detail.label}
                      </span>
                      <span className={cn(
                        'font-medium',
                        'highlight' in detail && detail.highlight ? 'text-[var(--cellora-brown-dark)]' :
                        'isUV' in detail && detail.isUV ? 'text-[var(--cellora-dark-green)]' :
                        'text-[var(--foreground)]'
                      )}>
                        {detail.value}
                        {detail.unit && <span className="text-[var(--muted-foreground)] ml-0.5">{detail.unit}</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
