'use client';

import { motion } from 'motion/react';
import {
  TrendUpIcon,
  TrendDownIcon,
  UsersIcon,
  CheckCircleIcon,
  StarIcon,
  SyringeIcon,
} from '@phosphor-icons/react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Progress } from '@/components/ui';
import { mockTreatments, mockPatients, mockRecommendations } from '@/lib/mock-data';

// Mock analytics data
const monthlyStats = [
  { month: '7월', patients: 45, recommendations: 42, acceptance: 0.93 },
  { month: '8월', patients: 52, recommendations: 48, acceptance: 0.89 },
  { month: '9월', patients: 61, recommendations: 58, acceptance: 0.92 },
  { month: '10월', patients: 55, recommendations: 52, acceptance: 0.88 },
  { month: '11월', patients: 68, recommendations: 65, acceptance: 0.91 },
  { month: '12월', patients: 72, recommendations: 69, acceptance: 0.94 },
];

const topTreatments = [
  { name: 'Pico Toning', count: 156, trend: 12 },
  { name: 'Rejuran Healer', count: 98, trend: 8 },
  { name: 'Ultherapy', count: 72, trend: -3 },
  { name: 'Genesis', count: 65, trend: 15 },
  { name: 'Skin Botox', count: 54, trend: 5 },
];

const concernDistribution = [
  { concern: '색소침착', percentage: 32 },
  { concern: '주름', percentage: 24 },
  { concern: '모공', percentage: 18 },
  { concern: '홍조', percentage: 14 },
  { concern: '탄력', percentage: 12 },
];

export default function AnalyticsPage() {
  const totalPatients = mockPatients.length;
  const totalRecommendations = mockRecommendations.length;
  const avgConfidence = mockRecommendations.reduce((sum, r) => sum + r.confidence, 0) / mockRecommendations.length;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-[var(--foreground)]">통계 및 분석</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          AI 추천 성과 및 환자 현황 데이터
        </p>
      </motion.div>

      {/* Overview Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--cellora-mint)]/30">
                <UsersIcon size={20} weight="fill" className="text-[var(--cellora-dark-green)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">{totalPatients}</p>
                <p className="text-xs text-[var(--muted-foreground)]">총 환자 수</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--cellora-green-lighter)]">
                <CheckCircleIcon size={20} weight="fill" className="text-[var(--cellora-green-dark)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">89%</p>
                <p className="text-xs text-[var(--muted-foreground)]">추천 수락률</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--cellora-brown-lighter)]">
                <SyringeIcon size={20} weight="fill" className="text-[var(--cellora-brown)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">{totalRecommendations}</p>
                <p className="text-xs text-[var(--muted-foreground)]">AI 추천 생성</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--cellora-brown-lighter)]">
                <StarIcon size={20} weight="fill" className="text-[var(--cellora-brown-dark)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">{(avgConfidence * 100).toFixed(0)}%</p>
                <p className="text-xs text-[var(--muted-foreground)]">평균 신뢰도</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">월별 추이</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyStats.map((stat, index) => (
                  <div key={stat.month} className="flex items-center gap-4">
                    <span className="text-sm text-[var(--muted-foreground)] w-12">
                      {stat.month}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[var(--muted-foreground)]">
                          환자 {stat.patients}명 · 추천 {stat.recommendations}건
                        </span>
                        <span className="text-xs font-medium text-[var(--cellora-green-dark)]">
                          {Math.round(stat.acceptance * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.acceptance * 100}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="h-full bg-[var(--cellora-mint)] rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Treatments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">인기 시술 TOP 5</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTreatments.map((treatment, index) => (
                  <motion.div
                    key={treatment.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-lg font-bold text-[var(--cellora-dark-green)] w-6">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[var(--foreground)]">
                          {treatment.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[var(--muted-foreground)]">
                            {treatment.count}건
                          </span>
                          <div className={`flex items-center gap-0.5 text-xs ${
                            treatment.trend > 0 ? 'text-[var(--cellora-green-dark)]' : 'text-[#8B4513]'
                          }`}>
                            {treatment.trend > 0 ? (
                              <TrendUpIcon size={12} />
                            ) : (
                              <TrendDownIcon size={12} />
                            )}
                            {Math.abs(treatment.trend)}%
                          </div>
                        </div>
                      </div>
                      <Progress
                        value={(treatment.count / topTreatments[0].count) * 100}
                        size="sm"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Concern Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">주요 고민 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {concernDistribution.map((item, index) => (
                  <div key={item.concern} className="flex items-center gap-3">
                    <span className="text-sm text-[var(--foreground)] w-20">
                      {item.concern}
                    </span>
                    <div className="flex-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="h-6 rounded-md bg-gradient-to-r from-[var(--cellora-mint)] to-[var(--cellora-mint)]/50 flex items-center justify-end pr-2"
                      >
                        <span className="text-xs font-medium text-[var(--cellora-dark-green)]">
                          {item.percentage}%
                        </span>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Treatment Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">시술 카테고리별 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: '레이저', count: 89, color: 'bg-[var(--cellora-dark-green)]' },
                  { name: '주사', count: 67, color: 'bg-[var(--cellora-green)]' },
                  { name: '기기', count: 54, color: 'bg-[var(--cellora-brown)]' },
                  { name: '도포', count: 23, color: 'bg-[var(--cellora-mint)]' },
                ].map((cat, index) => (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-[var(--muted)]/50 border border-[var(--border)]"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`h-3 w-3 rounded-full ${cat.color}`} />
                      <span className="text-sm text-[var(--foreground)]">{cat.name}</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--foreground)]">
                      {cat.count}
                      <span className="text-sm text-[var(--muted-foreground)] font-normal ml-1">건</span>
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
