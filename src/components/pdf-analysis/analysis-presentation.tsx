'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CaretLeft,
  CaretRight,
  Sparkle,
  Heart,
  Eye,
  SunDim,
  Lightning,
  CheckCircle,
  Calendar,
  ArrowRight,
  SpeakerHigh,
  Spinner,
  Stop,
} from '@phosphor-icons/react';
import Image from 'next/image';

interface FacePhoto {
  id: string;
  src: string;
  type: 'regular' | 'uv';
  page: number;
  label?: string;
  analysisType?: string;
  analysis?: PhotoAnalysis;
}

interface PhotoAnalysis {
  title: string;
  score: number;
  rating: 'Good' | 'Normal' | 'Bad';
  details: { label: string; value: number | string }[];
  interpretation: string;
  recommendations: TreatmentRecommendation[];
}

interface TreatmentRecommendation {
  name: string;
  koreanName: string;
  frequency: string;
  sessions: string;
  description: string;
}

interface AnalysisPresentationProps {
  patientName: string;
  patientInfo?: {
    age: number;
    gender: string;
    skinAge: number;
    skinType: string;
    analyzedDate: string;
  };
  overallScore: number;
  grade: string;
  analyzedAt: string;
  mainPhoto?: string;
  photos: FacePhoto[];
  className?: string;
}

// Score Ring Component - Responsive size
function ScoreRing({ score, size = 100, label, className = '' }: { score: number; size?: number; label?: string; className?: string }) {
  const radius = (size - 10) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return '#16a34a';
    if (s >= 60) return '#172C23';
    if (s >= 40) return '#d97706';
    return '#ea580c';
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={getColor(score)}
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl lg:text-4xl font-bold text-cellora-dark-green">{score}</span>
        </div>
      </div>
      {label && <span className="text-sm text-cellora-warm-gray mt-2">{label}</span>}
    </div>
  );
}

// Audio cache to store generated audio per slide
const audioCache = new Map<string, string>();

// Voice Button Component
function VoiceButton({
  slideType,
  patientName,
  slideNumber,
  totalSlides,
  analysisType,
  score,
  rating,
  details,
  interpretation,
  recommendations,
  overallScore,
  grade,
  primaryConcerns,
  strengths,
  allAnalysisTypes,
}: {
  slideType: 'hero' | 'analysis' | 'summary';
  patientName: string;
  slideNumber?: number;
  totalSlides?: number;
  analysisType?: string;
  score?: number;
  rating?: string;
  details?: Array<{ label: string; value: string | number }>;
  interpretation?: string;
  recommendations?: Array<{
    name: string;
    koreanName: string;
    frequency?: string;
    sessions?: string;
    description?: string;
  }>;
  overallScore?: number;
  grade?: string;
  primaryConcerns?: string[];
  strengths?: string[];
  allAnalysisTypes?: string[];
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Generate a unique cache key for this slide
  const cacheKey = `${slideType}-${slideNumber}-${analysisType || 'main'}`;

  // Check if audio is cached on mount
  useEffect(() => {
    setIsCached(audioCache.has(cacheKey));
  }, [cacheKey]);

  const handleVoicePlay = async () => {
    // If currently playing, stop
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    // Check if we have cached audio
    const cachedAudioUrl = audioCache.get(cacheKey);
    if (cachedAudioUrl) {
      // Play cached audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(cachedAudioUrl);
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    // Generate new audio
    setIsLoading(true);

    try {
      // Generate script using Gemini
      const scriptResponse = await fetch('/api/generate-voice-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          slideType,
          slideNumber,
          totalSlides,
          analysisType,
          score,
          rating,
          details,
          interpretation,
          recommendations,
          overallScore,
          grade,
          primaryConcerns,
          strengths,
          allAnalysisTypes,
        }),
      });

      if (!scriptResponse.ok) throw new Error('Script generation failed');
      const { script } = await scriptResponse.json();

      // Generate TTS audio
      const ttsResponse = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: script }),
      });

      if (!ttsResponse.ok) throw new Error('TTS generation failed');

      const audioBlob = await ttsResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Cache the audio URL
      audioCache.set(cacheKey, audioUrl);
      setIsCached(true);

      // Play audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
      audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Voice playback error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleVoicePlay}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all shadow-lg ${
        isPlaying
          ? 'bg-red-500 text-white hover:bg-red-600'
          : isCached
          ? 'bg-cellora-dark-green text-white hover:bg-cellora-dark-green/90 ring-2 ring-cellora-mint ring-offset-2'
          : 'bg-cellora-dark-green text-white hover:bg-cellora-dark-green/90'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <>
          <Spinner size={20} className="animate-spin" />
          <span className="text-sm font-medium">생성 중...</span>
        </>
      ) : isPlaying ? (
        <>
          <Stop size={20} weight="fill" />
          <span className="text-sm font-medium">정지</span>
        </>
      ) : (
        <>
          <SpeakerHigh size={20} weight="fill" />
          <span className="text-sm font-medium">{isCached ? '재생' : '음성 설명'}</span>
        </>
      )}
    </button>
  );
}

