'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
import { Patient, MetaVuSkinAnalysis, Recommendation } from '@/lib/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AnalysisChatbotProps {
  patient: Patient;
  analysis: MetaVuSkinAnalysis | null;
  recommendation: Recommendation | null;
}

export function AnalysisChatbot({ patient, analysis, recommendation }: AnalysisChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send greeting when chat opens for the first time
  useEffect(() => {
    if (isOpen && !hasGreeted && patient) {
      setHasGreeted(true);
      const greeting: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `${patient.name} 환자의 피부 분석 결과입니다. 시술 프로토콜, 금기사항, 병행 시술 등 진료에 필요한 정보를 문의해 주세요.`,
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }
  }, [isOpen, hasGreeted, patient]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const buildContext = useCallback(() => {
    if (!analysis) return '';

    const { metaVuScores, metaVuZones, ageComparison, summary } = analysis;

    // Build structured context for the AI
    let context = `
## 환자 정보
- 이름: ${patient.name}
- 나이: ${patient.age}세
- 성별: ${patient.gender}
- 피부 타입: ${patient.skinType}
- 주요 고민: ${patient.primaryConcerns.join(', ')}
- 알레르기: ${patient.allergies.length > 0 ? patient.allergies.join(', ') : '없음'}
- 병력: ${patient.medicalHistory.length > 0 ? patient.medicalHistory.join(', ') : '없음'}

## 피부 분석 결과 (Meta-Vu 3D)

### 종합 점수
- 전체 점수: ${analysis.overallScore}/100
- 피부 나이: ${ageComparison.skinAge}세 (실제 나이보다 ${ageComparison.skinAgeDifference > 0 ? '+' : ''}${ageComparison.skinAgeDifference}세)
- 동일 연령대 백분위: 상위 ${100 - ageComparison.overallPercentile}%

### 모공 분석
- 총 모공 수: ${metaVuScores.pores.totalCount}개
- 확대모공: ${metaVuScores.pores.large}개 (${Math.round(metaVuScores.pores.large / metaVuScores.pores.totalCount * 100)}%)
- 중간모공: ${metaVuScores.pores.medium}개
- 미세모공: ${metaVuScores.pores.small}개
- 모공 점수: ${metaVuScores.pores.score}/100

### 주름 분석
- 총 주름 수: ${metaVuScores.wrinkles.totalCount}개
- 깊은주름: ${metaVuScores.wrinkles.deep}개
- 중간주름: ${metaVuScores.wrinkles.intermediate}개
- 잔주름: ${metaVuScores.wrinkles.light}개
- 주름 점수: ${metaVuScores.wrinkles.score}/100

### 색소침착 분석
- 갈색반점: ${metaVuScores.pigmentation.brownSpots.count}개 (면적: ${metaVuScores.pigmentation.brownSpots.area}mm²)
- UV 손상 (숨겨진 색소): ${metaVuScores.pigmentation.uvSpots.count}개 (면적: ${metaVuScores.pigmentation.uvSpots.area}mm²)
- UV/갈색 비율: ${(metaVuScores.pigmentation.uvSpots.count / Math.max(1, metaVuScores.pigmentation.brownSpots.count)).toFixed(2)}배
- 색소 점수: ${metaVuScores.pigmentation.score}/100

### 홍조/혈관 분석
- 붉은반점: ${metaVuScores.vascular.redSpots.count}개
- 홍조 점수: ${metaVuScores.vascular.score}/100

### 피부결/피지/수분
- 피부 거칠기: ${metaVuScores.texture.roughness}/100
- 피부 균일도: ${metaVuScores.texture.uniformity}/100
- 피지량: ${metaVuScores.sebum.level}/100 (분포: ${metaVuScores.sebum.distribution === 'uniform' ? '균일' : metaVuScores.sebum.distribution === 'tzone' ? 'T존 집중' : '불규칙'})
- 수분량: ${metaVuScores.moisture.level}/100

### 주요 문제 부위
${Object.entries(metaVuZones)
  .filter(([, z]) => z.severity === 'high' || z.severity === 'critical')
  .map(([zone, z]) => `- ${z.label}: ${z.primaryConcern} (${z.severity === 'critical' ? '심각' : '주의'})`)
  .join('\n') || '- 심각한 문제 부위 없음'}

### 주요 개선 필요 항목
${summary.topConcerns.map(c => `- ${c.concern}: ${c.recommendation}`).join('\n') || '- 특별한 문제 없음'}

### 예방적 주의사항
${summary.preventiveConcerns.map(c => `- ${c.concern} (위험도: ${c.riskLevel}): ${c.description}`).join('\n') || '- 특별한 예방사항 없음'}

### 피부 타입 분석
${summary.skinTypeAnalysis}
`;

    // Add recommendation context if available
    if (recommendation) {
      context += `
## AI 추천 시술
- 메인 시술: ${recommendation.primaryTreatment.nameKo} (${recommendation.primaryTreatment.nameEn})
- 권장 회수: ${recommendation.primaryTreatment.sessions}회
- 시술 간격: ${recommendation.primaryTreatment.interval}
- 강도: ${recommendation.primaryTreatment.intensity}
- 추천 이유: ${recommendation.primaryTreatment.rationale}
- 신뢰도: ${Math.round(recommendation.confidence * 100)}%
- 예상 결과: ${recommendation.expectedOutcome}
${recommendation.secondaryTreatments.length > 0 ? `- 보조 시술: ${recommendation.secondaryTreatments.map(t => t.nameKo).join(', ')}` : ''}
${recommendation.contraindications.length > 0 ? `- 주의사항: ${recommendation.contraindications.join(', ')}` : ''}
`;
    }

    return context;
  }, [patient, analysis, recommendation]);

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

  const suggestedQuestions = [
    '시술 프로토콜 상세',
    '금기사항 및 주의점',
    '병행 시술 가능 여부',
  ];

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
              'w-[380px] h-[520px]',
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
                    <p className="text-[10px] text-[var(--muted-foreground)]">피부 분석 어시스턴트</p>
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

            {/* Suggested Questions (only show when few messages) */}
            {messages.length <= 2 && !isLoading && (
              <div className="px-4 pb-2">
                <p className="text-[10px] text-[var(--muted-foreground)] mb-2">추천 질문</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, i) => (
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
