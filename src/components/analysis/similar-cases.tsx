'use client';

import { motion } from 'motion/react';
import { UsersIcon, StarIcon, TrendUpIcon } from '@phosphor-icons/react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Progress } from '@/components/ui';
import { SimilarCase } from '@/lib/types';

interface SimilarCasesProps {
  cases: SimilarCase[];
}

export function SimilarCases({ cases }: SimilarCasesProps) {
  if (cases.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <UsersIcon size={18} className="text-[var(--muted-foreground)]" />
            <CardTitle className="text-base">유사 사례</CardTitle>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            비슷한 진단을 받은 환자의 치료 결과
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cases.map((caseItem, index) => (
              <motion.div
                key={caseItem.caseId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                className="p-4 rounded-lg bg-[var(--muted)]/50 border border-[var(--border)]"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-[var(--cellora-mint)]/30 flex items-center justify-center">
                      <span className="text-sm font-medium text-[var(--cellora-dark-green)]">
                        {caseItem.patientName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {caseItem.patientName}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {caseItem.diagnosis}
                      </p>
                    </div>
                  </div>

                  <Badge variant="outline" size="sm">
                    유사도 {Math.round(caseItem.similarity * 100)}%
                  </Badge>
                </div>

                {/* Similarity Progress */}
                <div className="mb-3">
                  <Progress value={caseItem.similarity * 100} size="sm" />
                </div>

                {/* Treatment Info */}
                <div className="flex items-center gap-2 mb-2">
                  <TrendUpIcon size={14} className="text-[var(--cellora-green-dark)]" />
                  <p className="text-xs text-[var(--foreground)]">
                    {caseItem.treatment}
                  </p>
                </div>

                {/* Outcome */}
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-[var(--cellora-green-dark)]">
                    {caseItem.outcome}
                  </p>

                  {/* Satisfaction */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        size={12}
                        weight={i < caseItem.satisfaction ? 'fill' : 'regular'}
                        className={
                          i < caseItem.satisfaction
                            ? 'text-[var(--cellora-brown)]'
                            : 'text-[var(--muted-foreground)]'
                        }
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