// Pagination Component
function Pagination({
  total,
  current,
  onSelect,
  slideLabels
}: {
  total: number;
  current: number;
  onSelect: (i: number) => void;
  slideLabels: string[];
}) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`group relative px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all ${
            i === current
              ? 'bg-cellora-dark-green text-white'
              : 'bg-white/80 text-cellora-warm-gray hover:bg-cellora-mint/30 hover:text-cellora-dark-green'
          }`}
        >
          <span className="text-sm sm:text-base font-medium">{i + 1}</span>
          {/* Tooltip */}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {slideLabels[i]}
          </span>
        </button>
      ))}
    </div>
  );
}

// Hero Slide - Bigger and more responsive
function HeroSlide({
  patientName,
  patientInfo,
  overallScore,
  grade,
  analyzedAt,
  mainPhoto,
  slideNumber,
  totalSlides,
  allAnalysisTypes,
}: {
  patientName: string;
  patientInfo?: AnalysisPresentationProps['patientInfo'];
  overallScore: number;
  grade: string;
  analyzedAt: string;
  mainPhoto?: string;
  slideNumber: number;
  totalSlides: number;
  allAnalysisTypes: string[];
}) {
  const formattedDate = new Date(analyzedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getGradeInfo = (g: string) => {
    const grades: Record<string, { label: string; color: string; bg: string }> = {
      'A': { label: '매우 우수', color: 'text-green-700', bg: 'bg-green-100' },
      'B': { label: '양호', color: 'text-cellora-dark-green', bg: 'bg-cellora-mint/30' },
      'C': { label: '보통', color: 'text-amber-700', bg: 'bg-amber-100' },
      'D': { label: '관리 필요', color: 'text-orange-700', bg: 'bg-orange-100' },
      'F': { label: '집중 관리', color: 'text-red-700', bg: 'bg-red-100' },
    };
    return grades[g] || grades['C'];
  };

  const gradeInfo = getGradeInfo(grade);

  return (
    <div className="h-full flex items-center justify-center px-6 lg:px-12">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Photo - Much bigger */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative flex justify-center"
        >
          {mainPhoto ? (
            <div className="relative w-[280px] h-[360px] sm:w-[340px] sm:h-[440px] lg:w-[400px] lg:h-[520px] xl:w-[450px] xl:h-[580px] rounded-3xl overflow-hidden shadow-2xl border-2 border-cellora-warm-gray/20">
              <Image src={mainPhoto} alt="분석 사진" fill className="object-cover" />
            </div>
          ) : (
            <div className="w-[280px] h-[360px] sm:w-[340px] sm:h-[440px] lg:w-[400px] lg:h-[520px] xl:w-[450px] xl:h-[580px] rounded-3xl bg-cellora-mint/10 border-2 border-cellora-warm-gray/20 flex items-center justify-center">
              <Heart size={72} className="text-cellora-dark-green/20" />
            </div>
          )}
        </motion.div>

        {/* Info - Bigger text */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6 lg:space-y-8"
        >
          <div>
            <p className="text-cellora-warm-gray text-base lg:text-lg mb-2">{formattedDate} 분석</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-cellora-dark-green mb-2">
              {patientName}님의
            </h1>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cellora-dark-green">
              피부 건강 분석 리포트
            </h2>
          </div>

          {/* Patient Info */}
          {patientInfo && (
            <div className="flex flex-wrap gap-3 lg:gap-4">
              <span className="px-4 py-2 rounded-full bg-gray-100 text-cellora-dark-green text-base lg:text-lg">
                {patientInfo.age}세 · {patientInfo.gender}
              </span>
              <span className="px-4 py-2 rounded-full bg-cellora-mint/30 text-cellora-dark-green text-base lg:text-lg">
                피부 나이: {patientInfo.skinAge}세
              </span>
              <span className="px-4 py-2 rounded-full bg-gray-100 text-cellora-dark-green text-base lg:text-lg">
                {patientInfo.skinType}
              </span>
            </div>
          )}

          <div className="flex items-center gap-8 lg:gap-12">
            <ScoreRing score={overallScore} size={140} label="종합 점수" />
            <div className={`px-6 lg:px-8 py-4 lg:py-6 rounded-2xl ${gradeInfo.bg}`}>
              <p className="text-sm lg:text-base text-cellora-warm-gray">등급</p>
              <p className={`text-4xl lg:text-5xl font-bold ${gradeInfo.color}`}>{grade}</p>
              <p className={`text-base lg:text-lg ${gradeInfo.color}`}>{gradeInfo.label}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-cellora-warm-gray text-base lg:text-lg">
              <Sparkle size={20} weight="fill" className="text-cellora-dark-green" />
              <span>AI 기반 정밀 분석</span>
            </div>
            <VoiceButton
              slideType="hero"
              patientName={patientName}
              slideNumber={slideNumber}
              totalSlides={totalSlides}
              overallScore={overallScore}
              grade={grade}
              allAnalysisTypes={allAnalysisTypes}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Individual Photo Analysis Slide - Bigger and responsive
function PhotoAnalysisSlide({ photo, photoIndex, totalPhotos, patientName, slideNumber, totalSlides, allAnalysisTypes }: {
  photo: FacePhoto;
  photoIndex: number;
  totalPhotos: number;
  patientName: string;
  slideNumber: number;
  totalSlides: number;
  allAnalysisTypes: string[];
}) {
  const isUV = photo.type === 'uv';
  const analysis = photo.analysis;

  const getRatingColor = (rating: string) => {
    if (rating === 'Good') return 'text-green-600 bg-green-100';
    if (rating === 'Normal') return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const getRatingLabel = (rating: string) => {
    if (rating === 'Good') return '양호';
    if (rating === 'Normal') return '보통';
    return '관리 필요';
  };

  return (
    <div className="h-full flex items-center justify-center px-4 lg:px-8">
      <div className="w-full max-w-[1600px] grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        {/* Left: Photo - Much bigger */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-4 flex flex-col items-center justify-center"
        >
          <div className={`relative w-full max-w-[320px] lg:max-w-[380px] xl:max-w-[420px] aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border-4 ${isUV ? 'border-purple-400' : 'border-cellora-warm-gray/30'}`}>
            <Image src={photo.src} alt={photo.label || ''} fill className="object-cover" />
            {/* Type badge */}
            <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${isUV ? 'bg-purple-600 text-white' : 'bg-cellora-mint text-cellora-dark-green'}`}>
              {isUV ? <SunDim size={16} weight="fill" /> : <Eye size={16} weight="fill" />}
              {isUV ? 'UV' : '일반'}
            </div>
          </div>
          <p className="mt-4 text-lg lg:text-xl font-semibold text-cellora-dark-green">{photo.label}</p>
          <p className="text-sm lg:text-base text-cellora-warm-gray">사진 {photoIndex + 1} / {totalPhotos}</p>
        </motion.div>

        {/* Middle: Analysis - Bigger */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 flex flex-col justify-center space-y-4 lg:space-y-6"
        >
          {analysis && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl lg:text-3xl font-bold text-cellora-dark-green">{analysis.title}</h3>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-1.5 rounded-full text-base font-semibold ${getRatingColor(analysis.rating)}`}>
                    {getRatingLabel(analysis.rating)}
                  </span>
                  <VoiceButton
                    slideType="analysis"
                    patientName={patientName}
                    slideNumber={slideNumber}
                    totalSlides={totalSlides}
                    analysisType={analysis.title}
                    score={analysis.score}
                    rating={analysis.rating}
                    details={analysis.details}
                    interpretation={analysis.interpretation}
                    recommendations={analysis.recommendations}
                    allAnalysisTypes={allAnalysisTypes}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 lg:gap-8">
                <ScoreRing score={analysis.score} size={110} />
                <div className="flex-1">
                  <p className="text-base text-cellora-warm-gray">분석 점수</p>
                  <p className="text-2xl lg:text-3xl font-bold text-cellora-dark-green">{analysis.score}점</p>
                </div>
              </div>

              <div className="p-4 lg:p-5 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-sm text-cellora-warm-gray mb-3">세부 수치</p>
                <div className="grid grid-cols-2 gap-2 lg:gap-3">
                  {analysis.details.map((detail, i) => (
                    <div key={i} className="flex justify-between text-base lg:text-lg py-1">
                      <span className="text-cellora-warm-gray">{detail.label}</span>
                      <span className="font-semibold text-cellora-dark-green">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 lg:p-5 rounded-xl bg-cellora-mint/15 border border-cellora-mint/40">
                <p className="text-base lg:text-lg text-cellora-dark-green leading-relaxed">{analysis.interpretation}</p>
              </div>
            </>
          )}
        </motion.div>

        {/* Right: Recommendations - Bigger */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-4 flex flex-col justify-center space-y-4 lg:space-y-5"
        >
          <div className="flex items-center gap-2">
            <Lightning size={24} weight="fill" className="text-cellora-dark-green" />
            <h3 className="text-xl lg:text-2xl font-bold text-cellora-dark-green">추천 시술</h3>
          </div>

          {analysis?.recommendations.map((rec, i) => (
            <div key={i} className="p-4 lg:p-5 rounded-xl bg-white shadow-lg border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-cellora-dark-green text-lg lg:text-xl">{rec.koreanName}</h4>
                  <p className="text-sm lg:text-base text-cellora-warm-gray">{rec.name}</p>
                </div>
                <CheckCircle size={24} weight="fill" className="text-green-500 flex-shrink-0" />
              </div>
              <p className="text-sm lg:text-base text-cellora-dark-green mb-3">{rec.description}</p>
              <div className="flex items-center gap-3 text-sm lg:text-base text-cellora-warm-gray">
                <Calendar size={16} />
                <span>{rec.frequency}</span>
                <span>·</span>
                <span>{rec.sessions}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// Summary Slide - Bigger and more responsive
function SummarySlide({
  patientName,
  allRecommendations,
  overallScore,
  grade,
  primaryConcerns,
  strengths,
  slideNumber,
  totalSlides,
  allAnalysisTypes,
}: {
  patientName: string;
  allRecommendations: TreatmentRecommendation[];
  overallScore?: number;
  grade?: string;
  primaryConcerns?: string[];
  strengths?: string[];
  slideNumber: number;
  totalSlides: number;
  allAnalysisTypes: string[];
}) {
  // Deduplicate recommendations
  const uniqueRecs = allRecommendations.reduce((acc, rec) => {
    if (!acc.find(r => r.name === rec.name)) {
      acc.push(rec);
    }
    return acc;
  }, [] as TreatmentRecommendation[]);

  return (
    <div className="h-full flex items-center justify-center px-6 lg:px-12">
      <div className="w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 lg:mb-10"
        >
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-cellora-dark-green mb-2">
            {patientName}님을 위한 추천 시술
          </h2>
          <p className="text-cellora-warm-gray text-base lg:text-lg mb-4">분석 결과에 따른 맞춤형 시술 프로그램</p>
          <VoiceButton
            slideType="summary"
            patientName={patientName}
            slideNumber={slideNumber}
            totalSlides={totalSlides}
            overallScore={overallScore}
            grade={grade}
            primaryConcerns={primaryConcerns}
            strengths={strengths}
            allAnalysisTypes={allAnalysisTypes}
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
          {uniqueRecs.slice(0, 6).map((rec, i) => (
            <motion.div
              key={rec.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 lg:p-6 rounded-2xl bg-white shadow-lg border border-cellora-warm-gray/10 flex gap-4"
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-cellora-mint/30 flex items-center justify-center flex-shrink-0">
                <span className="text-lg lg:text-xl font-bold text-cellora-dark-green">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-cellora-dark-green text-lg lg:text-xl">{rec.koreanName}</h3>
                <p className="text-sm lg:text-base text-cellora-warm-gray mb-2">{rec.name}</p>
                <p className="text-sm lg:text-base text-cellora-dark-green line-clamp-2">{rec.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-3 py-1 rounded-full bg-cellora-mint/20 text-sm lg:text-base text-cellora-dark-green">{rec.frequency}</span>
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-sm lg:text-base text-cellora-warm-gray">{rec.sessions}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-5 lg:p-6 rounded-2xl bg-cellora-mint/15 border border-cellora-mint/40 text-center"
        >
          <p className="text-base lg:text-lg text-cellora-dark-green">
            위 시술은 AI 분석 결과에 기반한 추천입니다. 정확한 시술 계획은 담당 의료진과 상담 후 결정해 주세요.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// Default analysis data generator
function generatePhotoAnalysis(photo: FacePhoto): PhotoAnalysis {
  const analysisMap: Record<string, PhotoAnalysis> = {
    '모공': {
      title: '모공 분석',
      score: 59,
      rating: 'Bad',
      details: [
        { label: '이마', value: 37 },
        { label: '우측 볼', value: 49 },
        { label: '좌측 볼', value: 57 },
        { label: '중앙', value: 22 },
        { label: '평균', value: 41 },
      ],
      interpretation: '모공 크기와 밀도가 평균보다 높게 측정되었습니다. 특히 볼 부위의 모공이 확장되어 있어 집중 관리가 필요합니다.',
      recommendations: [
        {
          name: 'Pico Toning',
          koreanName: '피코토닝',
          frequency: '2주 간격',
          sessions: '5-10회 프로그램',
          description: '모공 축소와 피부 탄력 개선에 효과적인 레이저 시술',
        },
        {
          name: 'Aqua Peel',
          koreanName: '아쿠아필',
          frequency: '2-3주 간격',
          sessions: '4-6회 프로그램',
          description: '딥 클렌징과 모공 내 노폐물 제거',
        },
      ],
    },
    '주름': {
      title: '주름 분석',
      score: 67,
      rating: 'Normal',
      details: [
        { label: '이마', value: 18 },
        { label: '눈가 (우)', value: '8/54' },
        { label: '눈가 (좌)', value: '14/76' },
        { label: '볼 (우)', value: 27 },
        { label: '볼 (좌)', value: 35 },
        { label: '평균', value: 33 },
      ],
      interpretation: '눈가와 볼 부위에서 초기 주름 징후가 관찰됩니다. 현재 상태에서 적극적인 관리를 시작하면 주름 진행을 늦출 수 있습니다.',
      recommendations: [
        {
          name: 'Rejuran Healer',
          koreanName: '리쥬란힐러',
          frequency: '2-4주 간격',
          sessions: '3-4회 프로그램',
          description: 'PN 성분으로 피부 재생과 잔주름 개선',
        },
        {
          name: 'Botox',
          koreanName: '보톡스',
          frequency: '3-6개월 간격',
          sessions: '정기 관리',
          description: '주름 예방 및 표정 주름 개선',
        },
      ],
    },
    '미래주름': {
      title: '미래주름 분석 (UV)',
      score: 70,
      rating: 'Normal',
      details: [
        { label: '이마', value: 25 },
        { label: '눈가 (우)', value: '17/42' },
        { label: '눈가 (좌)', value: '22/52' },
        { label: '볼 (우)', value: 24 },
        { label: '볼 (좌)', value: 25 },
        { label: '평균', value: 30 },
      ],
      interpretation: 'UV 분석 결과 피부 하층에 잠재적 주름 형성 위험이 관찰됩니다. 자외선 차단과 예방적 케어가 중요합니다.',
      recommendations: [
        {
          name: 'Ultherapy',
          koreanName: '울쎄라',
          frequency: '6-12개월 간격',
          sessions: '연 1-2회',
          description: 'SMAS층까지 도달하는 초음파로 근본적인 리프팅 효과',
        },
      ],
    },
    '색소': {
      title: '색소침착 분석 (UV)',
      score: 72,
      rating: 'Normal',
      details: [
        { label: '표면 색소', value: '15%' },
        { label: '잠재 색소', value: '28%' },
        { label: '멜라닌 지수', value: 45 },
      ],
      interpretation: 'UV 분석에서 표면에 나타나지 않은 잠재 색소가 28% 발견되었습니다. 향후 기미, 잡티로 발현될 수 있어 예방적 관리가 필요합니다.',
      recommendations: [
        {
          name: 'Pico Laser',
          koreanName: '피코레이저',
          frequency: '2-4주 간격',
          sessions: '5-10회 프로그램',
          description: '색소 파괴와 피부톤 개선',
        },
        {
          name: 'IPL',
          koreanName: 'IPL 광선치료',
          frequency: '3-4주 간격',
          sessions: '3-5회 프로그램',
          description: '색소 병변과 피부톤 불균일 개선',
        },
      ],
    },
    '혈관': {
      title: '혈관/홍조 분석 (UV)',
      score: 78,
      rating: 'Normal',
      details: [
        { label: '홍조 레벨', value: 25 },
        { label: '모세혈관 확장', value: '경미' },
        { label: '염증 지수', value: '낮음' },
      ],
      interpretation: '볼 부위에 경미한 홍조가 관찰됩니다. 현재 수준은 양호하나 지속적인 모니터링이 권장됩니다.',
      recommendations: [
        {
          name: 'Excel V Laser',
          koreanName: '엑셀브이 레이저',
          frequency: '4주 간격',
          sessions: '3-5회 프로그램',
          description: '혈관성 병변과 홍조 개선 전문 레이저',
        },
      ],
    },
    '피지': {
      title: '피지 분석 (UV)',
      score: 65,
      rating: 'Normal',
      details: [
        { label: 'T존 피지', value: '높음' },
        { label: 'U존 피지', value: '보통' },
        { label: '유수분 밸런스', value: '불균형' },
      ],
      interpretation: 'T존(이마, 코)의 피지 분비가 높고, U존은 상대적으로 건조한 복합성 피부입니다. 부위별 맞춤 케어가 필요합니다.',
      recommendations: [
        {
          name: 'Sebum Control Peeling',
          koreanName: '피지 조절 필링',
          frequency: '2주 간격',
          sessions: '4-6회 프로그램',
          description: '과다 피지 조절과 모공 관리',
        },
        {
          name: 'Skinbooster',
          koreanName: '스킨부스터',
          frequency: '2-4주 간격',
          sessions: '3-4회 프로그램',
          description: '피부 깊숙한 수분 공급과 밸런스 개선',
        },
      ],
    },
  };

  // Match based on label
  const label = photo.label || '';
  if (label.includes('모공') || photo.page === 4) return analysisMap['모공'];
  if (label.includes('주름') && !label.includes('미래')) return analysisMap['주름'];
  if (label.includes('미래') || label.includes('UV - 주름')) return analysisMap['미래주름'];
  if (label.includes('색소')) return analysisMap['색소'];
  if (label.includes('혈관')) return analysisMap['혈관'];
  if (label.includes('피지')) return analysisMap['피지'];

  // Default based on type
  if (photo.type === 'uv') {
    return analysisMap['색소'];
  }

  return {
    title: '피부 상태 분석',
    score: 75,
    rating: 'Normal',
    details: [{ label: '종합 점수', value: 75 }],
    interpretation: '전반적인 피부 상태가 양호합니다.',
    recommendations: [],
  };
}

export function AnalysisPresentation({
  patientName,
  patientInfo,
  overallScore,
  grade,
  analyzedAt,
  mainPhoto,
  photos,
  className = '',
}: AnalysisPresentationProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Prepare photos with analysis
  const photosWithAnalysis = photos.map(photo => ({
    ...photo,
    analysis: photo.analysis || generatePhotoAnalysis(photo),
  }));

  // Collect all recommendations for summary
  const allRecommendations = photosWithAnalysis.flatMap(p => p.analysis?.recommendations || []);

  // Collect all analysis types for contextual voice
  const allAnalysisTypes = photosWithAnalysis.map(p => p.analysis?.title || p.label || '').filter(Boolean);

  // Total slides: Hero + Individual photos + Summary
  const totalSlides = 1 + photosWithAnalysis.length + 1;

  // Slide labels for pagination tooltips
  const slideLabels = [
    '개요',
    ...photosWithAnalysis.map(p => p.label || `페이지 ${p.page}`),
    '종합 추천',
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const renderSlide = () => {
    if (currentSlide === 0) {
      return (
        <HeroSlide
          patientName={patientName}
          patientInfo={patientInfo}
          overallScore={overallScore}
          grade={grade}
          analyzedAt={analyzedAt}
          mainPhoto={mainPhoto}
          slideNumber={1}
          totalSlides={totalSlides}
          allAnalysisTypes={allAnalysisTypes}
        />
      );
    }
    if (currentSlide > 0 && currentSlide <= photosWithAnalysis.length) {
      const photoIndex = currentSlide - 1;
      return (
        <PhotoAnalysisSlide
          photo={photosWithAnalysis[photoIndex]}
          photoIndex={photoIndex}
          totalPhotos={photosWithAnalysis.length}
          patientName={patientName}
          slideNumber={currentSlide + 1}
          totalSlides={totalSlides}
          allAnalysisTypes={allAnalysisTypes}
        />
      );
    }
    return (
      <SummarySlide
        patientName={patientName}
        allRecommendations={allRecommendations}
        overallScore={overallScore}
        grade={grade}
        primaryConcerns={['모공 관리', '주름 예방', '유수분 밸런스']}
        strengths={['혈관 상태 양호', '탄력 유지']}
        slideNumber={totalSlides}
        totalSlides={totalSlides}
        allAnalysisTypes={allAnalysisTypes}
      />
    );
  };

  return (
    <div className={`relative h-screen bg-gradient-to-br from-gray-50 via-white to-cellora-mint/5 overflow-hidden ${className}`}>
      {/* Slide Content */}
      <div className="h-[calc(100%-88px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderSlide()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Bar - Bigger */}
      <div className="absolute bottom-0 left-0 right-0 h-[88px] bg-white/90 backdrop-blur-md border-t border-cellora-warm-gray/10">
        <div className="h-full flex items-center justify-center gap-4 lg:gap-6 px-6">
          {/* Prev Button */}
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="p-3 rounded-xl bg-white shadow-md border border-cellora-warm-gray/20 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cellora-mint/10 transition-colors"
          >
            <CaretLeft size={24} className="text-cellora-dark-green" />
          </button>

          {/* Pagination */}
          <Pagination
            total={totalSlides}
            current={currentSlide}
            onSelect={setCurrentSlide}
            slideLabels={slideLabels}
          />

          {/* Next Button */}
          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className="p-3 rounded-xl bg-white shadow-md border border-cellora-warm-gray/20 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cellora-mint/10 transition-colors"
          >
            <CaretRight size={24} className="text-cellora-dark-green" />
          </button>
        </div>
      </div>

      {/* Slide Info - Bigger */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <span className="px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-cellora-warm-gray/20 text-base text-cellora-dark-green font-medium">
          {slideLabels[currentSlide]}
        </span>
        <span className="px-4 py-2 rounded-full bg-cellora-dark-green text-white text-base font-semibold">
          {currentSlide + 1} / {totalSlides}
        </span>
      </div>

      {/* Keyboard hint */}
      <div className="absolute bottom-[100px] right-6 flex items-center gap-2 text-sm text-cellora-warm-gray">
        <ArrowRight size={14} />
        <span>화살표 키로 이동</span>
      </div>
    </div>
  );
}
