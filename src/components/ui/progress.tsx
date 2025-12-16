'use client';

import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import { motion } from 'motion/react';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, variant = 'default', showLabel = false, size = 'md', ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const getVariantColor = () => {
      if (variant === 'success') return 'bg-[var(--cellora-green)]';
      if (variant === 'warning') return 'bg-[var(--cellora-brown)]';
      if (variant === 'error') return 'bg-[#8B4513]';
      if (percentage < 40) return 'bg-[var(--cellora-green)]';
      if (percentage < 70) return 'bg-[var(--cellora-brown)]';
      return 'bg-[#8B4513]';
    };

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {showLabel && (
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[var(--muted-foreground)]">진행률</span>
            <span className="text-[var(--foreground)] font-medium">{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          className={cn(
            'w-full bg-[var(--muted)] rounded-full overflow-hidden',
            {
              'h-1': size === 'sm',
              'h-2': size === 'md',
              'h-3': size === 'lg',
            }
          )}
        >
          <motion.div
            className={cn('h-full rounded-full', getVariantColor())}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = 'Progress';
