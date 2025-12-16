'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { MagnifyingGlassIcon, ScanIcon, ArrowRightIcon } from '@phosphor-icons/react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { mockPatients, mockAnalyses } from '@/lib/mock-data';
import { statusColors } from '@/lib/types';
import { formatDate, formatDateTime } from '@/lib/utils';

export default function AnalysisPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Get patients with analyses
  const patientsWithAnalysis = mockPatients.filter(
    (p) => mockAnalyses.some((a) => a.patientId === p.id) || p.status === '분석 대기'
  );

  const filteredPatients = patientsWithAnalysis.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-[var(--foreground)]">피부 분석</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          환자별 피부 분석 결과 및 AI 추천 확인
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative max-w-md">
          <MagnifyingGlassIcon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
          />
          <input
            type="text"
            placeholder="환자 이름 또는 ID로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg py-2.5 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--cellora-mint)]/20 focus:border-[var(--cellora-mint)]"
          />
        </div>
      </motion.div>

      {/* Patient List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((patient, index) => {
          const analysis = mockAnalyses.find((a) => a.patientId === patient.id);

          return (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link href={`/analysis/${patient.id}`}>
                <Card className="h-full hover:border-[var(--cellora-mint)]/30 transition-all duration-200 group cursor-pointer">
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-[var(--cellora-mint)]/30 flex items-center justify-center">
                          <span className="text-lg font-bold text-[var(--cellora-dark-green)]">
                            {patient.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-[var(--foreground)]">
                            {patient.name}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {patient.age}세 · {patient.gender} · Type {patient.skinType}
                          </p>
                        </div>
                      </div>

                      <Badge className={statusColors[patient.status]} size="sm">
                        {patient.status}
                      </Badge>
                    </div>

                    {/* Concerns */}
                    <div className="mb-3">
                      <p className="text-xs text-[var(--muted-foreground)] mb-1.5">
                        주요 고민
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {patient.primaryConcerns.slice(0, 3).map((concern, i) => (
                          <Badge key={i} variant="outline" size="sm">
                            {concern}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Analysis Status */}
                    {analysis ? (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--muted)]/50">
                        <div className="flex items-center gap-2">
                          <ScanIcon size={14} className="text-[var(--cellora-green-dark)]" />
                          <span className="text-xs text-[var(--muted-foreground)]">
                            분석 완료
                          </span>
                        </div>
                        <span className="text-xs text-[var(--foreground)]">
                          종합 {analysis.overallScore}점
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--cellora-brown-lighter)]">
                        <span className="text-xs text-[var(--cellora-brown)]">분석 대기 중</span>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
                      <span className="text-xs text-[var(--muted-foreground)]">
                        마지막 방문: {formatDate(patient.lastVisit)}
                      </span>
                      <ArrowRightIcon
                        size={14}
                        className="text-[var(--muted-foreground)] group-hover:text-[var(--cellora-dark-green)] transition-colors"
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--muted-foreground)]">검색 결과가 없습니다</p>
        </div>
      )}
    </div>
  );
}
