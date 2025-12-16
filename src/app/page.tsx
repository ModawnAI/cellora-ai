'use client';

import { motion } from 'motion/react';
import { StatsCards, PatientQueue, RecentActivity, QuickActions } from '@/components/dashboard';
import { mockPatients, mockDashboardStats, mockRecentActivity } from '@/lib/mock-data';

export default function Dashboard() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          안녕하세요, 박기범 원장님
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          오늘의 환자 현황과 AI 추천을 확인하세요
        </p>
      </motion.div>

      {/* Stats Cards */}
      <section className="mb-6">
        <StatsCards stats={mockDashboardStats} />
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Patient Queue */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <PatientQueue patients={mockPatients} />
          </motion.div>

          {/* AI Recommendation Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--cellora-mint)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-[var(--cellora-dark-green)] animate-pulse" />
                <span className="text-xs font-medium text-[var(--cellora-dark-green)] uppercase tracking-wider">
                  AI 분석 활성
                </span>
              </div>

              <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">
                오늘의 AI 인사이트
              </h3>

              <p className="text-sm text-[var(--muted-foreground)] mb-4">
                오늘 분석된 환자 중 <span className="text-[var(--cellora-dark-green)] font-semibold">4명</span>에게
                색소 치료 시술이 권장되었습니다.
                <span className="text-[var(--cellora-dark-green)] font-semibold"> Pico Toning</span>이
                가장 많이 추천된 시술입니다.
              </p>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[var(--cellora-dark-green)]" />
                  <span className="text-[var(--muted-foreground)]">평균 신뢰도</span>
                  <span className="font-bold text-[var(--foreground)]">89%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[var(--cellora-green)]" />
                  <span className="text-[var(--muted-foreground)]">수락률</span>
                  <span className="font-bold text-[var(--foreground)]">92%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <QuickActions />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <RecentActivity activities={mockRecentActivity} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
