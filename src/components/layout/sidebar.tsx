'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import {
  HouseIcon,
  UsersIcon,
  ScanIcon,
  FlaskIcon,
  ChartBarIcon,
  GearIcon,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: '대시보드', href: '/', icon: HouseIcon },
  { name: '환자 목록', href: '/patients', icon: UsersIcon },
  { name: '피부 분석', href: '/analysis', icon: ScanIcon },
  { name: '시술 카탈로그', href: '/treatments', icon: FlaskIcon },
  { name: '통계', href: '/analytics', icon: ChartBarIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex min-h-0 flex-1 flex-col border-r border-[var(--border)] bg-[var(--card)]">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-center bg-[#172C23]">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Cellora AI"
              width={140}
              height={32}
              priority
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[var(--cellora-mint)]/20 text-[var(--cellora-dark-green)]'
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 w-1 h-6 bg-[var(--cellora-dark-green)] rounded-r-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon
                  size={20}
                  weight={isActive ? 'fill' : 'regular'}
                  className={cn(
                    'shrink-0 transition-colors',
                    isActive ? 'text-[var(--cellora-dark-green)]' : 'text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-[var(--border)] p-4">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <GearIcon size={20} />
            설정
          </Link>
        </div>
      </div>
    </aside>
  );
}
