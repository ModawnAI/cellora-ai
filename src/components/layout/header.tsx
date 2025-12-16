'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  ListIcon,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-sm px-4 sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="lg:hidden p-2 -m-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        onClick={onMenuClick}
      >
        <ListIcon size={24} />
      </button>

      {/* Search */}
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1 items-center">
          <motion.div
            className={cn(
              'relative flex w-full max-w-md items-center rounded-lg border transition-all duration-200',
              searchFocused
                ? 'border-[var(--cellora-mint)] ring-1 ring-[var(--cellora-mint)]/20'
                : 'border-[var(--border)]'
            )}
            animate={{ scale: searchFocused ? 1.02 : 1 }}
            transition={{ duration: 0.15 }}
          >
            <MagnifyingGlassIcon
              size={18}
              className={cn(
                'absolute left-3 transition-colors',
                searchFocused ? 'text-[var(--cellora-mint)]' : 'text-[var(--muted-foreground)]'
              )}
            />
            <input
              type="text"
              placeholder="환자 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full bg-transparent py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
            />
            {searchQuery && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-3 text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-1.5 py-0.5 rounded"
              >
                Enter
              </motion.span>
            )}
          </motion.div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <button
            type="button"
            className="relative p-2 -m-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <BellIcon size={22} />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[var(--cellora-mint)] ring-2 ring-[var(--background)]" />
          </button>

          {/* Divider */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-[var(--border)]" />

          {/* Profile */}
          <div className="flex items-center gap-x-3">
            <div className="hidden lg:flex lg:flex-col lg:items-end">
              <p className="text-sm font-medium text-[var(--foreground)]">박기범</p>
              <p className="text-xs text-[var(--muted-foreground)]">원장</p>
            </div>
            <button
              type="button"
              className="flex items-center justify-center h-9 w-9 rounded-full bg-[var(--cellora-mint)]/30 text-[var(--cellora-dark-green)] hover:bg-[var(--cellora-mint)]/40 transition-colors"
            >
              <UserCircleIcon size={24} weight="fill" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
