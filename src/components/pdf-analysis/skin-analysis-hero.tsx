'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { Sparkle, Heart } from '@phosphor-icons/react';
import Image from 'next/image';

interface SkinAnalysisHeroProps {
  patientName?: string;
  mainPhoto?: string;
  overallScore: number;
  grade: string;
  analyzedAt: string;
  className?: string;
}

function FloatingOrb({ delay, size, color, position }: {
  delay: number;
  size: number;
  color: string;
  position: { x: string; y: string };
}) {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl"
      style={{
        width: size,
        height: size,
        background: color,
        left: position.x,
        top: position.y,
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

function AnimatedScore({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepValue = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const getScoreColor = (s: number) => {
    if (s >= 90) return 'text-green-600';
    if (s >= 80) return 'text-cellora-dark-green';
    if (s >= 70) return 'text-amber-600';
    return 'text-orange-600';
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
      className="relative"
    >
      {/* Glowing ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, rgba(208, 235, 186, 0.8) ${displayScore}%, transparent ${displayScore}%)`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* Score display */}
      <div className="relative w-40 h-40 rounded-full bg-white/80 backdrop-blur-xl border border-cellora-dark-green/20 shadow-lg flex flex-col items-center justify-center">
        <span className={`text-5xl font-bold ${getScoreColor(displayScore)}`}>
          {displayScore}
        </span>
        <span className="text-sm text-cellora-warm-gray mt-1">Overall Score</span>
      </div>
    </motion.div>
  );
}

function GradeCard({ grade }: { grade: string }) {
  const gradeColors: Record<string, { bg: string; text: string; glow: string }> = {
    'A': { bg: 'from-green-100 to-emerald-100', text: 'text-green-700', glow: 'rgba(34, 197, 94, 0.3)' },
    'B': { bg: 'from-cellora-mint/40 to-green-100', text: 'text-cellora-dark-green', glow: 'rgba(208, 235, 186, 0.4)' },
    'C': { bg: 'from-yellow-100 to-amber-100', text: 'text-amber-700', glow: 'rgba(234, 179, 8, 0.3)' },
    'D': { bg: 'from-orange-100 to-amber-100', text: 'text-orange-700', glow: 'rgba(249, 115, 22, 0.3)' },
    'F': { bg: 'from-red-100 to-rose-100', text: 'text-red-700', glow: 'rgba(239, 68, 68, 0.3)' },
  };

  const colors = gradeColors[grade] || gradeColors['B'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, type: 'spring' }}
      className="relative"
    >
      <motion.div
        className="absolute inset-0 rounded-2xl blur-2xl"
        style={{ background: colors.glow }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <div className={`relative px-6 py-3 rounded-2xl bg-gradient-to-r ${colors.bg} backdrop-blur-md border border-cellora-warm-gray/20 shadow-md`}>
        <div className="flex items-center gap-3">
          <span className={`text-3xl font-bold ${colors.text}`}>Grade {grade}</span>
          <Sparkle size={24} weight="fill" className={colors.text} />
        </div>
      </div>
    </motion.div>
  );
}

export function SkinAnalysisHero({
  patientName = 'Patient',
  mainPhoto,
  overallScore,
  grade,
  analyzedAt,
  className = '',
}: SkinAnalysisHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const formattedDate = new Date(analyzedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      ref={containerRef}
      className={`relative min-h-[80vh] overflow-hidden ${className}`}
    >
      {/* Animated background */}
      <div className="absolute inset-0">
        <FloatingOrb delay={0} size={400} color="rgba(208, 235, 186, 0.15)" position={{ x: '10%', y: '20%' }} />
        <FloatingOrb delay={2} size={300} color="rgba(138, 43, 226, 0.1)" position={{ x: '70%', y: '60%' }} />
        <FloatingOrb delay={4} size={350} color="rgba(130, 114, 99, 0.1)" position={{ x: '50%', y: '10%' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 container mx-auto px-4 py-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Photo */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {mainPhoto ? (
              <div className="relative aspect-[3/4] max-w-md mx-auto">
                {/* Glow effect */}
                <motion.div
                  className="absolute -inset-4 rounded-3xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(208, 235, 186, 0.3), rgba(138, 43, 226, 0.2))',
                    filter: 'blur(40px)',
                  }}
                  animate={{
                    opacity: [0.4, 0.6, 0.4],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />

                {/* Image frame */}
                <div className="relative rounded-3xl overflow-hidden border-2 border-cellora-warm-gray/30 shadow-xl">
                  <Image
                    src={mainPhoto}
                    alt="Main analysis photo"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Floating badges */}
                <motion.div
                  className="absolute -right-4 top-1/4 px-4 py-2 rounded-full bg-cellora-mint/90 backdrop-blur-md"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <span className="text-sm font-semibold text-cellora-dark-green">AI Analyzed</span>
                </motion.div>
              </div>
            ) : (
              <div className="relative aspect-[3/4] max-w-md mx-auto rounded-3xl bg-gradient-to-br from-cellora-mint/20 to-cellora-dark-green/5 border border-cellora-warm-gray/20 shadow-lg flex items-center justify-center">
                <Heart size={80} weight="duotone" className="text-cellora-dark-green/30" />
              </div>
            )}
          </motion.div>

          {/* Right column - Analysis info */}
          <div className="space-y-8">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-cellora-dark-green text-sm font-medium tracking-wider uppercase mb-2">
                Skin Analysis Report
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-cellora-dark-green mb-4">
                {patientName}&apos;s
                <br />
                Skin Health Analysis
              </h1>
              <p className="text-cellora-warm-gray">
                Analyzed on {formattedDate}
              </p>
            </motion.div>

            {/* Score and Grade */}
            <div className="flex flex-wrap items-center gap-8">
              <AnimatedScore score={overallScore} />
              <GradeCard grade={grade} />
            </div>

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group px-8 py-4 rounded-xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cellora-mint to-green-400 opacity-90 group-hover:opacity-100 transition-opacity" />
              <span className="relative text-cellora-dark-green font-semibold flex items-center gap-2">
                View Full Analysis
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
