'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  UserIcon,
  BuildingsIcon,
  BellIcon,
  ShieldCheckIcon,
  PaletteIcon,
  GlobeIcon,
  DevicesIcon,
  CloudIcon,
  KeyIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  CaretRightIcon,
  CheckIcon,
  PencilIcon,
} from '@phosphor-icons/react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const settingSections: SettingSection[] = [
  { id: 'profile', title: '프로필', description: '개인 정보 및 계정 설정', icon: UserIcon },
  { id: 'clinic', title: '클리닉 정보', description: '클리닉 기본 정보 관리', icon: BuildingsIcon },
  { id: 'notifications', title: '알림', description: '알림 및 메시지 설정', icon: BellIcon },
  { id: 'security', title: '보안', description: '비밀번호 및 보안 설정', icon: ShieldCheckIcon },
  { id: 'appearance', title: '화면 설정', description: '테마 및 디스플레이 설정', icon: PaletteIcon },
  { id: 'integrations', title: '연동', description: '외부 서비스 연동 관리', icon: CloudIcon },
];

// Mock user data
const mockUserProfile = {
  name: '박기범',
  email: 'dr.park@cellora.clinic',
  phone: '010-9876-5432',
  role: '원장',
  specialty: '피부과 전문의',
  licenseNumber: '제12345호',
  profileImage: null,
};

// Mock clinic data
const mockClinicInfo = {
  name: '셀로라 피부과의원',
  address: '서울특별시 강남구 테헤란로 123, 4층',
  phone: '02-1234-5678',
  email: 'info@cellora.clinic',
  businessHours: {
    weekday: '09:00 - 19:00',
    saturday: '09:00 - 15:00',
    sunday: '휴진',
  },
  plan: 'Pro',
  expiryDate: '2026-12-31',
};

