'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowRightIcon,
  UserIcon,
  ClockIcon,
} from '@phosphor-icons/react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import { Patient, statusColors } from '@/lib/types';
import { formatTime, formatRelativeTime } from '@/lib/utils';

interface PatientQueueProps {
  patients: Patient[];
}

export function PatientQueue({ patients }: PatientQueueProps) {
  const queuePatients = patients
    .filter(p => p.status === '분석 대기' || p.status === '상담 중')
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base">대기 환자</CardTitle>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            {queuePatients.length}명 대기 중
          </p>
        </div>
        <Link href="/patients">
          <Button variant="ghost" size="sm">
            전체 보기
            <ArrowRightIcon size={14} />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {queuePatients.length === 0 ? (
            <div className="text-center py-8 text-[var(--muted-foreground)]">
              <ClockIcon size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">대기 중인 환자가 없습니다</p>
            </div>
          ) : (
            queuePatients.map((patient, index) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  href={`/analysis/${patient.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[var(--muted)]/50 hover:bg-[var(--muted)] transition-colors group"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[var(--cellora-mint)]/30 flex items-center justify-center">
                    <span className="text-sm font-bold text-[var(--cellora-dark-green)]">
                      {patient.name.charAt(0)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">
                        {patient.name}
                      </p>
                      <Badge
                        size="sm"
                        className={statusColors[patient.status]}
                      >
                        {patient.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      {patient.age}세 · {patient.gender} · {patient.primaryConcerns[0]}
                    </p>
                  </div>

                  {/* Time */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {formatRelativeTime(patient.lastVisit + 'T09:00:00')}
                    </p>
                    <ArrowRightIcon
                      size={14}
                      className="ml-auto mt-1 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
