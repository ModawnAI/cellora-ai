'use client';

import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import { motion } from 'motion/react';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', loading, disabled, children, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: isDisabled ? 1 : 1.02 }}
        whileTap={{ scale: isDisabled ? 1 : 0.98 }}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
          {
            // Sizes
            'h-8 px-3 text-xs gap-1.5': size === 'sm',
            'h-10 px-4 text-sm gap-2': size === 'md',
            'h-12 px-6 text-base gap-2': size === 'lg',
            'h-10 w-10': size === 'icon',
            // Variants
            'bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--muted)]/80': variant === 'default',
            'bg-[var(--cellora-mint)] text-[var(--cellora-dark-green)] hover:bg-[var(--cellora-mint)]/90 shadow-lg shadow-[var(--cellora-mint)]/20': variant === 'primary',
            'bg-[var(--cellora-dark-green)] text-[var(--cellora-mint)] hover:bg-[var(--cellora-dark-green)]/90': variant === 'secondary',
            'bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]': variant === 'ghost',
            'border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--muted)]': variant === 'outline',
            'bg-[#F5E6E6] text-[#8B4513] hover:bg-[#EDD9D9]': variant === 'danger',
            // Disabled
            'opacity-50 cursor-not-allowed': isDisabled,
          },
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';
