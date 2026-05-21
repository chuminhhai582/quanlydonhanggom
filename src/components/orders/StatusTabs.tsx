'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { OrderStatus, StatusTabItem } from '@/lib/types';
import { getStatusColor } from '@/lib/utils/order-code';

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

  const handleTabClick = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === 'all') {
      params.delete('status');
    } else {
      params.set('status', key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="sticky top-16 z-30 bg-[var(--color-cream)]/95 backdrop-blur-md border-b border-[var(--color-border-warm)] py-3 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map(tab => {
            const count = counts[tab.key as keyof typeof counts];
            const isActive = activeStatus === tab.key;
            if (tab.key !== 'all' && count === 0) return null;

            return (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap
                  transition-all duration-200 shrink-0
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
                  ml-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold
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
