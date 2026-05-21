'use client';

import { useState, useEffect } from 'react';

/**
 * Hook debounce giá trị - tránh filter/search chạy liên tục khi user gõ nhanh.
 * Mặc định 300ms delay.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
