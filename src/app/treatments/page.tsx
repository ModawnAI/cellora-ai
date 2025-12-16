'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  CurrencyCircleDollarIcon,
  WarningCircleIcon,
  CheckCircleIcon,
  CaretDownIcon,
} from '@phosphor-icons/react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { mockTreatments } from '@/lib/mock-data';
import { TreatmentCategory, categoryLabels, Treatment } from '@/lib/types';
import { formatPriceRange, cn } from '@/lib/utils';

const categories: TreatmentCategory[] = ['laser', 'injectable', 'device', 'topical', 'combination'];

export default function TreatmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TreatmentCategory | 'all'>('all');
  const [expandedTreatment, setExpandedTreatment] = useState<string | null>(null);

  const filteredTreatments = useMemo(() => {
    return mockTreatments.filter((treatment) => {
      const matchesSearch =
        treatment.nameKo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        treatment.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        treatment.indications.some((ind) =>
          ind.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === 'all' || treatment.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: mockTreatments.length };
    categories.forEach((cat) => {
      counts[cat] = mockTreatments.filter((t) => t.category === cat).length;
    });
    return counts;
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-[var(--foreground)]">시술 카탈로그</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          {mockTreatments.length}개의 시술 정보
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-4 mb-6"
      >
        {/* Search */}
        <div className="relative max-w-md">
          <MagnifyingGlassIcon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
          />
          <input
            type="text"
            placeholder="시술명 또는 적응증으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg py-2.5 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--cellora-mint)]/20 focus:border-[var(--cellora-mint)]"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <FunnelIcon size={16} className="text-[var(--muted-foreground)] shrink-0" />
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-[var(--cellora-mint)] text-[var(--cellora-dark-green)]'
                : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            전체 ({categoryCounts.all})
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-[var(--cellora-mint)] text-[var(--cellora-dark-green)]'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {categoryLabels[category].ko} ({categoryCounts[category]})
            </button>
          ))}
        </div>
      </motion.div>

      {/* Treatment List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTreatments.map((treatment, index) => (
          <motion.div
            key={treatment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
          >
            <TreatmentCard
              treatment={treatment}
              isExpanded={expandedTreatment === treatment.id}
              onToggle={() =>
                setExpandedTreatment(
                  expandedTreatment === treatment.id ? null : treatment.id
                )
              }
            />
          </motion.div>
        ))}
      </div>

      {filteredTreatments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--muted-foreground)]">검색 결과가 없습니다</p>
        </div>
      )}
    </div>
  );
}

function TreatmentCard({
  treatment,
  isExpanded,
  onToggle,
}: {
  treatment: Treatment;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-[var(--foreground)]">
                {treatment.nameEn}
              </h3>
              <Badge variant="outline" size="sm">
                {categoryLabels[treatment.category].ko}
              </Badge>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              {treatment.nameKo}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-[var(--muted-foreground)] mb-3 line-clamp-2">
          {treatment.description}
        </p>

        {/* Quick Info */}
        <div className="flex flex-wrap gap-3 mb-3">
          <div className="flex items-center gap-1.5 text-xs">
            <ClockIcon size={14} className="text-[var(--muted-foreground)]" />
            <span className="text-[var(--foreground)]">
              {treatment.typicalSessions.min}-{treatment.typicalSessions.max}회
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <CurrencyCircleDollarIcon size={14} className="text-[var(--muted-foreground)]" />
            <span className="text-[var(--foreground)]">
              {formatPriceRange(treatment.priceRange.min, treatment.priceRange.max)}
            </span>
          </div>
        </div>

        {/* Indications */}
        <div className="flex flex-wrap gap-1 mb-3">
          {treatment.indications.slice(0, 4).map((ind, i) => (
            <Badge key={i} variant="success" size="sm">
              <CheckCircleIcon size={10} weight="fill" />
              {ind}
            </Badge>
          ))}
          {treatment.indications.length > 4 && (
            <Badge variant="outline" size="sm">
              +{treatment.indications.length - 4}
            </Badge>
          )}
        </div>

        {/* Expand Toggle */}
        <button
          onClick={onToggle}
          className="flex items-center gap-1 text-xs text-[var(--cellora-dark-green)] hover:text-[var(--cellora-dark-green)]/80 transition-colors font-medium"
        >
          {isExpanded ? '접기' : '자세히 보기'}
          <CaretDownIcon
            size={12}
            className={cn('transition-transform', isExpanded && 'rotate-180')}
          />
        </button>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-[var(--border)] space-y-3">
                {/* Contraindications */}
                <div>
                  <p className="text-xs font-medium text-[var(--muted-foreground)] mb-2">
                    금기사항
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {treatment.contraindications.map((contra, i) => (
                      <Badge key={i} variant="error" size="sm">
                        <WarningCircleIcon size={10} weight="fill" />
                        {contra}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-[var(--muted-foreground)] mb-1">시술 간격</p>
                    <p className="text-[var(--foreground)]">
                      {treatment.intervalDays.min}-{treatment.intervalDays.max}일
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--muted-foreground)] mb-1">다운타임</p>
                    <p className="text-[var(--foreground)]">{treatment.downtime}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
