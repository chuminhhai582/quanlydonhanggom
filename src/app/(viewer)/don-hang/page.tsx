'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import StatusTabs from '@/components/orders/StatusTabs';
import StatusBadge from '@/components/orders/StatusBadge';
import PhoneDisplay from '@/components/orders/PhoneDisplay';
import { useAuth } from '@/lib/auth/auth-context';
import { getOrdersWithCustomer } from '@/lib/mock-data';
import { OrderWithCustomer, OrderStatus } from '@/lib/types';
import { formatShortDate, formatRelativeTime, getDueDateColor, getDueDateLabel, isOverdue } from '@/lib/utils/date';
import { formatPrice } from '@/lib/utils/order-code';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Search, Plus, FileSpreadsheet, Eye, Pencil, Trash2, AlertTriangle, ChevronRight, SlidersHorizontal
} from 'lucide-react';

function OrdersTableContent() {
  const searchParams = useSearchParams();
  const { role } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const statusFilter = searchParams.get('status') as OrderStatus | null;

  const orders = useMemo(() => getOrdersWithCustomer(role || 'viewer'), [role]);

  const counts = useMemo(() => ({
    all: orders.length,
    not_started: orders.filter(o => o.status === 'not_started').length,
    in_progress: orders.filter(o => o.status === 'in_progress').length,
    completed: orders.filter(o => o.status === 'completed').length,
  }), [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (statusFilter) {
      result = result.filter(o => o.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o =>
        o.customer_name.toLowerCase().includes(q) ||
        o.order_code.toLowerCase().includes(q) ||
        o.product_name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, statusFilter, searchQuery]);

  return (
    <div>
      <StatusTabs counts={counts} />

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Tìm khách hàng, mã đơn..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl border-[var(--color-border-warm)] bg-white"
            />
          </div>
          <div className="flex gap-2">
            {role === 'admin' && (
              <>
                <Link href="/admin/don-hang/moi">
                  <Button className="h-10 rounded-xl bg-gradient-to-r from-[var(--color-terra)] to-[var(--color-ember)] hover:from-[var(--color-terra-dark)] hover:to-[var(--color-ember-dark)] shadow-sm">
                    <Plus size={16} className="mr-1.5" />
                    Tạo đơn
                  </Button>
                </Link>
                <Link href="/admin/dong-bo-sheet">
                  <Button variant="outline" className="h-10 rounded-xl border-[var(--color-border-warm)]">
                    <FileSpreadsheet size={16} className="mr-1.5" />
                    Đồng bộ Sheet
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-[var(--color-border-warm)] overflow-hidden animate-fade-in-up">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border-warm)] bg-[var(--color-cream)]/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mã đơn</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Khách hàng</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sản phẩm</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hạn giao</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">NV</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tiến độ</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cập nhật</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, i) => (
                <tr
                  key={order.id}
                  className="border-b border-[var(--color-border-warm)]/50 hover:bg-[var(--color-cream)]/30 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs font-medium text-[var(--color-terra)]">{order.order_code}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-sm">{order.customer_name}</p>
                      <PhoneDisplay phone={order.customer_phone} />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm">{order.product_name}</p>
                    <p className="text-xs text-muted-foreground">x{order.quantity}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      {isOverdue(order.due_date, order.status) && (
                        <AlertTriangle size={14} className="text-red-500 shrink-0" />
                      )}
                      <div>
                        <p className={`text-sm font-medium ${getDueDateColor(order.due_date, order.status)}`}>
                          {formatShortDate(order.due_date)}
                        </p>
                        <p className={`text-[10px] ${getDueDateColor(order.due_date, order.status)}`}>
                          {getDueDateLabel(order.due_date, order.status)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex -space-x-1.5">
                      {order.assigned_staff.slice(0, 2).map(staff => (
                        <Avatar key={staff.id} className="w-7 h-7 border-2 border-white">
                          <AvatarFallback className="text-[10px] font-bold text-white" style={{ background: staff.avatar_color }}>
                            {staff.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {order.assigned_staff.length > 2 && (
                        <div className="w-7 h-7 rounded-full bg-[var(--color-cream-dark)] border-2 border-white flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                          +{order.assigned_staff.length - 2}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={order.status} size="sm" />
                      <div className="w-16">
                        <div className="progress-bar h-1.5">
                          <div className="progress-bar-fill" style={{ width: `${Math.min((order.updates_count / 6) * 100, 100)}%` }} />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{order.updates_count}/6 mốc</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {order.latest_update ? (
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(order.latest_update.created_at)}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 justify-end">
                      <Link href={`/don-hang/${order.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-[var(--color-cream)]">
                          <Eye size={14} />
                        </Button>
                      </Link>
                      {role === 'admin' && (
                        <>
                          <Link href={`/admin/don-hang/${order.id}/sua`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-[var(--color-cream)]">
                              <Pencil size={14} />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-red-50 text-red-500">
                            <Trash2 size={14} />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Không tìm thấy đơn hàng</p>
              <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filteredOrders.map((order, i) => (
            <Link key={order.id} href={`/don-hang/${order.id}`}>
              <div
                className={`
                  bg-white rounded-2xl p-4 border transition-all duration-200 card-hover animate-fade-in-up
                  ${isOverdue(order.due_date, order.status) ? 'border-red-200' : 'border-[var(--color-border-warm)]'}
                `}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-mono text-xs text-[var(--color-terra)] font-medium">{order.order_code}</span>
                    <StatusBadge status={order.status} size="sm" />
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>

                <p className="font-semibold text-sm">{order.customer_name}</p>
                <PhoneDisplay phone={order.customer_phone} />
                <p className="text-sm text-muted-foreground mt-1">{order.product_name} x{order.quantity}</p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border-warm)]/50">
                  <div className="flex items-center gap-1.5">
                    {isOverdue(order.due_date, order.status) && <AlertTriangle size={12} className="text-red-500" />}
                    <span className={`text-xs font-medium ${getDueDateColor(order.due_date, order.status)}`}>
                      Hạn: {formatShortDate(order.due_date)} ({getDueDateLabel(order.due_date, order.status)})
                    </span>
                  </div>
                  <div className="flex -space-x-1">
                    {order.assigned_staff.slice(0, 2).map(s => (
                      <Avatar key={s.id} className="w-5 h-5 border border-white">
                        <AvatarFallback className="text-[8px] text-white font-bold" style={{ background: s.avatar_color }}>
                          {s.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>

                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                    <span>{order.updates_count}/6 mốc</span>
                    {order.latest_update && (
                      <span className="flex items-center gap-1">
                        🕐 {formatRelativeTime(order.latest_update.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="progress-bar h-1.5">
                    <div className="progress-bar-fill" style={{ width: `${Math.min((order.updates_count / 6) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Package({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M16.5 9.4 7.55 4.24" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" x2="12" y1="22.08" y2="12" />
    </svg>
  );
}

export default function DonHangPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-[var(--color-terra)]">Đang tải...</div>
      </div>
    }>
      <OrdersTableContent />
    </Suspense>
  );
}
