'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import {
  Drop,
  Sun,
  Sparkle,
  Heart,
  Lightning,
  Virus,
  Wind,
  CirclesFour,
  ArrowUp,
  ArrowDown,
  Minus,
} from '@phosphor-icons/react';

interface MetricData {
  id: string;
  label: string;
  koreanLabel: string;
  score: number;
  icon: typeof Drop;
  trend?: 'up' | 'down' | 'stable';
  details?: { label: string; value: number }[];
}

interface AnimatedMetricsDashboardProps {
  metrics: {
    texture: { overallScore: number; roughnessIndex: number; uniformityIndex: number };
    pores: { overallScore: number; totalCount: number; density: number };
    wrinkles: { overallScore: number; totalCount: number };
    pigmentation: { overallScore: number; evenness: number };
    vascular: { overallScore: number; rednessLevel: number };
    hydration: { overallScore: number; moistureLevel: number; sebumLevel: number };
    elasticity: { overallScore: number; firmness: number };
  };
  className?: string;
}

function AnimatedNumber({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const steps = 60;
    const stepValue = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, duration, isInView]);

  return <span ref={ref}>{displayValue}</span>;
}

function CircularProgress({ score, size = 120, strokeWidth = 8 }: { score: number; size?: number; strokeWidth?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true });
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setProgress(score), 100);
      return () => clearTimeout(timer);
    }
  }, [score, isInView]);

  const getScoreColor = (s: number) => {
    if (s >= 90) return '#22c55e';
    if (s >= 80) return '#D0EBBA';
    if (s >= 70) return '#eab308';
    return '#f97316';
  };

  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg ref={ref} width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={getScoreColor(score)}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{
          strokeDasharray: circumference,
        }}
      />
    </svg>
  );
}

