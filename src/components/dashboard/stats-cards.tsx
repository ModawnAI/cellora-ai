'use client';

import { motion } from 'motion/react';
import {
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  TrendUpIcon,
  StarIcon,
} from '@phosphor-icons/react';
import { Card, CardContent } from '@/components/ui';
import { DashboardStats } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  stats: DashboardStats;
}

const statItems = [
  {
    key: 'todayPatients' as const,
    label: '오늘 환자',
    icon: UsersIcon,
    color: 'text-[var(--cellora-dark-green)]',
    bgColor: 'bg-[var(--cellora-mint)]/30',
    format: (v: number) => `${v}명`,
  },
  {
    key: 'pendingAnalysis' as const,
    label: '분석 대기',
    icon: ClockIcon,
    color: 'text-[var(--cellora-brown)]',
    bgColor: 'bg-[var(--cellora-brown-lighter)]',
    format: (v: number) => `${v}명`,
  },
  {
    key: 'completedConsultations' as const,
    label: '상담 완료',
    icon: CheckCircleIcon,
    color: 'text-[var(--cellora-green-dark)]',
    bgColor: 'bg-[var(--cellora-green-lighter)]',
    format: (v: number) => `${v}건`,
  },
  {
    key: 'acceptanceRate' as const,
    label: '추천 수락률',
    icon: TrendUpIcon,
    color: 'text-[var(--cellora-green)]',
    bgColor: 'bg-[var(--cellora-green-lighter)]',
    format: (v: number) => `${Math.round(v * 100)}%`,
  },
  {
    key: 'averageSatisfaction' as const,
    label: '평균 만족도',
    icon: StarIcon,
    color: 'text-[var(--cellora-brown-dark)]',
    bgColor: 'bg-[var(--cellora-brown-lighter)]',
    format: (v: number) => `${v.toFixed(1)}점`,
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        const value = stats[item.key];

        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="hover:border-[var(--cellora-mint)]/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      item.bgColor
                    )}
                  >
                    <Icon size={20} weight="fill" className={item.color} />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    {item.format(value)}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    {item.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
