'use client';

import { OrderStatus } from '@/lib/types';
import { getStatusLabel, getStatusColor } from '@/lib/utils/order-code';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`status-chip status-chip-${status} ${sizeClasses[size]}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: getStatusColor(status) }}
      />
      {getStatusLabel(status)}
    </span>
  );
}
