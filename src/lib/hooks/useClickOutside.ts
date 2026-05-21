'use client';

import { useEffect, RefObject } from 'react';

/**
 * Hook đóng dropdown/popover khi click ra ngoài các ref elements.
 * Thay thế logic useEffect lặp lại ở nhiều component.
 */
export function useClickOutside(
  refs: RefObject<HTMLElement | null>[],
  isActive: boolean,
  onClose: () => void
) {
  useEffect(() => {
    if (!isActive) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideAnyRef = refs.some(
        ref => ref.current && ref.current.contains(target)
      );
      if (!isInsideAnyRef) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [refs, isActive, onClose]);
}
