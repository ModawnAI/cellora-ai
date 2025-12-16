'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowLeftIcon,
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  DropIcon,
  WarningCircleIcon,
  HeartbeatIcon,
  PlusIcon,
  XIcon,
  CheckCircleIcon,
  CircleNotchIcon,
} from '@phosphor-icons/react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import { Gender, SkinType } from '@/lib/types';
import { cn } from '@/lib/utils';

const skinTypes: { value: SkinType; label: string; description: string }[] = [
  { value: 'I', label: 'Type I', description: '매우 밝은 피부, 항상 화상' },
  { value: 'II', label: 'Type II', description: '밝은 피부, 쉽게 화상' },
  { value: 'III', label: 'Type III', description: '중간 피부, 가끔 화상' },
  { value: 'IV', label: 'Type IV', description: '올리브 피부, 드물게 화상' },
  { value: 'V', label: 'Type V', description: '갈색 피부, 거의 화상 없음' },
  { value: 'VI', label: 'Type VI', description: '어두운 갈색 피부' },
];

const commonConcerns = [
  '기미', '잔주름', '모공', '색소침착', '여드름', '여드름 흉터',
  '홍조', '민감성', '피부결', '탄력 저하', '다크서클', '피부톤',
  '주름', '피지', '건조', '잡티',
];

const commonAllergies = [
  '리도카인', '페니실린', '아스피린', '라텍스', '요오드',
  '금속', '화장품', '특정 식품',
];

const commonMedicalHistory = [
  '고혈압', '당뇨', '갑상선 질환', '켈로이드 체질', '헤르페스',
  '아토피', '자가면역 질환', '혈액응고 장애', '임신/수유 중',
];

