import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-full',
          {
            // Sizes
            'px-2 py-0.5 text-[10px]': size === 'sm',
            'px-2.5 py-0.5 text-xs': size === 'md',
            'px-3 py-1 text-sm': size === 'lg',
            // Variants - Using brand palette
            'bg-[var(--muted)] text-[var(--foreground)]': variant === 'default',
            'bg-[var(--cellora-green-lighter)] text-[var(--cellora-green-dark)]': variant === 'success',
            'bg-[var(--cellora-brown-lighter)] text-[var(--cellora-brown-dark)]': variant === 'warning',
            'bg-[#F5E6E6] text-[#8B4513]': variant === 'error',
            'bg-[#E8EFEB] text-[var(--cellora-dark-green)]': variant === 'info',
            'border border-[var(--border)] text-[var(--muted-foreground)]': variant === 'outline',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';
