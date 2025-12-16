'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface AnimatedGridProps {
  className?: string;
  gridColor?: string;
  pulseColor?: string;
  duration?: number;
}

export function AnimatedGrid({
  className,
  gridColor = 'rgba(208, 235, 186, 0.03)',
  pulseColor = 'rgba(208, 235, 186, 0.08)',
  duration = 4,
}: AnimatedGridProps) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* Static grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(${gridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Animated pulse lines - horizontal */}
      <motion.div
        animate={{
          y: ['0%', '100%'],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${pulseColor}, transparent)`,
          boxShadow: `0 0 20px 2px ${pulseColor}`,
        }}
      />

      <motion.div
        animate={{
          y: ['100%', '0%'],
        }}
        transition={{
          duration: duration * 1.3,
          repeat: Infinity,
          ease: 'linear',
          delay: duration * 0.5,
        }}
        className="absolute left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${pulseColor}, transparent)`,
          boxShadow: `0 0 20px 2px ${pulseColor}`,
        }}
      />

      {/* Animated pulse lines - vertical */}
      <motion.div
        animate={{
          x: ['0%', '100%'],
        }}
        transition={{
          duration: duration * 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute top-0 bottom-0 w-px"
        style={{
          background: `linear-gradient(180deg, transparent, ${pulseColor}, transparent)`,
          boxShadow: `0 0 20px 2px ${pulseColor}`,
        }}
      />

      <motion.div
        animate={{
          x: ['100%', '0%'],
        }}
        transition={{
          duration: duration * 1.2,
          repeat: Infinity,
          ease: 'linear',
          delay: duration * 0.3,
        }}
        className="absolute top-0 bottom-0 w-px"
        style={{
          background: `linear-gradient(180deg, transparent, ${pulseColor}, transparent)`,
          boxShadow: `0 0 20px 2px ${pulseColor}`,
        }}
      />

      {/* Corner glow effects */}
      <div
        className="absolute top-0 left-0 w-40 h-40 opacity-30"
        style={{
          background: `radial-gradient(circle at 0 0, ${pulseColor}, transparent 70%)`,
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-40 h-40 opacity-30"
        style={{
          background: `radial-gradient(circle at 100% 100%, ${pulseColor}, transparent 70%)`,
        }}
      />
    </div>
  );
}

interface GridDotBackgroundProps {
  className?: string;
  dotColor?: string;
  dotSize?: number;
  spacing?: number;
}

export function GridDotBackground({
  className,
  dotColor = 'rgba(208, 235, 186, 0.15)',
  dotSize = 1,
  spacing = 30,
}: GridDotBackgroundProps) {
  return (
    <div
      className={cn('absolute inset-0', className)}
      style={{
        backgroundImage: `radial-gradient(circle, ${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${spacing}px ${spacing}px`,
      }}
    />
  );
}

interface GlowingBorderProps {
  className?: string;
  borderColor?: string;
  glowColor?: string;
  children: React.ReactNode;
}

export function GlowingBorder({
  className,
  borderColor = 'rgba(208, 235, 186, 0.2)',
  glowColor = 'rgba(208, 235, 186, 0.1)',
  children,
}: GlowingBorderProps) {
  return (
    <motion.div
      className={cn('relative', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Outer glow */}
      <div
        className="absolute -inset-px rounded-2xl blur-sm"
        style={{ background: glowColor }}
      />

      {/* Border */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{ border: `1px solid ${borderColor}` }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
