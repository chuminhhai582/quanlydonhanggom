'use client';

import { useRef } from 'react';
import StatusBadge from '@/components/orders/StatusBadge';
import { useClickOutside } from '@/lib/hooks/useClickOutside';
import { OrderStatus } from '@/lib/types';
import { getStatusLabel, getStatusColor } from '@/lib/utils/order-code';
import { ChevronDown, Check } from 'lucide-react';

const ALL_STATUSES: OrderStatus[] = [
  'not_started', 'crafting', 'drying', 'firing', 'broken', 'redoing', 'refiring'
];

interface InlineStatusSelectProps {
  value: OrderStatus;
  orderId: string;
  onUpdate: (id: string, status: OrderStatus) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function InlineStatusSelect({
  value, orderId, onUpdate, isOpen, onToggle
}: InlineStatusSelectProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside([triggerRef, menuRef], isOpen, onToggle);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={onToggle}
        className="flex items-center gap-1.5 group cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <StatusBadge status={value} size="sm" />
        <ChevronDown size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
      {isOpen && (
        <div
          ref={menuRef}
          role="listbox"
          aria-label="Chọn tiến độ"
          className="absolute left-0 top-full mt-1 z-[100] bg-white rounded-xl shadow-xl border border-[var(--color-border-warm)] py-1.5 min-w-[180px] animate-scale-in"
          style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.12))' }}
        >
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              role="option"
              aria-selected={s === value}
              onClick={() => { onUpdate(orderId, s); onToggle(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[var(--color-cream)]/60 transition-colors ${s === value ? 'bg-[var(--color-cream)]/40 font-medium' : ''}`}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getStatusColor(s) }} />
              {getStatusLabel(s)}
              {s === value && <Check size={14} className="ml-auto text-[var(--color-terra)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
