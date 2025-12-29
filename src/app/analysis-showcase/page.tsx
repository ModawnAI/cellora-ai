'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  Spinner,
  CheckCircle,
  WarningCircle,
  Sparkle,
} from '@phosphor-icons/react';
import { AnalysisPresentation } from '@/components/pdf-analysis/analysis-presentation';
import { ComprehensiveSkinAnalysis } from '@/lib/pdf-skin-analysis/types';

type UploadState = 'idle' | 'uploading' | 'analyzing' | 'extracting' | 'complete' | 'error';

interface FacePhoto {
  id: string;
  src: string;
  type: 'regular' | 'uv';
  page: number;
  label?: string;
}

// Demo patient info extracted from PDF
const DEMO_PATIENT = {
  name: '강성일',
  age: 27,
  gender: '남성',
  skinAge: 28,
  skinType: '복합성 (건성-중성)',
  analyzedDate: '2025-12-26',
};

// Demo face photos - using actual extracted images with analysis type labels (excluding page 13)
const DEMO_PHOTOS: FacePhoto[] = [
  { id: '1', src: '/demo-faces/page_04_regular_face.png', type: 'regular', page: 4, label: '모공 분석' },
  { id: '2', src: '/demo-faces/page_05_regular_face.png', type: 'regular', page: 5, label: '주름 분석' },
  { id: '3', src: '/demo-faces/page_06_regular_face.png', type: 'regular', page: 6, label: '미래주름 분석' },
  { id: '4', src: '/demo-faces/page_07_regular_face.png', type: 'regular', page: 7, label: '색소 분석' },
  { id: '5', src: '/demo-faces/page_08_uv_face.png', type: 'uv', page: 8, label: '혈관 분석' },
  { id: '6', src: '/demo-faces/page_09_regular_face.png', type: 'regular', page: 9, label: '피지 분석' },
  { id: '7', src: '/demo-faces/page_10_regular_face.png', type: 'regular', page: 10, label: '탄력 분석' },
  { id: '8', src: '/demo-faces/page_11_uv_face.png', type: 'uv', page: 11, label: '수분 분석' },
  { id: '9', src: '/demo-faces/page_12_uv_face.png', type: 'uv', page: 12, label: '민감도 분석' },
  { id: '10', src: '/demo-faces/page_14_regular_face.png', type: 'regular', page: 14, label: '종합 분석' },
];