// Mock notification settings
const mockNotificationSettings = {
  appointmentReminder: true,
  analysisComplete: true,
  newPatient: true,
  marketingEmail: false,
  smsNotification: true,
  pushNotification: true,
};

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [notifications, setNotifications] = useState(mockNotificationSettings);
  const [isEditing, setIsEditing] = useState(false);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 rounded-full bg-[var(--cellora-mint)]/30 flex items-center justify-center">
                <span className="text-3xl font-bold text-[var(--cellora-dark-green)]">
                  {mockUserProfile.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[var(--foreground)]">
                  {mockUserProfile.name}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {mockUserProfile.role} · {mockUserProfile.specialty}
                </p>
                <Badge variant="success" size="sm" className="mt-2">
                  활성 계정
                </Badge>
              </div>
              <Button variant="outline" size="sm">
                <PencilIcon size={14} />
                편집
              </Button>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[var(--muted)]/50">
                <div className="flex items-center gap-2 mb-1">
                  <EnvelopeIcon size={16} className="text-[var(--muted-foreground)]" />
                  <span className="text-xs text-[var(--muted-foreground)]">이메일</span>
                </div>
                <p className="text-sm font-medium text-[var(--foreground)]">{mockUserProfile.email}</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--muted)]/50">
                <div className="flex items-center gap-2 mb-1">
                  <PhoneIcon size={16} className="text-[var(--muted-foreground)]" />
                  <span className="text-xs text-[var(--muted-foreground)]">연락처</span>
                </div>
                <p className="text-sm font-medium text-[var(--foreground)]">{mockUserProfile.phone}</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--muted)]/50">
                <div className="flex items-center gap-2 mb-1">
                  <KeyIcon size={16} className="text-[var(--muted-foreground)]" />
                  <span className="text-xs text-[var(--muted-foreground)]">면허번호</span>
                </div>
                <p className="text-sm font-medium text-[var(--foreground)]">{mockUserProfile.licenseNumber}</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--muted)]/50">
                <div className="flex items-center gap-2 mb-1">
                  <UserIcon size={16} className="text-[var(--muted-foreground)]" />
                  <span className="text-xs text-[var(--muted-foreground)]">역할</span>
                </div>
                <p className="text-sm font-medium text-[var(--foreground)]">{mockUserProfile.role}</p>
              </div>
            </div>
          </div>
        );

      case 'clinic':
        return (
          <div className="space-y-6">
            {/* Clinic Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-[var(--foreground)]">
                  {mockClinicInfo.name}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="success">{mockClinicInfo.plan} Plan</Badge>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    ~ {mockClinicInfo.expiryDate}
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <PencilIcon size={14} />
                편집
              </Button>
            </div>

            {/* Clinic Details */}
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[var(--muted)]/50">
                <div className="flex items-center gap-2 mb-1">
                  <MapPinIcon size={16} className="text-[var(--muted-foreground)]" />
                  <span className="text-xs text-[var(--muted-foreground)]">주소</span>
                </div>
                <p className="text-sm font-medium text-[var(--foreground)]">{mockClinicInfo.address}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[var(--muted)]/50">
                  <div className="flex items-center gap-2 mb-1">
                    <PhoneIcon size={16} className="text-[var(--muted-foreground)]" />
                    <span className="text-xs text-[var(--muted-foreground)]">전화번호</span>
                  </div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{mockClinicInfo.phone}</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--muted)]/50">
                  <div className="flex items-center gap-2 mb-1">
                    <EnvelopeIcon size={16} className="text-[var(--muted-foreground)]" />
                    <span className="text-xs text-[var(--muted-foreground)]">이메일</span>
                  </div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{mockClinicInfo.email}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[var(--muted)]/50">
                <div className="flex items-center gap-2 mb-3">
                  <ClockIcon size={16} className="text-[var(--muted-foreground)]" />
                  <span className="text-xs text-[var(--muted-foreground)]">영업시간</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-[var(--muted-foreground)]">평일</p>
                    <p className="font-medium text-[var(--foreground)]">{mockClinicInfo.businessHours.weekday}</p>
                  </div>
                  <div>
                    <p className="text-[var(--muted-foreground)]">토요일</p>
                    <p className="font-medium text-[var(--foreground)]">{mockClinicInfo.businessHours.saturday}</p>
                  </div>
                  <div>
                    <p className="text-[var(--muted-foreground)]">일요일</p>
                    <p className="font-medium text-[var(--foreground)]">{mockClinicInfo.businessHours.sunday}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            {[
              { key: 'appointmentReminder', title: '예약 알림', description: '예약 30분 전 알림을 받습니다' },
              { key: 'analysisComplete', title: '분석 완료 알림', description: 'AI 피부 분석이 완료되면 알림을 받습니다' },
              { key: 'newPatient', title: '신규 환자 알림', description: '새로운 환자가 등록되면 알림을 받습니다' },
              { key: 'marketingEmail', title: '마케팅 이메일', description: '프로모션 및 업데이트 이메일을 받습니다' },
              { key: 'smsNotification', title: 'SMS 알림', description: '중요 알림을 SMS로 받습니다' },
              { key: 'pushNotification', title: '푸시 알림', description: '앱 푸시 알림을 받습니다' },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 rounded-lg bg-[var(--muted)]/50"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{item.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{item.description}</p>
                </div>
                <button
                  onClick={() => toggleNotification(item.key as keyof typeof notifications)}
                  className="relative"
                >
                  {notifications[item.key as keyof typeof notifications] ? (
                    <ToggleRightIcon size={32} weight="fill" className="text-[var(--cellora-dark-green)]" />
                  ) : (
                    <ToggleLeftIcon size={32} className="text-[var(--muted-foreground)]" />
                  )}
                </button>
              </div>
            ))}
          </div>
        );

      case 'security':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[var(--muted)]/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">비밀번호 변경</p>
                  <p className="text-xs text-[var(--muted-foreground)]">마지막 변경: 30일 전</p>
                </div>
                <Button variant="outline" size="sm">변경</Button>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[var(--muted)]/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">2단계 인증</p>
                  <p className="text-xs text-[var(--muted-foreground)]">추가 보안을 위한 2단계 인증 활성화</p>
                </div>
                <Badge variant="success" size="sm">
                  <CheckIcon size={10} weight="bold" />
                  활성화됨
                </Badge>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[var(--muted)]/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">로그인 기록</p>
                  <p className="text-xs text-[var(--muted-foreground)]">최근 로그인 활동 확인</p>
                </div>
                <Button variant="ghost" size="sm">
                  <CaretRightIcon size={16} />
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[var(--muted)]/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">연결된 기기</p>
                  <p className="text-xs text-[var(--muted-foreground)]">3개의 기기가 연결되어 있습니다</p>
                </div>
                <Button variant="ghost" size="sm">
                  <CaretRightIcon size={16} />
                </Button>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[var(--muted)]/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">테마</p>
                  <p className="text-xs text-[var(--muted-foreground)]">화면 테마를 선택하세요</p>
                </div>
              </div>
              <div className="flex gap-3">
                {['라이트', '다크', '시스템'].map((theme, i) => (
                  <button
                    key={theme}
                    className={cn(
                      'flex-1 p-3 rounded-lg border-2 transition-all',
                      i === 0
                        ? 'border-[var(--cellora-dark-green)] bg-[var(--cellora-mint)]/10'
                        : 'border-[var(--border)] hover:border-[var(--muted-foreground)]'
                    )}
                  >
                    <span className="text-sm font-medium">{theme}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[var(--muted)]/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">언어</p>
                  <p className="text-xs text-[var(--muted-foreground)]">표시 언어 설정</p>
                </div>
                <Badge variant="outline">한국어</Badge>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[var(--muted)]/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">글꼴 크기</p>
                  <p className="text-xs text-[var(--muted-foreground)]">기본 글꼴 크기 설정</p>
                </div>
                <Badge variant="outline">보통</Badge>
              </div>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-4">
            {[
              { name: 'Meta-Vu 3D Scanner', status: 'connected', description: '피부 분석 장비 연동' },
              { name: 'Google Calendar', status: 'connected', description: '일정 동기화' },
              { name: 'KakaoTalk', status: 'disconnected', description: '메시지 알림 연동' },
              { name: 'EMR System', status: 'connected', description: '전자의무기록 연동' },
            ].map((integration) => (
              <div
                key={integration.name}
                className="flex items-center justify-between p-4 rounded-lg bg-[var(--muted)]/50"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center',
                    integration.status === 'connected' ? 'bg-[var(--cellora-green-lighter)]' : 'bg-gray-100'
                  )}>
                    <DevicesIcon
                      size={20}
                      className={integration.status === 'connected' ? 'text-[var(--cellora-green-dark)]' : 'text-gray-400'}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{integration.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{integration.description}</p>
                  </div>
                </div>
                {integration.status === 'connected' ? (
                  <Badge variant="success" size="sm">연결됨</Badge>
                ) : (
                  <Button variant="outline" size="sm">연결</Button>
                )}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-[var(--foreground)]">설정</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          계정 및 시스템 설정을 관리하세요
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {settingSections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;

                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200',
                        isActive
                          ? 'bg-[var(--cellora-mint)]/20 text-[var(--cellora-dark-green)]'
                          : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                      )}
                    >
                      <Icon size={18} weight={isActive ? 'fill' : 'regular'} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{section.title}</p>
                      </div>
                      {isActive && (
                        <CaretRightIcon size={14} />
                      )}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="lg:col-span-3"
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {settingSections.find(s => s.id === activeSection)?.title}
              </CardTitle>
              <p className="text-sm text-[var(--muted-foreground)]">
                {settingSections.find(s => s.id === activeSection)?.description}
              </p>
            </CardHeader>
            <CardContent>
              {renderContent()}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
