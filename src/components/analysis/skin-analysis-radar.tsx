'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { SkinScores, scoreLabels } from '@/lib/types';
import { cn, getScoreColor } from '@/lib/utils';

interface SkinAnalysisRadarProps {
  scores: SkinScores;
  size?: number;
}

export function SkinAnalysisRadar({ scores, size = 280 }: SkinAnalysisRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const metrics = Object.keys(scores) as (keyof SkinScores)[];
  const center = size / 2;
  const maxRadius = (size / 2) - 40;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw grid circles
    const gridLevels = [20, 40, 60, 80, 100];
    ctx.strokeStyle = 'rgba(23, 44, 35, 0.15)';
    ctx.lineWidth = 1;

    gridLevels.forEach((level) => {
      const radius = (level / 100) * maxRadius;
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw axis lines
    const angleStep = (Math.PI * 2) / metrics.length;
    metrics.forEach((_, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const x = center + Math.cos(angle) * maxRadius;
      const y = center + Math.sin(angle) * maxRadius;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(x, y);
      ctx.stroke();
    });

    // Draw data polygon
    ctx.beginPath();
    metrics.forEach((metric, index) => {
      const value = scores[metric];
      const angle = angleStep * index - Math.PI / 2;
      const radius = (value / 100) * maxRadius;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();

    // Fill with gradient
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, maxRadius);
    gradient.addColorStop(0, 'rgba(208, 235, 186, 0.3)');
    gradient.addColorStop(1, 'rgba(208, 235, 186, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Stroke
    ctx.strokeStyle = '#D0EBBA';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw data points
    metrics.forEach((metric, index) => {
      const value = scores[metric];
      const angle = angleStep * index - Math.PI / 2;
      const radius = (value / 100) * maxRadius;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#D0EBBA';
      ctx.fill();
      ctx.strokeStyle = '#172C23';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [scores, size, center, maxRadius, metrics]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="absolute inset-0"
      />

      {/* Labels */}
      {metrics.map((metric, index) => {
        const angleStep = (Math.PI * 2) / metrics.length;
        const angle = angleStep * index - Math.PI / 2;
        const labelRadius = maxRadius + 25;
        const x = center + Math.cos(angle) * labelRadius;
        const y = center + Math.sin(angle) * labelRadius;

        return (
          <motion.div
            key={metric}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="absolute flex flex-col items-center"
            style={{
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <span className="text-[10px] text-[var(--muted-foreground)] whitespace-nowrap">
              {scoreLabels[metric].ko}
            </span>
            <span className={cn('text-xs font-bold', getScoreColor(scores[metric]))}>
              {scores[metric]}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
