'use client';

import { useState, useEffect, useCallback } from 'react';
import { OrderWithCustomer, OrderStatus } from '@/lib/types';

/**
 * Hook fetch đơn hàng từ API /api/orders (Supabase).
 */
export function useOrders(role: 'admin' | 'viewer') {
  const [orders, setOrders] = useState<OrderWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders?role=${role}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Cho phép cập nhật local state (optimistic update)
  const updateOrder = useCallback((orderId: string, updates: Partial<OrderWithCustomer>) => {
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, ...updates } : o)
    );
  }, []);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { orders, setOrders, loading, error, updateOrder, refetch };
}
