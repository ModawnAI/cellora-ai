'use client';

import { motion } from 'motion/react';
import {
  ScanIcon,
  LightbulbIcon,
  ChatCircleIcon,
  SyringeIcon,
} from '@phosphor-icons/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { RecentActivity as RecentActivityType } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface RecentActivityProps {
  activities: RecentActivityType[];
}

const activityIcons = {
  analysis: { icon: ScanIcon, color: 'text-[var(--cellora-dark-green)]', bg: 'bg-[var(--cellora-mint)]/30' },
  recommendation: { icon: LightbulbIcon, color: 'text-[var(--cellora-green-dark)]', bg: 'bg-[var(--cellora-green-lighter)]' },
  consultation: { icon: ChatCircleIcon, color: 'text-[var(--cellora-brown)]', bg: 'bg-[var(--cellora-brown-lighter)]' },
  treatment: { icon: SyringeIcon, color: 'text-[var(--cellora-brown-dark)]', bg: 'bg-[var(--cellora-brown-lighter)]' },
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">최근 활동</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-[var(--border)]" />

          <div className="space-y-4">
            {activities.slice(0, 8).map((activity, index) => {
              const { icon: Icon, color, bg } = activityIcons[activity.type];

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="relative flex gap-3"
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      'relative z-10 flex h-10 w-10 items-center justify-center rounded-full',
                      bg
                    )}
                  >
                    <Icon size={18} weight="fill" className={color} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm text-[var(--foreground)]">
                      <span className="font-medium">{activity.patientName}</span>
                      <span className="text-[var(--muted-foreground)]">님 </span>
                      {activity.description}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
