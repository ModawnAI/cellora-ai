'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserPlusIcon,
  ArrowRightIcon,
  PhoneIcon,
} from '@phosphor-icons/react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { mockPatients } from '@/lib/mock-data';
import { statusColors, PatientStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const statusFilters: PatientStatus[] = ['분석 대기', '상담 중', '완료', '예약됨'];

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<PatientStatus | 'all'>('all');

  const filteredPatients = useMemo(() => {
    return mockPatients.filter((patient) => {
      const matchesSearch =
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.phoneNumber.includes(searchQuery);

      const matchesStatus =
        selectedStatus === 'all' || patient.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, selectedStatus]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: mockPatients.length };
    statusFilters.forEach((status) => {
      counts[status] = mockPatients.filter((p) => p.status === status).length;
    });
    return counts;
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">환자 목록</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            총 {mockPatients.length}명의 환자가 등록되어 있습니다
          </p>
        </div>

        <Button variant="primary">
          <UserPlusIcon size={18} />
          새 환자 등록
        </Button>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-4 mb-6"
      >
        {/* Search */}
        <div className="relative max-w-md">
          <MagnifyingGlassIcon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
          />
          <input
            type="text"
            placeholder="이름, ID, 연락처로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg py-2.5 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--cellora-mint)]/20 focus:border-[var(--cellora-mint)]"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <FunnelIcon size={16} className="text-[var(--muted-foreground)] shrink-0" />
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              selectedStatus === 'all'
                ? 'bg-[var(--cellora-mint)] text-[var(--cellora-dark-green)]'
                : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            전체 ({statusCounts.all})
          </button>
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                selectedStatus === status
                  ? 'bg-[var(--cellora-mint)] text-[var(--cellora-dark-green)]'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {status} ({statusCounts[status]})
            </button>
          ))}
        </div>
      </motion.div>

      {/* Patient List */}
      <div className="space-y-3">
        {filteredPatients.map((patient, index) => (
          <motion.div
            key={patient.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
          >
            <Link href={`/analysis/${patient.id}`}>
              <Card className="hover:border-[var(--cellora-mint)]/30 transition-all duration-200 group cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="h-12 w-12 rounded-full bg-[var(--cellora-mint)]/30 flex items-center justify-center shrink-0">
                      <span className="text-lg font-bold text-[var(--cellora-dark-green)]">
                        {patient.name.charAt(0)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-[var(--foreground)]">
                          {patient.name}
                        </p>
                        <Badge variant="outline" size="sm">
                          {patient.id}
                        </Badge>
                        <Badge className={statusColors[patient.status]} size="sm">
                          {patient.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted-foreground)]">
                        <span>{patient.age}세 · {patient.gender}</span>
                        <span>피부타입 {patient.skinType}</span>
                        <span className="flex items-center gap-1">
                          <PhoneIcon size={12} />
                          {patient.phoneNumber}
                        </span>
                      </div>
                    </div>

                    {/* Concerns */}
                    <div className="hidden md:flex flex-wrap gap-1 max-w-xs">
                      {patient.primaryConcerns.slice(0, 2).map((concern, i) => (
                        <Badge key={i} variant="outline" size="sm">
                          {concern}
                        </Badge>
                      ))}
                      {patient.primaryConcerns.length > 2 && (
                        <Badge variant="outline" size="sm">
                          +{patient.primaryConcerns.length - 2}
                        </Badge>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="text-right shrink-0">
                      <p className="text-xs text-[var(--muted-foreground)]">방문 {patient.visitCount}회</p>
                      <p className="text-xs text-[var(--foreground)]">{formatDate(patient.lastVisit)}</p>
                    </div>

                    {/* Arrow */}
                    <ArrowRightIcon
                      size={16}
                      className="text-[var(--muted-foreground)] group-hover:text-[var(--cellora-dark-green)] transition-colors shrink-0"
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--muted-foreground)]">검색 결과가 없습니다</p>
        </div>
      )}
    </div>
  );
}
