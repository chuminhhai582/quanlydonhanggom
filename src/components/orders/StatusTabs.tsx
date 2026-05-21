'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { OrderStatus, StatusTabItem } from '@/lib/types';
import { getStatusColor } from '@/lib/utils/order-code';
import { useRef, useEffect, useState } from 'react';

interface StatusTabsProps {
  counts: {
    all: number;
    not_started: number;
    crafting: number;
    drying: number;
    firing: number;
    broken: number;
    redoing: number;
    refiring: number;
  };
}

const tabs: Omit<StatusTabItem, 'count'>[] = [
  { key: 'all', label: 'Tất cả', icon: '', color: '#7D3A1E' },
  { key: 'not_started', label: 'Chưa BĐ', icon: '⚪', color: '#94A3B8' },
  { key: 'crafting', label: 'Chế tác', icon: '🟠', color: '#C8621A' },
  { key: 'drying', label: 'Phơi khô', icon: '🔵', color: '#0EA5E9' },
  { key: 'firing', label: 'Nung', icon: '🟡', color: '#EAB308' },
  { key: 'broken', label: 'Hỏng', icon: '🔴', color: '#DC2626' },
  { key: 'redoing', label: 'Làm lại', icon: '🟠', color: '#F97316' },
  { key: 'refiring', label: 'Nung lại', icon: '🟣', color: '#A855F7' },
];

export default function StatusTabs({ counts }: StatusTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeStatus = (searchParams.get('status') as OrderStatus | 'all') || 'all';
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll tab active vào giữa viewport trên mobile
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const scrollLeft = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeStatus]);

  const handleTabClick = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === 'all') {
      params.delete('status');
    } else {
      params.set('status', key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Trên mobile: hiển thị tất cả tab kể cả count=0 (để user biết có trạng thái đó)
  // Trên desktop: ẩn tab count=0

  return (
    <div className="sticky top-16 z-30 bg-[var(--color-cream)]/95 backdrop-blur-md border-b border-[var(--color-border-warm)]">
      <div className="max-w-7xl mx-auto">
        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="flex gap-1.5 sm:gap-2 overflow-x-auto py-2.5 px-3 sm:px-4 scrollbar-none scroll-smooth"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {tabs.map(tab => {
            const count = counts[tab.key as keyof typeof counts];
            const isActive = activeStatus === tab.key;
            // Trên mobile: luôn hiển thị; trên desktop sẽ ẩn bằng CSS nếu count=0
            if (tab.key !== 'all' && count === 0) {
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabClick(tab.key)}
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 bg-white/50 text-gray-400 border border-dashed border-gray-200"
                >
                  {tab.icon && <span className="text-[10px]">{tab.icon}</span>}
                  {tab.label}
                  <span className="ml-0.5 px-1 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold bg-gray-100/50">0</span>
                </button>
              );
            }

            return (
              <button
                key={tab.key}
                ref={isActive ? activeRef : null}
                onClick={() => handleTabClick(tab.key)}
                className={`
                  flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap
                  transition-all duration-200 shrink-0 active:scale-95
                  ${isActive
                    ? 'text-white shadow-md'
                    : 'bg-white text-gray-600 border border-[var(--color-border-warm)] hover:border-gray-300 hover:shadow-sm'}
                `}
                style={isActive ? {
                  background: tab.color,
                  boxShadow: `0 4px 14px ${tab.color}30`,
                } : undefined}
              >
                {tab.icon && <span className="text-[10px]">{tab.icon}</span>}
                {tab.label}
                <span className={`
                  ml-0.5 px-1 sm:px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold
                  ${isActive ? 'bg-white/20' : 'bg-gray-100'}
                `}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
