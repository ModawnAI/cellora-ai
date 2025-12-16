'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChatCircle,
  X,
  PaperPlaneTilt,
  User,
  Sparkle,
  CircleNotch,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import {
  getPatientById,
  getAnalysisByPatientId,
  getRecommendationByPatientId,
  mockPatients,
  mockDashboardStats,
  mockTreatments,
} from '@/lib/mock-data';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type PageContext = 'dashboard' | 'patients' | 'patient-analysis' | 'treatments' | 'analytics' | 'appointments' | 'settings' | 'general';

interface PageContextConfig {
  greeting: string;
  suggestedQuestions: string[];
  contextBuilder: () => string;
}

export function GlobalChatbot() {
  const pathname = usePathname();
  const params = useParams();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect current page context
  const pageContext = useMemo((): PageContext => {
    if (pathname === '/') return 'dashboard';
    if (pathname === '/patients' || pathname === '/patients/new') return 'patients';
    if (pathname.startsWith('/analysis/') && params?.patientId) return 'patient-analysis';
    if (pathname === '/analysis') return 'patients';
    if (pathname === '/treatments') return 'treatments';
    if (pathname === '/analytics') return 'analytics';
    if (pathname === '/appointments') return 'appointments';
    if (pathname === '/settings') return 'settings';
    return 'general';
  }, [pathname, params]);

  // Get patient data if on patient analysis page
  const patientId = params?.patientId as string | undefined;
  const patient = patientId ? getPatientById(patientId) : null;
  const analysis = patientId ? getAnalysisByPatientId(patientId) : null;
  const recommendation = patientId ? getRecommendationByPatientId(patientId) : null;

  // Build context based on current page
  const buildContext = useCallback((): string => {
    switch (pageContext) {
      case 'patient-analysis':
        if (!patient || !analysis) return '환자 데이터를 불러올 수 없습니다.';
        return buildPatientAnalysisContext();

      case 'dashboard':
        return buildDashboardContext();

      case 'patients':
        return buildPatientsContext();

      case 'treatments':
        return buildTreatmentsContext();

      case 'analytics':
        return buildAnalyticsContext();

      default:
        return buildGeneralContext();
    }
  }, [pageContext, patient, analysis, recommendation]);

  function buildPatientAnalysisContext(): string {
    if (!patient || !analysis) return '';

    const { metaVuScores, ageComparison, summary } = analysis;
    const uvRatio = metaVuScores.pigmentation.uvSpots.count / Math.max(1, metaVuScores.pigmentation.brownSpots.count);

    let context = `
## 현재 검토 중인 환자
- 이름: ${patient.name}
- 나이: ${patient.age}세 / 성별: ${patient.gender}
- 피부 타입: ${patient.skinType}
- 주요 고민: ${patient.primaryConcerns.join(', ')}
- 알레르기: ${patient.allergies.length > 0 ? patient.allergies.join(', ') : '없음'}
- 병력: ${patient.medicalHistory.length > 0 ? patient.medicalHistory.join(', ') : '없음'}

## Meta-Vu 3D 분석 결과
- 종합 점수: ${analysis.overallScore}/100
- 피부 나이: ${ageComparison.skinAge}세 (실제 대비 ${ageComparison.skinAgeDifference > 0 ? '+' : ''}${ageComparison.skinAgeDifference}세)

### 주요 수치
- 모공: ${metaVuScores.pores.score}/100 (확대모공 ${metaVuScores.pores.large}개, 총 ${metaVuScores.pores.totalCount}개)
- 주름: ${metaVuScores.wrinkles.score}/100 (깊은주름 ${metaVuScores.wrinkles.deep}개)
- 색소: ${metaVuScores.pigmentation.score}/100 (갈색반점 ${metaVuScores.pigmentation.brownSpots.count}개, UV손상 ${metaVuScores.pigmentation.uvSpots.count}개)
- UV/갈색 비율: ${uvRatio.toFixed(2)}배
- 홍조: ${metaVuScores.vascular.score}/100
- 피지: ${metaVuScores.sebum.level}/100 / 수분: ${metaVuScores.moisture.level}/100

### 주요 문제
${summary.topConcerns.map(c => `- ${c.concern}: ${c.recommendation}`).join('\n') || '- 특별한 문제 없음'}
`;

    if (recommendation) {
      context += `
## AI 추천 시술
- 메인: ${recommendation.primaryTreatment.nameKo} (${recommendation.primaryTreatment.nameEn})
- 회수: ${recommendation.primaryTreatment.sessions}회, 간격: ${recommendation.primaryTreatment.interval}
- 강도: ${recommendation.primaryTreatment.intensity}
- 이유: ${recommendation.primaryTreatment.rationale}
- 신뢰도: ${Math.round(recommendation.confidence * 100)}%
${recommendation.secondaryTreatments.length > 0 ? `- 보조 시술: ${recommendation.secondaryTreatments.map(t => t.nameKo).join(', ')}` : ''}
${recommendation.contraindications.length > 0 ? `- 금기사항: ${recommendation.contraindications.join(', ')}` : ''}
`;
    }

    return context;
  }

  function buildDashboardContext(): string {
    const stats = mockDashboardStats;
    const todayPatients = mockPatients.filter(p => p.status === '분석 대기' || p.status === '상담 중');

    return `
## 현재 페이지: 대시보드

## 오늘의 클리닉 현황
- 오늘 예약 환자: ${stats.todayPatients}명
- 분석 대기: ${stats.pendingAnalysis}명
- 상담 완료: ${stats.completedConsultations}명
- AI 추천 수락률: ${stats.acceptanceRate}%
- 환자 만족도: ${stats.averageSatisfaction}/5.0

## 대기 중인 환자
${todayPatients.slice(0, 5).map(p => `- ${p.name} (${p.age}세, ${p.status}): ${p.primaryConcerns.slice(0, 2).join(', ')}`).join('\n')}

## 제공 가능한 정보
- 오늘 예약/대기 환자 현황
- 클리닉 운영 통계
- AI 추천 성과 분석
- 특정 환자 조회 방법 안내
`;
  }

  function buildPatientsContext(): string {
    const byStatus = {
      '분석 대기': mockPatients.filter(p => p.status === '분석 대기').length,
      '상담 중': mockPatients.filter(p => p.status === '상담 중').length,
      '완료': mockPatients.filter(p => p.status === '완료').length,
      '예약됨': mockPatients.filter(p => p.status === '예약됨').length,
    };

    return `
## 현재 페이지: 환자 목록

## 환자 현황 요약
- 총 등록 환자: ${mockPatients.length}명
- 분석 대기: ${byStatus['분석 대기']}명
- 상담 중: ${byStatus['상담 중']}명
- 완료: ${byStatus['완료']}명
- 예약됨: ${byStatus['예약됨']}명

## 최근 방문 환자
${mockPatients.slice(0, 5).map(p => `- ${p.name} (${p.id}): ${p.age}세, ${p.primaryConcerns.slice(0, 2).join(', ')}`).join('\n')}

## 제공 가능한 정보
- 환자 검색 및 조회 방법
- 상태별 환자 필터링
- 환자 등록 절차
- 특정 증상/고민별 환자 분류
`;
  }

  function buildTreatmentsContext(): string {
    const byCategory = mockTreatments.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return `
## 현재 페이지: 시술 목록

## 등록된 시술 현황
- 총 시술: ${mockTreatments.length}개
${Object.entries(byCategory).map(([cat, count]) => `- ${cat}: ${count}개`).join('\n')}

## 주요 시술 목록
${mockTreatments.slice(0, 8).map(t => `- ${t.nameKo} (${t.nameEn}): ${t.indications.slice(0, 2).join(', ')}`).join('\n')}

## 제공 가능한 정보
- 시술별 적응증 및 금기사항
- 시술 프로토콜 (회수, 간격, 강도)
- 시술별 예상 다운타임
- 병행 가능한 시술 조합
- 증상별 추천 시술
`;
  }

  function buildAnalyticsContext(): string {
    return `
## 현재 페이지: 통계 분석

## 클리닉 성과 지표
- AI 추천 수락률: ${mockDashboardStats.acceptanceRate}%
- 평균 환자 만족도: ${mockDashboardStats.averageSatisfaction}/5.0
- 월간 분석 건수: 약 ${mockPatients.length * 4}건 (추정)

## 제공 가능한 정보
- AI 추천 정확도 분석
- 시술별 효과 통계
- 환자 재방문율
- 기간별 트렌드 분석
- 주요 시술 현황
`;
  }

  function buildGeneralContext(): string {
    return `
## 현재 페이지: ${pathname}

## Cellora AI 시스템 정보
- Meta-Vu 3D 피부 분석 기기 연동
- AI 기반 시술 추천 시스템
- 총 등록 환자: ${mockPatients.length}명
- 총 시술: ${mockTreatments.length}종

## 제공 가능한 정보
- 환자 피부 분석 결과 해석
- 시술 프로토콜 및 금기사항
- 시스템 사용 방법 안내
`;
  }

  // Get page-specific configuration
  const pageConfig = useMemo((): PageContextConfig => {
    switch (pageContext) {
      case 'patient-analysis':
        return {
          greeting: patient
            ? `${patient.name} 환자의 피부 분석 결과입니다. 시술 프로토콜, 금기사항, 병행 시술 등 진료에 필요한 정보를 문의해 주세요.`
            : '환자 분석 페이지입니다. 궁금한 점을 문의해 주세요.',
          suggestedQuestions: ['시술 프로토콜 상세', '금기사항 및 주의점', '병행 시술 가능 여부'],
          contextBuilder: buildContext,
        };

      case 'dashboard':
        return {
          greeting: '오늘의 클리닉 현황입니다. 환자 현황, AI 분석 결과, 운영 통계 등을 문의해 주세요.',
          suggestedQuestions: ['오늘 대기 환자는?', 'AI 추천 성과는?', '긴급 환자 있나요?'],
          contextBuilder: buildContext,
        };

      case 'patients':
        return {
          greeting: '환자 목록 페이지입니다. 환자 검색, 상태별 조회, 등록 절차 등을 안내해 드립니다.',
          suggestedQuestions: ['분석 대기 환자는?', '환자 등록 방법은?', '최근 방문 환자는?'],
          contextBuilder: buildContext,
        };

      case 'treatments':
        return {
          greeting: '시술 목록 페이지입니다. 시술별 프로토콜, 적응증, 병행 가능 여부 등을 안내해 드립니다.',
          suggestedQuestions: ['색소 치료 시술은?', '리프팅 시술 비교', '시술 금기사항'],
          contextBuilder: buildContext,
        };

      case 'analytics':
        return {
          greeting: '통계 분석 페이지입니다. AI 성과, 시술 효과, 환자 동향 등을 안내해 드립니다.',
          suggestedQuestions: ['AI 추천 정확도는?', '인기 시술 TOP 5', '환자 만족도 추이'],
          contextBuilder: buildContext,
        };

      default:
        return {
          greeting: 'Cellora AI 어시스턴트입니다. 피부 분석, 시술 추천, 환자 관리 등을 도와드립니다.',
          suggestedQuestions: ['시스템 사용법', '환자 조회 방법', '시술 검색'],
          contextBuilder: buildContext,
        };
    }
  }, [pageContext, patient, buildContext]);

  // Reset greeting when page changes
  useEffect(() => {
    if (pathname !== lastPathname) {
      setLastPathname(pathname);
      setHasGreeted(false);
      setMessages([]);
    }
  }, [pathname, lastPathname]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send greeting when chat opens
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      const greeting: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: pageConfig.greeting,
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }
  }, [isOpen, hasGreeted, pageConfig.greeting]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          context: buildContext(),
          history: messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              'fixed bottom-6 right-6 z-50',
              'w-16 h-16 rounded-full',
              'bg-gradient-to-br from-[var(--cellora-mint)] to-[var(--cellora-green)]',
              'shadow-lg shadow-[var(--cellora-mint)]/30',
              'flex items-center justify-center',
              'hover:shadow-xl hover:shadow-[var(--cellora-mint)]/40',
              'transition-shadow duration-300',
              'animate-pulse-glow'
            )}
          >
            <ChatCircle size={32} weight="fill" className="text-[var(--cellora-dark-green)]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed bottom-6 right-6 z-50',
              'w-[400px] h-[560px]',
              'bg-[var(--card)] rounded-2xl',
              'shadow-2xl shadow-black/20',
              'border border-[var(--border)]',
              'flex flex-col overflow-hidden'
            )}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-[var(--border)] bg-gradient-to-r from-[var(--cellora-mint)]/20 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--cellora-mint)] to-[var(--cellora-green)] flex items-center justify-center">
                    <Sparkle size={20} weight="fill" className="text-[var(--cellora-dark-green)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-[var(--foreground)]">Cellora AI</h3>
                    <p className="text-[10px] text-[var(--muted-foreground)]">
                      {pageContext === 'patient-analysis' && patient ? `${patient.name} 환자 분석` :
                       pageContext === 'dashboard' ? '대시보드' :
                       pageContext === 'patients' ? '환자 목록' :
                       pageContext === 'treatments' ? '시술 목록' :
                       pageContext === 'analytics' ? '통계 분석' :
                       '진료 어시스턴트'}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--muted)] transition-colors"
                >
                  <X size={18} className="text-[var(--muted-foreground)]" />
                </motion.button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex gap-2',
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                      message.role === 'assistant'
                        ? 'bg-gradient-to-br from-[var(--cellora-mint)] to-[var(--cellora-green)]'
                        : 'bg-[var(--muted)]'
                    )}
                  >
                    {message.role === 'assistant' ? (
                      <Sparkle size={14} weight="fill" className="text-[var(--cellora-dark-green)]" />
                    ) : (
                      <User size={14} className="text-[var(--muted-foreground)]" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      'max-w-[75%] rounded-2xl px-3 py-2 text-sm',
                      message.role === 'assistant'
                        ? 'bg-[var(--muted)] text-[var(--foreground)] rounded-tl-sm'
                        : 'bg-[var(--cellora-dark-green)] text-[var(--cellora-mint)] rounded-tr-sm'
                    )}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                </motion.div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--cellora-mint)] to-[var(--cellora-green)] flex items-center justify-center">
                    <Sparkle size={14} weight="fill" className="text-[var(--cellora-dark-green)]" />
                  </div>
                  <div className="bg-[var(--muted)] rounded-2xl rounded-tl-sm px-4 py-3">
                    <CircleNotch size={16} className="animate-spin text-[var(--muted-foreground)]" />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length <= 2 && !isLoading && (
              <div className="px-4 pb-2">
                <p className="text-[10px] text-[var(--muted-foreground)] mb-2">추천 질문</p>
                <div className="flex flex-wrap gap-2">
                  {pageConfig.suggestedQuestions.map((question, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setInput(question);
                        inputRef.current?.focus();
                      }}
                      className="px-3 py-1.5 text-xs rounded-full border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--cellora-mint)] hover:text-[var(--foreground)] transition-colors"
                    >
                      {question}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 border-t border-[var(--border)] bg-[var(--muted)]/30">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="질문을 입력하세요..."
                  disabled={isLoading}
                  className={cn(
                    'flex-1 px-4 py-2.5 text-sm rounded-full',
                    'bg-[var(--card)] border border-[var(--border)]',
                    'focus:outline-none focus:border-[var(--cellora-mint)] focus:ring-2 focus:ring-[var(--cellora-mint)]/20',
                    'placeholder:text-[var(--muted-foreground)]',
                    'transition-all duration-200'
                  )}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    'bg-gradient-to-br from-[var(--cellora-mint)] to-[var(--cellora-green)]',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'shadow-md shadow-[var(--cellora-mint)]/30',
                    'transition-all duration-200'
                  )}
                >
                  <PaperPlaneTilt size={18} weight="fill" className="text-[var(--cellora-dark-green)]" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
