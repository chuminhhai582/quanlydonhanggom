'use client';

import { useMemo } from 'react';
import { OrderWithCustomer, OrderStatus } from '@/lib/types';

/**
 * Tính counts cho tất cả trạng thái bằng 1 vòng reduce duy nhất.
 * Thay vì 8 lần .filter() riêng biệt.
 */

export type StatusCounts = {
  all: number;
  not_started: number;
  crafting: number;
  drying: number;
  firing: number;
  broken: number;
  redoing: number;
  refiring: number;
};

const INITIAL_COUNTS: StatusCounts = {
  all: 0,
  not_started: 0,
  crafting: 0,
  drying: 0,
  firing: 0,
  broken: 0,
  redoing: 0,
  refiring: 0,
};

export function useOrderCounts(orders: OrderWithCustomer[]): StatusCounts {
  return useMemo(() => {
    const counts = { ...INITIAL_COUNTS };
    counts.all = orders.length;
    for (const order of orders) {
      const status = order.status as keyof Omit<StatusCounts, 'all'>;
      if (status in counts) {
        counts[status]++;
      }
    }
    return counts;
  }, [orders]);
}