function UploadZone({
  onUpload,
  state,
  progress,
}: {
  onUpload: (file: File) => void;
  state: UploadState;
  progress: number;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type === 'application/pdf') {
        onUpload(file);
      }
    },
    [onUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpload(file);
      }
    },
    [onUpload]
  );

  const getStateIcon = () => {
    switch (state) {
      case 'uploading':
      case 'analyzing':
      case 'extracting':
        return <Spinner size={48} className="text-cellora-dark-green animate-spin" />;
      case 'complete':
        return <CheckCircle size={48} weight="fill" className="text-green-600" />;
      case 'error':
        return <WarningCircle size={48} weight="fill" className="text-red-500" />;
      default:
        return <Upload size={48} className="text-cellora-dark-green" />;
    }
  };

  const getStateMessage = () => {
    switch (state) {
      case 'uploading':
        return 'PDF 업로드 중...';
      case 'analyzing':
        return 'AI 분석 중...';
      case 'extracting':
        return '얼굴 사진 추출 중...';
      case 'complete':
        return '분석 완료!';
      case 'error':
        return '오류가 발생했습니다. 다시 시도해 주세요.';
      default:
        return '피부 분석 PDF를 여기에 드롭하세요';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`
          relative p-12 rounded-3xl border-2 border-dashed transition-all duration-300
          ${isDragOver ? 'border-cellora-dark-green bg-cellora-mint/20' : 'border-cellora-warm-gray/30 bg-white/50'}
          ${state === 'idle' ? 'cursor-pointer hover:border-cellora-dark-green/50 hover:bg-cellora-mint/10' : ''}
        `}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={state !== 'idle'}
        />

        <div className="flex flex-col items-center gap-4 text-center">
          {getStateIcon()}
          <div>
            <p className="text-cellora-dark-green font-semibold text-lg">{getStateMessage()}</p>
            {state === 'idle' && (
              <p className="text-cellora-warm-gray text-sm mt-1">
                또는 클릭하여 파일 선택
              </p>
            )}
          </div>

          {/* Progress bar */}
          {(state === 'uploading' || state === 'analyzing' || state === 'extracting') && (
            <div className="w-full max-w-xs">
              <div className="h-2 bg-cellora-warm-gray/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-cellora-dark-green"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-cellora-warm-gray text-xs mt-2">{progress}%</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function AnalysisShowcasePage() {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<ComprehensiveSkinAnalysis | null>(null);
  const [facePhotos, setFacePhotos] = useState<FacePhoto[]>([]);
  const [showDemo, setShowDemo] = useState(false);

  // Load demo data
  const loadDemo = useCallback(() => {
    setShowDemo(true);
    setFacePhotos(DEMO_PHOTOS);
    setAnalysis({
      id: 'demo-analysis',
      analyzedAt: '2025-12-26T10:00:00.000Z',
      sourceFile: 'kangseongil_skin_analysis.pdf',
      totalPages: 14,
      pageAnalyses: [],
      detailedMetrics: {
        texture: { overallScore: 67, roughnessIndex: 65, uniformityIndex: 70, smoothnessGrade: 'C', microTextureQuality: 68 },
        pores: { overallScore: 59, totalCount: 245, density: 3.2, sizeDistribution: { enlarged: 57, medium: 49, fine: 37 }, problemAreas: ['좌측 볼', '우측 볼'] },
        wrinkles: { overallScore: 67, totalCount: 33, depthClassification: { deep: 0, moderate: 8, fine: 25 }, primaryLocations: ['이마', '눈가'], dynamicVsStatic: { dynamic: 20, static: 13 } },
        pigmentation: { overallScore: 72, evenness: 70, issues: [], uvDamage: { visible: 15, hidden: 28, riskLevel: 'medium' } },
        vascular: { overallScore: 78, rednessLevel: 25, telangiectasia: false, rosaceaIndicators: false, inflammationLevel: 'none', affectedAreas: ['볼'] },
        hydration: { overallScore: 65, moistureLevel: 30, sebumLevel: 55, skinTypeClassification: 'combination', barrier: { integrity: 70, tewl: 'normal' } },
        elasticity: { overallScore: 75, firmness: 78, laxity: { level: 'none', affectedAreas: [] }, collagenEstimate: 'adequate' },
      },
      ageAnalysis: { estimatedSkinAge: 28, ageDifference: 1, agingFactors: [
        { factor: '모공 확장', contribution: 'medium', description: '모공이 다소 확대되어 있음' },
        { factor: '초기 주름', contribution: 'low', description: '눈가와 이마에 미세한 주름 발견' }
      ] },
      summary: {
        overallSkinHealth: 68,
        healthGrade: 'C',
        primaryConcerns: [
          { concern: 'pore-management', koreanName: '모공 관리', severity: 'moderate', urgency: 'soon' },
          { concern: 'wrinkle-prevention', koreanName: '주름 예방', severity: 'mild', urgency: 'routine' },
          { concern: 'oil-water-balance', koreanName: '유수분 밸런스', severity: 'mild', urgency: 'routine' }
        ],
        strengths: ['혈관 상태 양호', '탄력 유지'],
        areasForImprovement: ['모공 축소', '수분 공급', '색소 예방'],
        lifestyleRecommendations: ['매일 SPF 50+ 사용', '수분 크림 강화', '모공 관리 루틴'],
      },
      treatmentPlan: {
        immediate: [],
        shortTerm: [],
        longTerm: [],
        maintenance: [],
        totalEstimatedInvestment: { min: 0, max: 0, currency: 'KRW' },
      },
      aiInsights: {
        overallAssessment: '27세 남성으로 피부 나이는 28세로 측정되었습니다. 모공과 초기 주름 관리가 필요합니다.',
        hiddenConcerns: ['UV 분석에서 잠재 색소 발견', '미래 주름 위험'],
        preventiveAdvice: ['자외선 차단 필수', '모공 케어 집중', '보습 강화'],
        urgentAttention: [],
        positiveFindings: ['혈관 상태 양호', '심각한 염증 없음'],
        customizedProtocol: '모공 관리와 주름 예방에 집중하면서 유수분 밸런스를 개선하세요.',
      },
    });
  }, []);

  const handleUpload = useCallback(async (file: File) => {
    setUploadState('uploading');
    setProgress(0);

    const uploadInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 30) {
          clearInterval(uploadInterval);
          return 30;
        }
        return prev + 5;
      });
    }, 100);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setUploadState('analyzing');

      const response = await fetch('/api/analyze-pdf', {
        method: 'POST',
        body: formData,
      });

      const analysisInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 70) {
            clearInterval(analysisInterval);
            return 70;
          }
          return prev + 2;
        });
      }, 100);

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      clearInterval(analysisInterval);

      setUploadState('extracting');
      setProgress(75);

      const extractInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(extractInterval);
            return 100;
          }
          return prev + 5;
        });
      }, 100);

      await new Promise((resolve) => setTimeout(resolve, 1500));
      clearInterval(extractInterval);

      setAnalysis(result.analysis);
      setFacePhotos(DEMO_PHOTOS);
      setUploadState('complete');
      setProgress(100);
    } catch (error) {
      console.error('Error:', error);
      setUploadState('error');
    }
  }, []);

  // Reset function
  const handleReset = () => {
    setAnalysis(null);
    setFacePhotos([]);
    setShowDemo(false);
    setUploadState('idle');
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cellora-mint/10">
      {/* Upload Section */}
      <AnimatePresence mode="wait">
        {!analysis && !showDemo && (
          <motion.div
            key="upload"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative min-h-screen flex flex-col items-center justify-center px-4"
          >
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cellora-mint/20 rounded-full blur-[120px]" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cellora-dark-green/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cellora-dark-green/10 border border-cellora-dark-green/20 mb-6">
                <Sparkle size={18} weight="fill" className="text-cellora-dark-green" />
                <span className="text-cellora-dark-green text-sm font-medium">AI 기반 분석</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-cellora-dark-green mb-4">
                피부 분석
                <br />
                시각화
              </h1>
              <p className="text-cellora-warm-gray text-lg max-w-xl mx-auto">
                3D Meta-Vu 피부 분석 PDF를 업로드하여
                AI 기반 맞춤형 분석과 시술 추천을 받아보세요
              </p>
            </motion.div>

            <div className="relative w-full max-w-2xl">
              <UploadZone onUpload={handleUpload} state={uploadState} progress={progress} />
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={loadDemo}
              className="mt-8 text-cellora-warm-gray hover:text-cellora-dark-green transition-colors"
            >
              또는 데모 분석 보기
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Presentation */}
      {(analysis || showDemo) && analysis && (
        <>
          <AnalysisPresentation
            patientName={DEMO_PATIENT.name}
            patientInfo={{
              age: DEMO_PATIENT.age,
              gender: DEMO_PATIENT.gender,
              skinAge: DEMO_PATIENT.skinAge,
              skinType: DEMO_PATIENT.skinType,
              analyzedDate: DEMO_PATIENT.analyzedDate,
            }}
            overallScore={analysis.summary.overallSkinHealth}
            grade={analysis.summary.healthGrade}
            analyzedAt={analysis.analyzedAt}
            mainPhoto={facePhotos[0]?.src}
            photos={facePhotos}
          />

          {/* Reset button */}
          <div className="fixed top-6 left-6 z-50">
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              onClick={handleReset}
              className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-cellora-warm-gray/20 text-cellora-dark-green hover:bg-cellora-mint/20 transition-colors shadow-lg text-sm"
            >
              새 분석
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
}
