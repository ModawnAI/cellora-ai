'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  showRadialGradient?: boolean;
}

export function AuroraBackground({
  children,
  className,
  showRadialGradient = true,
}: AuroraBackgroundProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col min-h-screen w-full items-center justify-center bg-black overflow-hidden',
        className
      )}
    >
      {/* Aurora gradient layers */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className={cn(
            'absolute inset-0',
            '[--aurora-mint:rgba(208,235,186,0.4)]',
            '[--aurora-dark-green:rgba(23,44,35,0.8)]',
            '[--aurora-warm-gray:rgba(130,114,99,0.3)]',
            'bg-[radial-gradient(ellipse_at_top_right,var(--aurora-mint),transparent_50%),radial-gradient(ellipse_at_bottom_left,var(--aurora-dark-green),transparent_50%)]'
          )}
        />

        {/* Animated aurora waves */}
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(circle at 20% 20%, rgba(208, 235, 186, 0.4) 0%, transparent 40%),
              radial-gradient(circle at 80% 80%, rgba(23, 44, 35, 0.6) 0%, transparent 40%),
              radial-gradient(circle at 40% 60%, rgba(130, 114, 99, 0.3) 0%, transparent 30%)
            `,
            backgroundSize: '200% 200%',
          }}
        />

        {/* Floating orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(208, 235, 186, 0.3) 0%, transparent 70%)',
          }}
        />

        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(23, 44, 35, 0.4) 0%, transparent 70%)',
          }}
        />

        <motion.div
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -40, 60, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(130, 114, 99, 0.25) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Radial fade for depth */}
      {showRadialGradient && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.8)_80%)]" />
      )}

      {/* Content */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}
