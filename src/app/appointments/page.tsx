'use client';

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  CaretLeftIcon,
  CaretRightIcon,
  PlusIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  WarningCircleIcon,
  PlayIcon,
} from '@phosphor-icons/react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import { mockAppointments, Appointment } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const statusConfig: Record<Appointment['status'], { label: string; color: string; icon: React.ElementType }> = {
  scheduled: { label: '예약됨', color: 'bg-[#E8EFEB] text-[var(--cellora-dark-green)]', icon: ClockIcon },
  confirmed: { label: '확정', color: 'bg-[var(--cellora-green-lighter)] text-[var(--cellora-green-dark)]', icon: CheckCircleIcon },
  'in-progress': { label: '진행중', color: 'bg-[var(--cellora-brown-lighter)] text-[var(--cellora-brown)]', icon: PlayIcon },
  completed: { label: '완료', color: 'bg-gray-100 text-gray-600', icon: CheckCircleIcon },
  cancelled: { label: '취소', color: 'bg-[#F5E6E6] text-[#8B4513]', icon: XCircleIcon },
  'no-show': { label: '노쇼', color: 'bg-[#F5E6E6] text-[#8B4513]', icon: WarningCircleIcon },
};

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

export default function AppointmentsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month days
    const startDayOfWeek = firstDay.getDay();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  }, [currentDate]);

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];

  const appointmentsForSelectedDate = useMemo(() => {
    return mockAppointments
      .filter(apt => apt.date === selectedDateStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [selectedDateStr]);

  const getAppointmentCountForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return mockAppointments.filter(apt => apt.date === dateStr).length;
  };

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const isToday = (date: Date) => {
    return date.toISOString().split('T')[0] === todayStr;
  };

  const isSelected = (date: Date) => {
    return date.toISOString().split('T')[0] === selectedDateStr;
  };

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
          <h1 className="text-2xl font-bold text-[var(--foreground)]">예약 관리</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            환자 예약 일정을 확인하고 관리하세요
          </p>
        </div>

        <Button variant="primary">
          <PlusIcon size={18} />
          새 예약
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CardTitle className="text-lg">
                    {currentDate.getFullYear()}년 {MONTHS[currentDate.getMonth()]}
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    오늘
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
                    <CaretLeftIcon size={20} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                    <CaretRightIcon size={20} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map((day, i) => (
                  <div
                    key={day}
                    className={cn(
                      'text-center text-xs font-medium py-2',
                      i === 0 ? 'text-[#8B4513]' : i === 6 ? 'text-[var(--cellora-dark-green)]' : 'text-[var(--muted-foreground)]'
                    )}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map(({ date, isCurrentMonth }, index) => {
                  const appointmentCount = getAppointmentCountForDate(date);
                  const dayOfWeek = date.getDay();

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        'relative aspect-square p-1 rounded-lg transition-all duration-200 hover:bg-[var(--muted)]',
                        !isCurrentMonth && 'opacity-30',
                        isSelected(date) && 'bg-[var(--cellora-mint)]/20 ring-2 ring-[var(--cellora-dark-green)]',
                        isToday(date) && !isSelected(date) && 'bg-[var(--muted)]'
                      )}
                    >
                      <span
                        className={cn(
                          'text-sm',
                          isToday(date) && 'font-bold text-[var(--cellora-dark-green)]',
                          dayOfWeek === 0 && 'text-[#8B4513]',
                          dayOfWeek === 6 && 'text-[var(--cellora-dark-green)]',
                          !isCurrentMonth && 'text-[var(--muted-foreground)]'
                        )}
                      >
                        {date.getDate()}
                      </span>
                      {appointmentCount > 0 && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {appointmentCount <= 3 ? (
                            Array.from({ length: appointmentCount }).map((_, i) => (
                              <div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-[var(--cellora-dark-green)]"
                              />
                            ))
                          ) : (
                            <span className="text-[10px] font-medium text-[var(--cellora-dark-green)]">
                              {appointmentCount}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Selected Date Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="h-fit">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 ({DAYS[selectedDate.getDay()]})
              </CardTitle>
              <p className="text-xs text-[var(--muted-foreground)]">
                {appointmentsForSelectedDate.length}건의 예약
              </p>
            </CardHeader>
            <CardContent>
              {appointmentsForSelectedDate.length === 0 ? (
                <div className="text-center py-8">
                  <ClockIcon size={32} className="mx-auto mb-2 text-[var(--muted-foreground)] opacity-50" />
                  <p className="text-sm text-[var(--muted-foreground)]">예약이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointmentsForSelectedDate.map((apt, index) => {
                    const StatusIcon = statusConfig[apt.status].icon;
                    return (
                      <motion.div
                        key={apt.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className={cn(
                          'p-3 rounded-lg border border-[var(--border)] bg-[var(--card)]',
                          apt.status === 'in-progress' && 'border-[var(--cellora-brown-light)] bg-[var(--cellora-brown-lighter)]'
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[var(--foreground)]">
                              {apt.time}
                            </span>
                            <Badge className={statusConfig[apt.status].color} size="sm">
                              <StatusIcon size={10} weight="fill" />
                              {statusConfig[apt.status].label}
                            </Badge>
                          </div>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {apt.duration}분
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <UserIcon size={14} className="text-[var(--muted-foreground)]" />
                            <span className="text-sm font-medium text-[var(--foreground)]">
                              {apt.patientName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[var(--cellora-dark-green)] font-medium bg-[var(--cellora-mint)]/20 px-2 py-0.5 rounded">
                              {apt.treatment}
                            </span>
                          </div>
                          {apt.room && (
                            <div className="flex items-center gap-2">
                              <MapPinIcon size={14} className="text-[var(--muted-foreground)]" />
                              <span className="text-xs text-[var(--muted-foreground)]">
                                {apt.room}
                              </span>
                            </div>
                          )}
                          {apt.notes && (
                            <p className="text-xs text-[var(--muted-foreground)] mt-2 p-2 bg-[var(--muted)] rounded">
                              {apt.notes}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Today's Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="mt-6"
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">오늘의 예약 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: '전체', count: mockAppointments.filter(a => a.date === todayStr).length, color: 'bg-gray-100 text-gray-700' },
                { label: '완료', count: mockAppointments.filter(a => a.date === todayStr && a.status === 'completed').length, color: 'bg-[var(--cellora-green-lighter)] text-[var(--cellora-green-dark)]' },
                { label: '진행중', count: mockAppointments.filter(a => a.date === todayStr && a.status === 'in-progress').length, color: 'bg-[var(--cellora-brown-lighter)] text-[var(--cellora-brown)]' },
                { label: '대기', count: mockAppointments.filter(a => a.date === todayStr && (a.status === 'scheduled' || a.status === 'confirmed')).length, color: 'bg-[#E8EFEB] text-[var(--cellora-dark-green)]' },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className={cn('p-4 rounded-lg text-center', stat.color)}
                >
                  <p className="text-2xl font-bold">{stat.count}</p>
                  <p className="text-xs font-medium mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
