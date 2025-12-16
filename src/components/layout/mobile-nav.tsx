'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import {
  HouseIcon,
  UsersIcon,
  ScanIcon,
  FlaskIcon,
  ChartBarIcon,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: '홈', href: '/', icon: HouseIcon },
  { name: '환자', href: '/patients', icon: UsersIcon },
  { name: '분석', href: '/analysis', icon: ScanIcon },
  { name: '시술', href: '/treatments', icon: FlaskIcon },
  { name: '통계', href: '/analytics', icon: ChartBarIcon },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="border-t border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative flex flex-col items-center gap-1 px-3 py-2"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-[var(--cellora-dark-green)] rounded-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon
                  size={22}
                  weight={isActive ? 'fill' : 'regular'}
                  className={cn(
                    'transition-colors',
                    isActive ? 'text-[var(--cellora-dark-green)]' : 'text-[var(--muted-foreground)]'
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-medium transition-colors',
                    isActive ? 'text-[var(--cellora-dark-green)]' : 'text-[var(--muted-foreground)]'
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Safe area padding for mobile devices */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </nav>
  );
}
