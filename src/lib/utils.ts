import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffInMinutes < 1) return '방금 전';
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}시간 전`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}일 전`;

  return formatDate(dateString);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPriceRange(min: number, max: number): string {
  return `${formatPrice(min)} ~ ${formatPrice(max)}`;
}

export function getScoreColor(score: number): string {
  if (score < 40) return 'text-[var(--cellora-green)]';
  if (score < 70) return 'text-[var(--cellora-brown)]';
  return 'text-[#8B4513]';
}

export function getScoreBgColor(score: number): string {
  if (score < 40) return 'bg-[var(--cellora-green-lighter)]';
  if (score < 70) return 'bg-[var(--cellora-brown-lighter)]';
  return 'bg-[#F5E6E6]';
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.9) return '매우 높음';
  if (confidence >= 0.8) return '높음';
  if (confidence >= 0.7) return '보통';
  return '낮음';
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return 'text-[var(--cellora-green)]';
  if (confidence >= 0.8) return 'text-[var(--cellora-green-dark)]';
  if (confidence >= 0.7) return 'text-[var(--cellora-brown)]';
  return 'text-[#8B4513]';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generatePatientInitials(name: string): string {
  return name.charAt(0);
}

export function calculateOverallScore(scores: Record<string, number>): number {
  const values = Object.values(scores);
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  // Invert because lower is better for skin problems
  return Math.round(100 - avg);
}