function MetricCard({
  metric,
  index,
}: {
  metric: MetricData;
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const Icon = metric.icon;

  const getScoreColor = (s: number) => {
    if (s >= 90) return 'text-green-400';
    if (s >= 80) return 'text-cellora-mint';
    if (s >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreGlow = (s: number) => {
    if (s >= 90) return 'rgba(34, 197, 94, 0.3)';
    if (s >= 80) return 'rgba(208, 235, 186, 0.3)';
    if (s >= 70) return 'rgba(234, 179, 8, 0.3)';
    return 'rgba(249, 115, 22, 0.3)';
  };

  const TrendIcon = metric.trend === 'up' ? ArrowUp : metric.trend === 'down' ? ArrowDown : Minus;
  const trendColor = metric.trend === 'up' ? 'text-green-400' : metric.trend === 'down' ? 'text-red-400' : 'text-cellora-warm-gray';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: getScoreGlow(metric.score),
          filter: 'blur(20px)',
        }}
      />

      {/* Card */}
      <div className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 group-hover:border-cellora-mint/30 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-cellora-mint/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Icon size={24} weight="fill" className="text-cellora-mint" />
          </div>

          {/* Circular progress */}
          <div className="relative">
            <CircularProgress score={metric.score} size={60} strokeWidth={6} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-sm font-bold ${getScoreColor(metric.score)}`}>
                <AnimatedNumber value={metric.score} />
              </span>
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="mb-3">
          <h3 className="text-white font-semibold text-lg">{metric.label}</h3>
          <p className="text-cellora-warm-gray text-sm">{metric.koreanLabel}</p>
        </div>

        {/* Trend indicator */}
        {metric.trend && (
          <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
            <TrendIcon size={14} weight="bold" />
            <span>{metric.trend === 'up' ? 'Improving' : metric.trend === 'down' ? 'Needs attention' : 'Stable'}</span>
          </div>
        )}

        {/* Hover details */}
        <AnimatePresence>
          {isHovered && metric.details && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 pt-4 border-t border-white/10"
            >
              <div className="space-y-2">
                {metric.details.map((detail, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-cellora-warm-gray">{detail.label}</span>
                    <span className={getScoreColor(detail.value)}>{detail.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function AnimatedMetricsDashboard({ metrics, className = '' }: AnimatedMetricsDashboardProps) {
  const metricCards: MetricData[] = [
    {
      id: 'texture',
      label: 'Texture',
      koreanLabel: '피부결',
      score: metrics.texture.overallScore,
      icon: Sparkle,
      trend: metrics.texture.overallScore >= 80 ? 'up' : 'stable',
      details: [
        { label: 'Roughness', value: metrics.texture.roughnessIndex },
        { label: 'Uniformity', value: metrics.texture.uniformityIndex },
      ],
    },
    {
      id: 'pores',
      label: 'Pores',
      koreanLabel: '모공',
      score: metrics.pores.overallScore,
      icon: CirclesFour,
      trend: 'stable',
      details: [
        { label: 'Count', value: metrics.pores.totalCount },
        { label: 'Density', value: Math.round(metrics.pores.density * 10) },
      ],
    },
    {
      id: 'wrinkles',
      label: 'Wrinkles',
      koreanLabel: '주름',
      score: metrics.wrinkles.overallScore,
      icon: Wind,
      trend: metrics.wrinkles.overallScore >= 80 ? 'up' : 'down',
      details: [
        { label: 'Total Count', value: metrics.wrinkles.totalCount },
      ],
    },
    {
      id: 'pigmentation',
      label: 'Pigmentation',
      koreanLabel: '색소침착',
      score: metrics.pigmentation.overallScore,
      icon: Sun,
      trend: metrics.pigmentation.evenness >= 80 ? 'up' : 'stable',
      details: [
        { label: 'Evenness', value: metrics.pigmentation.evenness },
      ],
    },
    {
      id: 'vascular',
      label: 'Vascular',
      koreanLabel: '혈관/홍조',
      score: metrics.vascular.overallScore,
      icon: Virus,
      trend: metrics.vascular.rednessLevel <= 30 ? 'up' : 'down',
      details: [
        { label: 'Redness Level', value: 100 - metrics.vascular.rednessLevel },
      ],
    },
    {
      id: 'hydration',
      label: 'Hydration',
      koreanLabel: '수분',
      score: metrics.hydration.overallScore,
      icon: Drop,
      trend: metrics.hydration.moistureLevel >= 70 ? 'up' : 'down',
      details: [
        { label: 'Moisture', value: metrics.hydration.moistureLevel },
        { label: 'Sebum', value: metrics.hydration.sebumLevel },
      ],
    },
    {
      id: 'elasticity',
      label: 'Elasticity',
      koreanLabel: '탄력',
      score: metrics.elasticity.overallScore,
      icon: Heart,
      trend: metrics.elasticity.firmness >= 80 ? 'up' : 'stable',
      details: [
        { label: 'Firmness', value: metrics.elasticity.firmness },
      ],
    },
  ];

  // Calculate overall average
  const averageScore = Math.round(
    metricCards.reduce((sum, m) => sum + m.score, 0) / metricCards.length
  );

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header with overall score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-cellora-mint/10 border border-cellora-mint/20 mb-4">
          <Lightning size={20} weight="fill" className="text-cellora-mint" />
          <span className="text-cellora-mint font-medium">Detailed Metrics</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Skin Health Analysis</h2>
        <p className="text-cellora-warm-gray">
          Average Score: <span className="text-cellora-mint font-semibold">{averageScore}/100</span>
        </p>
      </motion.div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
          <MetricCard key={metric.id} metric={metric} index={index} />
        ))}
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center gap-6 text-sm"
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="text-cellora-warm-gray">Excellent (90+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cellora-mint" />
          <span className="text-cellora-warm-gray">Good (80+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="text-cellora-warm-gray">Fair (70+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-400" />
          <span className="text-cellora-warm-gray">Focus Area</span>
        </div>
      </motion.div>
    </div>
  );
}