export default function NewPatientPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    birthYear: '',
    gender: '' as Gender | '',
    skinType: '' as SkinType | '',
    phoneNumber: '',
    email: '',
    concerns: [] as string[],
    allergies: [] as string[],
    medicalHistory: [] as string[],
    notes: '',
  });

  const [customConcern, setCustomConcern] = useState('');
  const [customAllergy, setCustomAllergy] = useState('');
  const [customHistory, setCustomHistory] = useState('');

  const calculateAge = (birthYear: string) => {
    if (!birthYear) return null;
    const year = parseInt(birthYear);
    if (isNaN(year)) return null;
    return new Date().getFullYear() - year + 1; // Korean age
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setShowSuccess(true);

    // Redirect after showing success
    setTimeout(() => {
      router.push('/patients');
    }, 2000);
  };

  const toggleArrayItem = (
    field: 'concerns' | 'allergies' | 'medicalHistory',
    item: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item],
    }));
  };

  const addCustomItem = (
    field: 'concerns' | 'allergies' | 'medicalHistory',
    value: string,
    setValue: (v: string) => void
  ) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
      setValue('');
    }
  };

  const removeItem = (
    field: 'concerns' | 'allergies' | 'medicalHistory',
    item: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(i => i !== item),
    }));
  };

  const isFormValid = formData.name && formData.birthYear && formData.gender && formData.skinType && formData.phoneNumber;

  if (showSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="h-20 w-20 rounded-full bg-[var(--cellora-green-lighter)] flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon size={40} weight="fill" className="text-[var(--cellora-green-dark)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
            환자 등록 완료
          </h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            {formData.name}님이 성공적으로 등록되었습니다
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4 mb-6"
      >
        <Link href="/patients">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">새 환자 등록</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            환자 정보를 입력하여 등록하세요
          </p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UserIcon size={20} className="text-[var(--cellora-dark-green)]" />
                  <CardTitle>기본 정보</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    이름 <span className="text-[#8B4513]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="환자 이름을 입력하세요"
                    className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg py-2.5 px-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--cellora-mint)]/20 focus:border-[var(--cellora-dark-green)]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Birth Year */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      출생연도 <span className="text-[#8B4513]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.birthYear}
                        onChange={(e) => setFormData(prev => ({ ...prev, birthYear: e.target.value }))}
                        placeholder="예: 1990"
                        min="1900"
                        max={new Date().getFullYear()}
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg py-2.5 px-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--cellora-mint)]/20 focus:border-[var(--cellora-dark-green)]"
                        required
                      />
                      {calculateAge(formData.birthYear) && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)]">
                          만 {calculateAge(formData.birthYear)}세
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      성별 <span className="text-[#8B4513]">*</span>
                    </label>
                    <div className="flex gap-3">
                      {(['여성', '남성'] as Gender[]).map((gender) => (
                        <button
                          key={gender}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, gender }))}
                          className={cn(
                            'flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all',
                            formData.gender === gender
                              ? 'border-[var(--cellora-dark-green)] bg-[var(--cellora-mint)]/10 text-[var(--cellora-dark-green)]'
                              : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--muted-foreground)]'
                          )}
                        >
                          {gender}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      연락처 <span className="text-[#8B4513]">*</span>
                    </label>
                    <div className="relative">
                      <PhoneIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        placeholder="010-1234-5678"
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg py-2.5 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--cellora-mint)]/20 focus:border-[var(--cellora-dark-green)]"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      이메일
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="example@email.com"
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg py-2.5 px-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--cellora-mint)]/20 focus:border-[var(--cellora-dark-green)]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Skin Type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DropIcon size={20} className="text-[var(--cellora-dark-green)]" />
                  <CardTitle>피부 타입 (Fitzpatrick)</CardTitle>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  환자의 피부 타입을 선택하세요
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {skinTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, skinType: type.value }))}
                      className={cn(
                        'p-3 rounded-lg border-2 text-left transition-all',
                        formData.skinType === type.value
                          ? 'border-[var(--cellora-dark-green)] bg-[var(--cellora-mint)]/10'
                          : 'border-[var(--border)] hover:border-[var(--muted-foreground)]'
                      )}
                    >
                      <p className={cn(
                        'text-sm font-bold',
                        formData.skinType === type.value ? 'text-[var(--cellora-dark-green)]' : 'text-[var(--foreground)]'
                      )}>
                        {type.label}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        {type.description}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Primary Concerns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CalendarIcon size={20} className="text-[var(--cellora-dark-green)]" />
                  <CardTitle>주요 고민</CardTitle>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  환자의 주요 피부 고민을 선택하세요 (복수 선택 가능)
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {commonConcerns.map((concern) => (
                    <button
                      key={concern}
                      type="button"
                      onClick={() => toggleArrayItem('concerns', concern)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                        formData.concerns.includes(concern)
                          ? 'bg-[var(--cellora-mint)]/20 text-[var(--cellora-dark-green)] ring-2 ring-[var(--cellora-dark-green)]'
                          : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]/80'
                      )}
                    >
                      {concern}
                    </button>
                  ))}
                </div>

                {/* Custom concern input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customConcern}
                    onChange={(e) => setCustomConcern(e.target.value)}
                    placeholder="기타 고민 직접 입력"
                    className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-lg py-2 px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--cellora-mint)]/20 focus:border-[var(--cellora-dark-green)]"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomItem('concerns', customConcern, setCustomConcern);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCustomItem('concerns', customConcern, setCustomConcern)}
                  >
                    <PlusIcon size={16} />
                    추가
                  </Button>
                </div>

                {/* Selected concerns */}
                {formData.concerns.length > 0 && (
                  <div className="p-3 rounded-lg bg-[var(--muted)]/50">
                    <p className="text-xs text-[var(--muted-foreground)] mb-2">선택된 고민</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.concerns.map((concern) => (
                        <Badge key={concern} variant="success" className="gap-1">
                          {concern}
                          <button
                            type="button"
                            onClick={() => removeItem('concerns', concern)}
                            className="ml-1 hover:text-[#8B4513]"
                          >
                            <XIcon size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Allergies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <WarningCircleIcon size={20} className="text-[#8B4513]" />
                  <CardTitle>알레르기</CardTitle>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  알레르기가 있다면 선택하세요
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {commonAllergies.map((allergy) => (
                    <button
                      key={allergy}
                      type="button"
                      onClick={() => toggleArrayItem('allergies', allergy)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                        formData.allergies.includes(allergy)
                          ? 'bg-[#F5E6E6] text-[#8B4513] ring-2 ring-[#8B4513]'
                          : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]/80'
                      )}
                    >
                      {allergy}
                    </button>
                  ))}
                </div>

                {/* Custom allergy input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAllergy}
                    onChange={(e) => setCustomAllergy(e.target.value)}
                    placeholder="기타 알레르기 직접 입력"
                    className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-lg py-2 px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--cellora-mint)]/20 focus:border-[var(--cellora-dark-green)]"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomItem('allergies', customAllergy, setCustomAllergy);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCustomItem('allergies', customAllergy, setCustomAllergy)}
                  >
                    <PlusIcon size={16} />
                    추가
                  </Button>
                </div>

                {/* Selected allergies */}
                {formData.allergies.length > 0 && (
                  <div className="p-3 rounded-lg bg-[#F5E6E6] border border-[#8B4513]/20">
                    <p className="text-xs text-[#8B4513] mb-2 font-medium">주의: 알레르기</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.allergies.map((allergy) => (
                        <Badge key={allergy} variant="error" className="gap-1">
                          {allergy}
                          <button
                            type="button"
                            onClick={() => removeItem('allergies', allergy)}
                            className="ml-1 hover:text-[#5A4832]"
                          >
                            <XIcon size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Medical History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <HeartbeatIcon size={20} className="text-[var(--cellora-brown)]" />
                  <CardTitle>병력</CardTitle>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  관련 병력이 있다면 선택하세요
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {commonMedicalHistory.map((history) => (
                    <button
                      key={history}
                      type="button"
                      onClick={() => toggleArrayItem('medicalHistory', history)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                        formData.medicalHistory.includes(history)
                          ? 'bg-[var(--cellora-brown-lighter)] text-[var(--cellora-brown-dark)] ring-2 ring-[var(--cellora-brown)]'
                          : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]/80'
                      )}
                    >
                      {history}
                    </button>
                  ))}
                </div>

                {/* Custom medical history input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customHistory}
                    onChange={(e) => setCustomHistory(e.target.value)}
                    placeholder="기타 병력 직접 입력"
                    className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-lg py-2 px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--cellora-mint)]/20 focus:border-[var(--cellora-dark-green)]"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomItem('medicalHistory', customHistory, setCustomHistory);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCustomItem('medicalHistory', customHistory, setCustomHistory)}
                  >
                    <PlusIcon size={16} />
                    추가
                  </Button>
                </div>

                {/* Selected medical history */}
                {formData.medicalHistory.length > 0 && (
                  <div className="p-3 rounded-lg bg-[var(--cellora-brown-lighter)] border border-[var(--cellora-brown-light)]/30">
                    <p className="text-xs text-[var(--cellora-brown)] mb-2 font-medium">참고: 병력</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.medicalHistory.map((history) => (
                        <Badge key={history} variant="warning" className="gap-1">
                          {history}
                          <button
                            type="button"
                            onClick={() => removeItem('medicalHistory', history)}
                            className="ml-1 hover:text-[var(--cellora-brown-dark)]"
                          >
                            <XIcon size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>메모</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="추가 메모 사항을 입력하세요"
                  rows={3}
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg py-2.5 px-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--cellora-mint)]/20 focus:border-[var(--cellora-dark-green)] resize-none"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="flex gap-3 justify-end"
          >
            <Link href="/patients">
              <Button variant="outline" type="button">
                취소
              </Button>
            </Link>
            <Button
              variant="primary"
              type="submit"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <CircleNotchIcon size={18} />
                  </motion.div>
                  등록 중...
                </>
              ) : (
                <>
                  <CheckCircleIcon size={18} />
                  환자 등록
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </form>
    </div>
  );
}
