'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface GlowingStatProps {
  label: string;
  value: number | string;
  suffix?: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  animate?: boolean;
  delay?: number;
  className?: string;
}

const severityColors = {
  low: {
    glow: 'rgba(208, 235, 186, 0.3)',
    text: 'text-cellora-mint',
    bg: 'bg-cellora-mint/10',
    border: 'border-cellora-mint/30',
  },
  medium: {
    glow: 'rgba(130, 114, 99, 0.3)',
    text: 'text-cellora-warm-gray',
    bg: 'bg-cellora-warm-gray/10',
    border: 'border-cellora-warm-gray/30',
  },
  high: {
    glow: 'rgba(234, 179, 8, 0.3)',
    text: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/30',
  },
  critical: {
    glow: 'rgba(239, 68, 68, 0.3)',
    text: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
  },
};

export function GlowingStat({
  label,
  value,
  suffix = '',
  description,
  severity = 'low',
  animate = true,
  delay = 0,
  className,
}: GlowingStatProps) {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value);
  const colors = severityColors[severity];

  useEffect(() => {
    if (!animate || typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }

    const timeout = setTimeout(() => {
      let startTime: number;
      const duration = 1500;

      const animateValue = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(eased * (value as number)));

        if (progress < 1) {
          requestAnimationFrame(animateValue);
        }
      };

      requestAnimationFrame(animateValue);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, animate, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className={cn(
        'relative p-4 rounded-xl border backdrop-blur-sm',
        colors.bg,
        colors.border,
        className
      )}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-xl blur-xl opacity-50"
        style={{ background: colors.glow }}
      />

      <div className="relative z-10">
        <p className="text-xs uppercase tracking-wider text-white/50 mb-1 font-mono">
          {label}
        </p>
        <p className={cn('text-3xl font-bold font-mono', colors.text)}>
          {displayValue}
          {suffix && <span className="text-lg ml-0.5">{suffix}</span>}
        </p>
        {description && (
          <p className="text-xs text-white/40 mt-1 font-mono">{description}</p>
        )}
      </div>
    </motion.div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  animate?: boolean;
  delay?: number;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  label,
  sublabel,
  severity = 'low',
  animate = true,
  delay = 0,
  className,
}: CircularProgressProps) {
  const [progress, setProgress] = useState(animate ? 0 : value);
  const colors = severityColors[severity];
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / max) * circumference;

  useEffect(() => {
    if (!animate) {
      setProgress(value);
      return;
    }

    const timeout = setTimeout(() => {
      let startTime: number;
      const duration = 1500;

      const animateProgress = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const elapsed = Math.min((currentTime - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - elapsed, 3);
        setProgress(eased * value);

        if (elapsed < 1) {
          requestAnimationFrame(animateProgress);
        }
      };

      requestAnimationFrame(animateProgress);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, animate, delay]);

  const gradientId = `circular-gradient-${label?.replace(/\s/g, '-') || 'default'}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className={cn('relative inline-flex items-center justify-center', className)}
    >
      {/* Glow */}
      <div
        className="absolute rounded-full blur-xl opacity-30"
        style={{
          width: size + 20,
          height: size + 20,
          background: colors.glow,
        }}
      />

      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.glow.replace('0.3', '1')} />
            <stop offset="100%" stopColor={colors.glow.replace('0.3', '0.5')} />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            filter: `drop-shadow(0 0 6px ${colors.glow})`,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span className={cn('text-2xl font-bold font-mono', colors.text)}>
          {Math.round(progress)}
        </span>
        {label && (
          <span className="text-[10px] uppercase tracking-wider text-white/50 font-mono">
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-[9px] text-white/30 font-mono">{sublabel}</span>
        )}
      </div>
    </motion.div>
  );
}

interface HorizontalBarProps {
  label: string;
  value: number;
  max?: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  showValue?: boolean;
  animate?: boolean;
  delay?: number;
  className?: string;
}

export function HorizontalBar({
  label,
  value,
  max = 100,
  severity = 'low',
  showValue = true,
  animate = true,
  delay = 0,
  className,
}: HorizontalBarProps) {
  const [width, setWidth] = useState(animate ? 0 : (value / max) * 100);
  const colors = severityColors[severity];

  useEffect(() => {
    if (!animate) {
      setWidth((value / max) * 100);
      return;
    }

    const timeout = setTimeout(() => {
      setWidth((value / max) * 100);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, max, animate, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: delay / 1000 }}
      className={cn('space-y-1', className)}
    >
      <div className="flex justify-between items-center">
        <span className="text-xs text-white/60 font-mono uppercase tracking-wide">
          {label}
        </span>
        {showValue && (
          <span className={cn('text-xs font-mono font-bold', colors.text)}>
            {value}
          </span>
        )}
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 1, delay: delay / 1000, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${colors.glow.replace('0.3', '0.8')}, ${colors.glow.replace('0.3', '1')})`,
            boxShadow: `0 0 10px ${colors.glow}`,
          }}
        />
      </div>
    </motion.div>
  );
}

interface PulsingDotProps {
  severity?: 'low' | 'medium' | 'high' | 'critical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PulsingDot({ severity = 'low', size = 'md', className }: PulsingDotProps) {
  const colors = severityColors[severity];
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span className={cn('relative inline-flex', className)}>
      <motion.span
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.7, 0, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={cn('absolute inline-flex rounded-full', sizes[size])}
        style={{ background: colors.glow.replace('0.3', '0.5') }}
      />
      <span
        className={cn('relative inline-flex rounded-full', sizes[size])}
        style={{ background: colors.glow.replace('0.3', '1') }}
      />
    </span>
  );
}
