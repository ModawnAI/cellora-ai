'use client';

import { motion } from 'motion/react';
import {
  UserIcon,
  CalendarIcon,
  PhoneIcon,
  WarningCircleIcon,
  HeartbeatIcon,
} from '@phosphor-icons/react';
import { Card, CardContent, Badge } from '@/components/ui';
import { Patient } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface PatientProfileCardProps {
  patient: Patient;
}

export function PatientProfileCard({ patient }: PatientProfileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-[var(--cellora-mint)]/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-[var(--cellora-dark-green)]">
                {patient.name.charAt(0)}
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-[var(--foreground)]">
                  {patient.name}
                </h2>
                <Badge variant="outline" size="sm">
                  {patient.id}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
                <span>{patient.age}세</span>
                <span>·</span>
                <span>{patient.gender}</span>
                <span>·</span>
                <span>피부타입 {patient.skinType}</span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon size={16} className="text-[var(--muted-foreground)]" />
              <div>
                <p className="text-[var(--muted-foreground)]">등록일</p>
                <p className="text-[var(--foreground)]">{formatDate(patient.registrationDate)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <PhoneIcon size={16} className="text-[var(--muted-foreground)]" />
              <div>
                <p className="text-[var(--muted-foreground)]">연락처</p>
                <p className="text-[var(--foreground)]">{patient.phoneNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <UserIcon size={16} className="text-[var(--muted-foreground)]" />
              <div>
                <p className="text-[var(--muted-foreground)]">방문 횟수</p>
                <p className="text-[var(--foreground)]">{patient.visitCount}회</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon size={16} className="text-[var(--muted-foreground)]" />
              <div>
                <p className="text-[var(--muted-foreground)]">최근 방문</p>
                <p className="text-[var(--foreground)]">{formatDate(patient.lastVisit)}</p>
              </div>
            </div>
          </div>

          {/* Primary Concerns */}
          <div className="mb-4">
            <p className="text-xs text-[var(--muted-foreground)] mb-2">주요 고민</p>
            <div className="flex flex-wrap gap-2">
              {patient.primaryConcerns.map((concern, index) => (
                <Badge key={index} variant="default">
                  {concern}
                </Badge>
              ))}
            </div>
          </div>

          {/* Allergies */}
          {patient.allergies.length > 0 && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <WarningCircleIcon size={16} className="text-red-400" />
                <p className="text-xs font-medium text-red-400">알레르기</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((allergy, index) => (
                  <Badge key={index} variant="error" size="sm">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Medical History */}
          {patient.medicalHistory.length > 0 && (
            <div className="p-3 rounded-lg bg-[var(--cellora-brown-lighter)] border border-[var(--cellora-brown-light)]/30">
              <div className="flex items-center gap-2 mb-2">
                <HeartbeatIcon size={16} className="text-[var(--cellora-brown)]" />
                <p className="text-xs font-medium text-[var(--cellora-brown)]">병력</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {patient.medicalHistory.map((history, index) => (
                  <Badge key={index} variant="warning" size="sm">
                    {history}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
