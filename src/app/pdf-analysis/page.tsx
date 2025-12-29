'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  File,
  X,
  SpinnerGap,
  CheckCircle,
  Warning,
  ArrowLeft,
  DownloadSimple,
  Share,
} from '@phosphor-icons/react';
import {
  SkinHealthScore,
  SkinMetricsRadar,
  TreatmentRecommendations,
  SkinConcernsPanel,
  AIInsightsPanel,
} from '@/components/pdf-analysis';
import type { ComprehensiveSkinAnalysis } from '@/lib/pdf-skin-analysis/types';

type AnalysisState = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';

export default function PDFAnalysisPage() {
  const [state, setState] = useState<AnalysisState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<ComprehensiveSkinAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'concerns' | 'treatments' | 'insights'>('overview');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('PDF 파일만 업로드 가능합니다.');
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setError('파일 크기는 20MB를 초과할 수 없습니다.');
      return;
    }

    setFile(selectedFile);
    setError(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleAnalyze = async () => {
    if (!file) return;

    setState('uploading');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setState('analyzing');

      const response = await fetch('/api/analyze-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '분석 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      setState('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      setState('error');
    }
  };

  const handleReset = () => {
    setFile(null);
    setAnalysis(null);
    setState('idle');
    setError(null);
    setActiveTab('overview');
  };

  const tabs = [
    { id: 'overview' as const, label: '종합 분석', icon: '📊' },
    { id: 'concerns' as const, label: '피부 문제점', icon: '🔍' },
    { id: 'treatments' as const, label: '시술 추천', icon: '💉' },
    { id: 'insights' as const, label: 'AI 인사이트', icon: '🧠' },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {state === 'complete' && (
              <button
                onClick={handleReset}
                className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
              >
                <ArrowLeft weight="bold" className="w-5 h-5 text-[var(--cellora-dark-green)]" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-[var(--cellora-dark-green)]">
                AI 피부 분석
              </h1>
              <p className="text-sm text-[var(--cellora-warm-gray)]">
                PDF 보고서를 AI가 분석하여 맞춤 시술을 추천합니다
              </p>
            </div>
          </div>

          {state === 'complete' && (
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">
                <DownloadSimple weight="bold" className="w-4 h-4" />
                <span className="text-sm">내보내기</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--cellora-dark-green)] text-white hover:bg-[var(--cellora-dark-green)]/90 transition-colors">
                <Share weight="bold" className="w-4 h-4" />
                <span className="text-sm">공유</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Upload State */}
          {(state === 'idle' || state === 'uploading' || state === 'error') && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  file
                    ? 'border-[var(--cellora-mint)] bg-[var(--cellora-mint)]/5'
                    : 'border-[var(--border)] hover:border-[var(--cellora-mint)] hover:bg-[var(--muted)]/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) handleFileSelect(selectedFile);
                  }}
                  className="hidden"
                />

                {file ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--cellora-mint)]/20 flex items-center justify-center">
                      <File weight="fill" className="w-8 h-8 text-[var(--cellora-dark-green)]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--cellora-dark-green)]">{file.name}</p>
                      <p className="text-sm text-[var(--cellora-warm-gray)]">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="text-sm text-[var(--cellora-brown)] hover:underline"
                    >
                      다른 파일 선택
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--muted)] flex items-center justify-center">
                      <Upload weight="bold" className="w-8 h-8 text-[var(--cellora-warm-gray)]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--cellora-dark-green)]">
                        PDF 파일을 드래그하거나 클릭하세요
                      </p>
                      <p className="text-sm text-[var(--cellora-warm-gray)]">
                        피부 분석 보고서 (최대 20MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-xl bg-[var(--cellora-brown-lighter)] border border-[var(--cellora-brown)]/30"
                >
                  <div className="flex items-center gap-2">
                    <Warning weight="fill" className="w-5 h-5 text-[var(--cellora-brown)]" />
                    <p className="text-[var(--cellora-brown-dark)]">{error}</p>
                  </div>
                </motion.div>
              )}

              {file && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleAnalyze}
                  disabled={state === 'uploading'}
                  className="w-full mt-6 py-4 rounded-xl bg-[var(--cellora-dark-green)] text-white font-semibold hover:bg-[var(--cellora-dark-green)]/90 transition-colors disabled:opacity-50"
                >
                  AI 분석 시작
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Analyzing State */}
          {state === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto text-center py-20"
            >
              <div className="w-24 h-24 mx-auto mb-8 relative">
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-[var(--cellora-mint)]/20"
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-t-[var(--cellora-mint)] border-r-transparent border-b-transparent border-l-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <SpinnerGap
                  weight="bold"
                  className="absolute inset-0 m-auto w-12 h-12 text-[var(--cellora-dark-green)]"
                />
              </div>
              <h2 className="text-2xl font-bold text-[var(--cellora-dark-green)] mb-2">
                AI가 분석 중입니다
              </h2>
              <p className="text-[var(--cellora-warm-gray)]">
                피부 상태를 정밀 분석하고 있습니다...
              </p>
              <div className="mt-8 space-y-2">
                {[
                  '피부 이미지 처리 중...',
                  '피부 지표 측정 중...',
                  '문제점 분석 중...',
                  '시술 추천 생성 중...',
                ].map((step, idx) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 1.5 }}
                    className="flex items-center gap-2 justify-center text-sm text-[var(--cellora-warm-gray)]"
                  >
                    <CheckCircle weight="fill" className="w-4 h-4 text-[var(--cellora-mint)]" />
                    {step}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Complete State */}
          {state === 'complete' && analysis && (
            <motion.div
              key="complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Tab Navigation */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-[var(--cellora-dark-green)] text-white'
                        : 'bg-white text-[var(--cellora-warm-gray)] hover:bg-[var(--muted)] border border-[var(--border)]'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid lg:grid-cols-2 gap-6"
                  >
                    <SkinHealthScore
                      score={analysis.summary?.overallSkinHealth ?? 50}
                      grade={analysis.summary?.healthGrade ?? 'C'}
                      estimatedSkinAge={analysis.ageAnalysis?.estimatedSkinAge}
                      actualAge={analysis.patient?.estimatedAge}
                    />
                    <SkinMetricsRadar metrics={analysis.detailedMetrics} />
                  </motion.div>
                )}

                {activeTab === 'concerns' && (
                  <motion.div
                    key="concerns"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <SkinConcernsPanel
                      primaryConcerns={analysis.summary?.primaryConcerns ?? []}
                      strengths={analysis.summary?.strengths ?? []}
                      areasForImprovement={analysis.summary?.areasForImprovement ?? []}
                      lifestyleRecommendations={analysis.summary?.lifestyleRecommendations ?? []}
                    />
                  </motion.div>
                )}

                {activeTab === 'treatments' && (
                  <motion.div
                    key="treatments"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <TreatmentRecommendations
                      immediate={analysis.treatmentPlan?.immediate ?? []}
                      shortTerm={analysis.treatmentPlan?.shortTerm ?? []}
                      longTerm={analysis.treatmentPlan?.longTerm ?? []}
                      maintenance={analysis.treatmentPlan?.maintenance ?? []}
                      totalInvestment={analysis.treatmentPlan?.totalEstimatedInvestment ?? { min: 0, max: 0, currency: 'KRW' }}
                    />
                  </motion.div>
                )}

                {activeTab === 'insights' && (
                  <motion.div
                    key="insights"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <AIInsightsPanel
                      overallAssessment={analysis.aiInsights?.overallAssessment ?? ''}
                      hiddenConcerns={analysis.aiInsights?.hiddenConcerns ?? []}
                      preventiveAdvice={analysis.aiInsights?.preventiveAdvice ?? []}
                      urgentAttention={analysis.aiInsights?.urgentAttention ?? []}
                      positiveFindings={analysis.aiInsights?.positiveFindings ?? []}
                      customizedProtocol={analysis.aiInsights?.customizedProtocol ?? ''}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Page Analyses Summary */}
              {analysis.pageAnalyses && analysis.pageAnalyses.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-[var(--cellora-dark-green)] mb-4">
                    페이지별 분석 요약
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysis.pageAnalyses.map((page, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-[var(--border)] hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[var(--cellora-dark-green)]">
                            페이지 {page.pageNumber}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              page.imageType === 'uv'
                                ? 'bg-purple-100 text-purple-700'
                                : page.imageType === 'polarized'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-[var(--cellora-mint)]/20 text-[var(--cellora-dark-green)]'
                            }`}
                          >
                            {page.imageType === 'uv'
                              ? 'UV'
                              : page.imageType === 'polarized'
                              ? '편광'
                              : '일반'}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--cellora-warm-gray)] line-clamp-2">
                          {page.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
