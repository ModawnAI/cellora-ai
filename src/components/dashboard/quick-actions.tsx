'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import {
  UserPlusIcon,
  ScanIcon,
  CalendarIcon,
  ChartLineIcon,
} from '@phosphor-icons/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

const actions = [
  {
    name: '새 환자 등록',
    description: '신규 환자 정보 입력',
    href: '/patients/new',
    icon: UserPlusIcon,
    color: 'text-[var(--cellora-dark-green)]',
    bg: 'bg-[var(--cellora-mint)]/20 hover:bg-[var(--cellora-mint)]/30',
  },
  {
    name: '피부 분석',
    description: 'Meta-Vu 분석 시작',
    href: '/analysis',
    icon: ScanIcon,
    color: 'text-[var(--cellora-green-dark)]',
    bg: 'bg-[var(--cellora-green-lighter)] hover:bg-[var(--cellora-green-light)]/30',
  },
  {
    name: '예약 관리',
    description: '오늘의 예약 확인',
    href: '/appointments',
    icon: CalendarIcon,
    color: 'text-[var(--cellora-brown)]',
    bg: 'bg-[var(--cellora-brown-lighter)] hover:bg-[var(--cellora-brown-light)]/30',
  },
  {
    name: '성과 분석',
    description: '치료 통계 보기',
    href: '/analytics',
    icon: ChartLineIcon,
    color: 'text-[var(--cellora-brown-dark)]',
    bg: 'bg-[var(--cellora-brown-lighter)] hover:bg-[var(--cellora-brown-light)]/30',
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">빠른 작업</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;

            return (
              <motion.div
                key={action.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Link
                  href={action.href}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl ${action.bg} transition-all duration-200 group`}
                >
                  <Icon
                    size={24}
                    weight="fill"
                    className={`${action.color} mb-2 group-hover:scale-110 transition-transform`}
                  />
                  <span className="text-sm font-medium text-[var(--foreground)] text-center">
                    {action.name}
                  </span>
                  <span className="text-[10px] text-[var(--muted-foreground)] text-center mt-0.5">
                    {action.description}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
