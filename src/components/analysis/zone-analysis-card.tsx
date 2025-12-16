'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, CaretRight, CaretDown } from '@phosphor-icons/react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  MetaVuZone,
  MetaVuZoneAnalysis,
  metaVuZoneLabels,
  severityColors,
} from '@/lib/types';
import { cn } from '@/lib/utils';

interface ZoneAnalysisCardProps {
  metaVuZones: Record<MetaVuZone, MetaVuZoneAnalysis>;
  className?: string;
}

// Group zones by facial region
const zoneGroups = {
  상부: ['forehead', 'glabella', 'leftPeriorbital', 'rightPeriorbital'] as MetaVuZone[],
  중부: ['leftUpperCheek', 'rightUpperCheek', 'nose', 'leftLowerCheek', 'rightLowerCheek'] as MetaVuZone[],
  하부: ['leftNasolabial', 'rightNasolabial', 'upperLip', 'chin'] as MetaVuZone[],
};

export function ZoneAnalysisCard({ metaVuZones, className }: ZoneAnalysisCardProps) {
  const [expandedZone, setExpandedZone] = useState<MetaVuZone | null>(null);

  const getSeverityLabel = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'critical': return '심각';
      case 'high': return '주의';
      case 'medium': return '보통';
      case 'low': return '양호';
    }
  };

  const getSeverityBadgeVariant = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'critical': return 'error' as const;
      case 'high': return 'warning' as const;
      case 'medium': return 'default' as const;
      case 'low': return 'success' as const;
    }
  };

  const renderZoneDetails = (zone: MetaVuZoneAnalysis) => {
    const details: { label: string; value: string | number }[] = [];

    if (zone.pores) {
      details.push(
        { label: '모공 (총)', value: zone.pores.count },
        { label: '확대모공', value: zone.pores.large },
      );
    }
    if (zone.wrinkles) {
      details.push(
        { label: '주름 (총)', value: zone.wrinkles.count },
        { label: '깊은주름', value: zone.wrinkles.deep },
      );
    }
    if (zone.pigmentation) {
      details.push(
        { label: '갈색반점', value: zone.pigmentation.brownSpots },
        { label: 'UV손상', value: zone.pigmentation.uvSpots },
      );
    }
    if (zone.vascular) {
      details.push({ label: '붉은반점', value: zone.vascular.redSpots });
    }
    if (zone.sebum !== undefined) {
      details.push({ label: '피지', value: `${zone.sebum}/100` });
    }

    return details;
  };

  // Calculate zone statistics
  const zoneCounts = {
    critical: Object.values(metaVuZones).filter(z => z.severity === 'critical').length,
    high: Object.values(metaVuZones).filter(z => z.severity === 'high').length,
    medium: Object.values(metaVuZones).filter(z => z.severity === 'medium').length,
    low: Object.values(metaVuZones).filter(z => z.severity === 'low').length,
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin size={20} className="text-[var(--cellora-dark-green)]" />
            13개 부위 상세 분석
          </CardTitle>
          <div className="flex items-center gap-1.5">
            {zoneCounts.critical > 0 && (
              <Badge variant="error" className="text-[10px]">심각 {zoneCounts.critical}</Badge>
            )}
            {zoneCounts.high > 0 && (
              <Badge variant="warning" className="text-[10px]">주의 {zoneCounts.high}</Badge>
            )}
            <Badge variant="success" className="text-[10px]">양호 {zoneCounts.low}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(zoneGroups).map(([groupName, zones]) => (
            <div key={groupName}>
              <h4 className="text-xs font-medium text-[var(--muted-foreground)] mb-2 uppercase tracking-wider">
                {groupName} 얼굴
              </h4>
              <div className="space-y-2">
                {zones.map((zoneKey) => {
                  const zone = metaVuZones[zoneKey];
                  const isExpanded = expandedZone === zoneKey;
                  const details = renderZoneDetails(zone);

                  return (
                    <motion.div
                      key={zoneKey}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border border-[var(--border)] rounded-lg overflow-hidden"
                    >
                      {/* Zone Header */}
                      <button
                        onClick={() => setExpandedZone(isExpanded ? null : zoneKey)}
                        className={cn(
                          'w-full flex items-center justify-between p-3 transition-colors',
                          isExpanded ? 'bg-[var(--muted)]/30' : 'hover:bg-[var(--muted)]/20'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <CaretDown size={14} className="text-[var(--muted-foreground)]" />
                          ) : (
                            <CaretRight size={14} className="text-[var(--muted-foreground)]" />
                          )}
                          <span className="text-sm font-medium text-[var(--foreground)]">
                            {zone.label}
                          </span>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {metaVuZoneLabels[zoneKey].en}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {zone.primaryConcern !== '양호' && (
                            <span className="text-xs text-[var(--muted-foreground)]">
                              {zone.primaryConcern}
                            </span>
                          )}
                          <Badge variant={getSeverityBadgeVariant(zone.severity)}>
                            {getSeverityLabel(zone.severity)}
                          </Badge>
                        </div>
                      </button>

                      {/* Zone Details (Expandable) */}
                      <AnimatePresence>
                        {isExpanded && details.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 pt-1 border-t border-[var(--border)] bg-[var(--muted)]/10">
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {details.map((detail, i) => (
                                  <div
                                    key={i}
                                    className="bg-white/50 rounded-lg p-2 text-center"
                                  >
                                    <p className="text-[10px] text-[var(--muted-foreground)]">
                                      {detail.label}
                                    </p>
                                    <p className="text-sm font-semibold text-[var(--foreground)]">
                                      {detail.value}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Zone Summary */}
        <div className="mt-6 pt-4 border-t border-[var(--border)]">
          <h4 className="text-xs font-medium text-[var(--muted-foreground)] mb-3">
            주요 문제 부위
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(metaVuZones)
              .filter(([, zone]) => zone.severity === 'high' || zone.severity === 'critical')
              .map(([key, zone]) => (
                <Badge
                  key={key}
                  variant={zone.severity === 'critical' ? 'error' : 'warning'}
                  className="cursor-pointer"
                  onClick={() => setExpandedZone(key as MetaVuZone)}
                >
                  {zone.label}: {zone.primaryConcern}
                </Badge>
              ))}
            {Object.values(metaVuZones).every(z => z.severity === 'low' || z.severity === 'medium') && (
              <span className="text-sm text-[var(--muted-foreground)]">
                심각한 문제 부위가 없습니다.
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
