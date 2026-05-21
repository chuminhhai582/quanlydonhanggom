'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { OrderStatus, StatusTabItem } from '@/lib/types';
import { getStatusColor } from '@/lib/utils/order-code';

interface StatusTabsProps {
  counts: {
    all: number;
    not_started: number;
    in_progress: number;
    completed: number;
  };
}

const tabs: Omit<StatusTabItem, 'count'>[] = [
  { key: 'all', label: 'Tất cả', icon: '', color: '#7D3A1E' },
  { key: 'not_started', label: 'Chưa BĐ', icon: '🔘', color: '#94A3B8' },
  { key: 'in_progress', label: 'Đang CT', icon: '🟠', color: '#C8621A' },
  { key: 'completed', label: 'Đã HT', icon: '🟢', color: '#16A34A' },
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

            return (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={`
                  flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap
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
                {tab.icon && <span className="text-xs">{tab.icon}</span>}
                {tab.label}
                <span className={`
                  ml-1 px-1.5 py-0.5 rounded-md text-xs font-bold
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
