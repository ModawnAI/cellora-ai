import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar, Header, MobileNav, ChatbotWrapper } from '@/components/layout';

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Cellora AI | AI 피부 시술 추천 시스템',
  description: 'Meta-Vu 3D 피부 분석과 Gemini AI를 결합한 맞춤형 시술 추천 플랫폼. 정밀한 피부 데이터 분석으로 최적의 시술 프로토콜을 제안합니다.',
  keywords: ['피부과', '미용', 'AI', '시술 추천', '피부 분석', 'Meta-Vu', 'Gemini AI', '피부과 솔루션'],
  authors: [{ name: 'Cellora AI' }],
  openGraph: {
    title: 'Cellora AI',
    description: 'AI 기반 피부 분석 및 맞춤 시술 추천 플랫폼',
    type: 'website',
    locale: 'ko_KR',
    siteName: 'Cellora AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cellora AI',
    description: 'AI 기반 피부 분석 및 맞춤 시술 추천 플랫폼',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistMono.variable} font-mono antialiased`}>
        <div className="min-h-screen bg-[var(--background)]">
          {/* Sidebar - Desktop */}
          <Sidebar />

          {/* Main content area */}
          <div className="lg:pl-64">
            {/* Header */}
            <Header />

            {/* Main content */}
            <main className="pb-20 lg:pb-0">
              {children}
            </main>
          </div>

          {/* Mobile Navigation */}
          <MobileNav />

          {/* Global AI Chatbot */}
          <ChatbotWrapper />
        </div>
      </body>
    </html>
  );
}
