'use client';

import { useEffect, useState } from 'react';
import { motion, useAnimate, stagger } from 'motion/react';
import { cn } from '@/lib/utils';

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
  staggerDelay?: number;
}

export function TextGenerateEffect({
  words,
  className,
  filter = true,
  duration = 0.5,
  staggerDelay = 0.02,
}: TextGenerateEffectProps) {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(' ');

  useEffect(() => {
    animate(
      'span',
      {
        opacity: 1,
        filter: filter ? 'blur(0px)' : 'none',
      },
      {
        duration,
        delay: stagger(staggerDelay),
      }
    );
  }, [animate, duration, filter, staggerDelay]);

  return (
    <motion.div ref={scope} className={cn('font-mono', className)}>
      {wordsArray.map((word, idx) => (
        <motion.span
          key={`${word}-${idx}`}
          className="opacity-0"
          style={{
            filter: filter ? 'blur(10px)' : 'none',
          }}
        >
          {word}{' '}
        </motion.span>
      ))}
    </motion.div>
  );
}

interface TypewriterEffectProps {
  words: { text: string; className?: string }[];
  className?: string;
  cursorClassName?: string;
  speed?: number;
}

export function TypewriterEffect({
  words,
  className,
  cursorClassName,
  speed = 50,
}: TypewriterEffectProps) {
  const [displayedText, setDisplayedText] = useState<
    { text: string; className?: string }[]
  >([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentWordIndex >= words.length) {
      setIsComplete(true);
      return;
    }

    const currentWord = words[currentWordIndex];

    if (currentCharIndex < currentWord.text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => {
          const newText = [...prev];
          if (!newText[currentWordIndex]) {
            newText[currentWordIndex] = { text: '', className: currentWord.className };
          }
          newText[currentWordIndex] = {
            ...newText[currentWordIndex],
            text: currentWord.text.slice(0, currentCharIndex + 1),
          };
          return newText;
        });
        setCurrentCharIndex(currentCharIndex + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentWordIndex(currentWordIndex + 1);
        setCurrentCharIndex(0);
      }, speed * 2);
      return () => clearTimeout(timeout);
    }
  }, [currentWordIndex, currentCharIndex, words, speed]);

  return (
    <div className={cn('inline-flex items-center', className)}>
      {displayedText.map((word, idx) => (
        <span key={idx} className={word.className}>
          {word.text}
          {idx < displayedText.length - 1 && ' '}
        </span>
      ))}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className={cn(
          'inline-block w-0.5 h-5 bg-cellora-mint ml-1',
          isComplete && 'hidden',
          cursorClassName
        )}
      />
    </div>
  );
}

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}

export function CountUp({
  end,
  duration = 2,
  suffix = '',
  prefix = '',
  decimals = 0,
  className,
}: CountUpProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

      // Easing function (ease out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * end);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return (
    <span className={className}>
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
}

interface FlipNumberProps {
  value: number;
  className?: string;
}

export function FlipNumber({ value, className }: FlipNumberProps) {
  return (
    <motion.span
      key={value}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {value}
    </motion.span>
  );
}
