'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useClickOutside } from '@/lib/hooks/useClickOutside';
import { mockStaffNames } from '@/lib/mock-data';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronDown, Check } from 'lucide-react';

interface InlineStaffSelectProps {
  currentStaff: { id: string; name: string; avatar_color: string }[];
  orderId: string;
  onUpdate: (id: string, staffId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function InlineStaffSelect({
  currentStaff, orderId, onUpdate, isOpen, onToggle
}: InlineStaffSelectProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedId = currentStaff[0]?.id || '';
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useClickOutside([triggerRef, menuRef], isOpen, onToggle);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = 100;
    const spaceBelow = window.innerHeight - rect.bottom;

    setMenuPos({
      top: spaceBelow < menuHeight ? rect.top - menuHeight - 4 : rect.bottom + 4,
      left: rect.left,
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
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
        {currentStaff.length > 0 ? (
          <div className="flex items-center gap-1.5">
            <Avatar className="w-7 h-7 border-2 border-white">
              <AvatarFallback className="text-[10px] font-bold text-white" style={{ background: currentStaff[0].avatar_color }}>
                {currentStaff[0].name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground hidden lg:inline">{currentStaff[0].name}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Chọn</span>
        )}
        <ChevronDown size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          aria-label="Chọn nghệ nhân"
          className="fixed z-[9999] bg-white rounded-xl border border-[var(--color-border-warm)] py-1.5 min-w-[160px] animate-scale-in"
          style={{
            top: menuPos.top,
            left: menuPos.left,
            boxShadow: '0 8px 30px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          {mockStaffNames.map(staff => (
            <button
              key={staff.id}
              role="option"
              aria-selected={staff.id === selectedId}
              onClick={() => { onUpdate(orderId, staff.id); onToggle(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[var(--color-cream)]/60 transition-colors ${staff.id === selectedId ? 'bg-[var(--color-cream)]/40 font-medium' : ''}`}
            >
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-[9px] font-bold text-white" style={{ background: staff.avatar_color }}>
                  {staff.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {staff.name}
              {staff.id === selectedId && <Check size={14} className="ml-auto text-[var(--color-terra)]" />}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
