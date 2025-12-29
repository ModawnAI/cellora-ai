'use client';

import { motion } from 'motion/react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { SparkleIcon } from '@phosphor-icons/react';
import type { DetailedSkinMetrics } from '@/lib/pdf-skin-analysis/types';

interface SkinMetricsRadarProps {
  metrics?: DetailedSkinMetrics | null;
}

export function SkinMetricsRadar({ metrics }: SkinMetricsRadarProps) {
  if (!metrics) {
    return (
      <motion.div
        className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <SparkleIcon weight="fill" className="w-5 h-5 text-[var(--cellora-mint)]" />
          <h3 className="text-lg font-semibold text-[var(--cellora-dark-green)]">
            피부 지표 분석
          </h3>
        </div>
        <div className="h-[350px] flex items-center justify-center text-[var(--cellora-warm-gray)]">
          분석 데이터가 없습니다
        </div>
      </motion.div>
    );
  }

  const getScore = (category: keyof DetailedSkinMetrics): number => {
    const metric = metrics?.[category];
    if (metric && typeof metric === 'object' && 'overallScore' in metric) {
      return metric.overallScore ?? 50;
    }
    return 50;
  };

  const data = [
    {
      metric: '피부결',
      value: getScore('texture'),
      fullMark: 100,
    },
    {
      metric: '모공',
      value: getScore('pores'),
      fullMark: 100,
    },
    {
      metric: '주름',
      value: getScore('wrinkles'),
      fullMark: 100,
    },
    {
      metric: '색소',
      value: getScore('pigmentation'),
      fullMark: 100,
    },
    {
      metric: '혈관/홍조',
      value: getScore('vascular'),
      fullMark: 100,
    },
    {
      metric: '수분',
      value: getScore('hydration'),
      fullMark: 100,
    },
    {
      metric: '탄력',
      value: getScore('elasticity'),
      fullMark: 100,
    },
  ];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { metric: string; value: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-[var(--border)] rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-[var(--cellora-dark-green)]">
            {data.metric}
          </p>
          <p className="text-[var(--cellora-mint)]">
            점수: <span className="font-bold">{data.value}</span>/100
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <SparkleIcon weight="fill" className="w-5 h-5 text-[var(--cellora-mint)]" />
        <h3 className="text-lg font-semibold text-[var(--cellora-dark-green)]">
          피부 지표 분석
        </h3>
      </div>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#E4E4E7" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: '#172C23', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: '#827263', fontSize: 10 }}
            />
            <Radar
              name="피부 점수"
              dataKey="value"
              stroke="#72AE6C"
              fill="#D0EBBA"
              fillOpacity={0.6}
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-4 gap-2 mt-4">
        {data.map((item) => (
          <div
            key={item.metric}
            className="text-center p-2 rounded-lg bg-[var(--muted)]"
          >
            <span className="text-xs text-[var(--cellora-warm-gray)] block">
              {item.metric}
            </span>
            <span
              className={`text-sm font-bold ${
                item.value >= 70
                  ? 'text-[var(--cellora-green)]'
                  : item.value >= 50
                  ? 'text-[var(--cellora-warm-gray)]'
                  : 'text-[var(--cellora-brown)]'
              }`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
