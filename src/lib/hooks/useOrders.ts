'use client';

import { useState, useEffect, useCallback } from 'react';
import { OrderWithCustomer, OrderStatus } from '@/lib/types';
import { getOrdersWithCustomer } from '@/lib/mock-data';

/**
 * Hook fetch đơn hàng từ API /api/orders (Supabase).
 * Fallback: nếu API lỗi → dùng mock-data client-side.
 */
export function useOrders(role: 'admin' | 'viewer') {
  const [orders, setOrders] = useState<OrderWithCustomer[]>(() => getOrdersWithCustomer(role));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders?role=${role}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setOrders(data);
      }
      // Nếu API trả mảng rỗng → giữ mock-data (Supabase chưa có data)
    } catch {
      setError('Không thể kết nối Supabase, đang dùng dữ liệu mẫu');
      // Giữ nguyên mock-data đã set ở useState initializer
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
