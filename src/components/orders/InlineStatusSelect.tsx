'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useClickOutside([triggerRef, menuRef], isOpen, onToggle);

  // Tính vị trí menu dựa trên trigger button
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = 280; // chiều cao ước lượng cho 7 items
    const spaceBelow = window.innerHeight - rect.bottom;

    setMenuPos({
      top: spaceBelow < menuHeight ? rect.top - menuHeight - 4 : rect.bottom + 4,
      left: rect.left,
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      // Cập nhật vị trí khi scroll
      window.addEventListener('scroll', updatePosition, true);
      return () => window.removeEventListener('scroll', updatePosition, true);
    }
  }, [isOpen, updatePosition]);

  return (
    <div className="relative inline-flex">
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

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          aria-label="Chọn tiến độ"
          className="fixed z-[9999] bg-white rounded-xl border border-[var(--color-border-warm)] py-1.5 min-w-[180px] animate-scale-in"
          style={{
            top: menuPos.top,
            left: menuPos.left,
            boxShadow: '0 8px 30px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
          }}
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
        </div>,
        document.body
      )}
    </div>
  );
}
