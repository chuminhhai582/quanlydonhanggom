'use client';

import { useState, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import StatusTabs from '@/components/orders/StatusTabs';
import PhoneDisplay from '@/components/orders/PhoneDisplay';
import InlineStatusSelect from '@/components/orders/InlineStatusSelect';
import InlineStaffSelect from '@/components/orders/InlineStaffSelect';
import InlineImageCell from '@/components/orders/InlineImageCell';
import InlineDateCell from '@/components/orders/InlineDateCell';
import { useAuth } from '@/lib/auth/auth-context';
import { getOrdersWithCustomer, mockStaffNames } from '@/lib/mock-data';
import { OrderStatus } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils/date';
import { getStatusLabel } from '@/lib/utils/order-code';
import { useOrderCounts } from '@/lib/hooks/useOrderCounts';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search, Plus, FileSpreadsheet, Eye, Pencil, Trash2, ChevronRight, Package
} from 'lucide-react';
import { toast } from 'sonner';

const MAX_STAGGER_DELAY = 0.3;

function OrdersTableContent() {
  const searchParams = useSearchParams();
  const { role } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery);
  const statusFilter = searchParams.get('status') as OrderStatus | null;

  // Quản lý dropdown: chỉ 1 cái mở tại 1 thời điểm
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const toggleDropdown = useCallback((key: string) => {
    setActiveDropdown(prev => prev === key ? null : key);
  }, []);
  const closeAllDropdowns = useCallback(() => setActiveDropdown(null), []);

  // Dữ liệu
  const [ordersState, setOrdersState] = useState(() => getOrdersWithCustomer(role || 'viewer'));
  const counts = useOrderCounts(ordersState);

  const filteredOrders = useMemo(() => {
    let result = ordersState;
    if (statusFilter) result = result.filter(o => o.status === statusFilter);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(o =>
        o.customer_name.toLowerCase().includes(q) ||
        o.order_code.toLowerCase().includes(q) ||
        o.product_name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [ordersState, statusFilter, debouncedSearch]);

  // --- Handlers ---
  const handleStatusUpdate = useCallback((orderId: string, newStatus: OrderStatus) => {
    setOrdersState(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: newStatus, updated_at: new Date().toISOString() } : o)
    );
    toast.success(`Đã cập nhật tiến độ: ${getStatusLabel(newStatus)}`);
  }, []);

  const handleStaffUpdate = useCallback((orderId: string, staffId: string) => {
    const staff = mockStaffNames.find(s => s.id === staffId);
    if (!staff) return;
    setOrdersState(prev =>
      prev.map(o => o.id === orderId ? { ...o, assigned_staff: [staff], updated_at: new Date().toISOString() } : o)
    );
    toast.success(`Đã chọn nghệ nhân: ${staff.name}`);
  }, []);

  const handleDateUpdate = useCallback((orderId: string, date: string) => {
    setOrdersState(prev =>
      prev.map(o => o.id === orderId ? { ...o, start_date: date, updated_at: new Date().toISOString() } : o)
    );
  }, []);

  const getStaggerDelay = (i: number) => Math.min(i * 0.03, MAX_STAGGER_DELAY);

  return (
    <div>
      <StatusTabs counts={counts} />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {/* Toolbar — responsive */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Tìm khách hàng, mã đơn..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9 sm:h-10 rounded-xl border-[var(--color-border-warm)] bg-white text-sm"
            />
          </div>
          {role === 'admin' && (
            <div className="flex gap-2">
              <Link href="/admin/don-hang/moi" className="flex-1 sm:flex-initial">
                <Button className="w-full sm:w-auto h-9 sm:h-10 rounded-xl bg-gradient-to-r from-[var(--color-terra)] to-[var(--color-ember)] hover:from-[var(--color-terra-dark)] hover:to-[var(--color-ember-dark)] shadow-sm text-sm">
                  <Plus size={16} className="mr-1" />
                  Tạo đơn
                </Button>
              </Link>
              <Link href="/admin/dong-bo-sheet" className="hidden sm:block">
                <Button variant="outline" className="h-9 sm:h-10 rounded-xl border-[var(--color-border-warm)] text-sm">
                  <FileSpreadsheet size={16} className="mr-1" />
                  <span className="hidden md:inline">Đồng bộ</span> Sheet
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* ====================== */}
        {/* Desktop/Large Tablet Table (≥1024px) */}
        {/* ====================== */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-[var(--color-border-warm)] overflow-visible animate-fade-in-up">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border-warm)] bg-[var(--color-cream)]/50">
                <th className="text-left py-3 px-3 xl:px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mã đơn</th>
                <th className="text-left py-3 px-3 xl:px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Khách hàng</th>
                <th className="text-left py-3 px-3 xl:px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sản phẩm</th>
                <th className="text-left py-3 px-3 xl:px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ảnh</th>
                <th className="text-left py-3 px-3 xl:px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ngày đặt</th>
                <th className="text-left py-3 px-3 xl:px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nghệ nhân</th>
                <th className="text-left py-3 px-3 xl:px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tiến độ</th>
                <th className="text-left py-3 px-3 xl:px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Cập nhật</th>
                <th className="text-right py-3 px-3 xl:px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, i) => (
                <tr
                  key={order.id}
                  className="border-b border-[var(--color-border-warm)]/50 hover:bg-[var(--color-cream)]/30 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${getStaggerDelay(i)}s` }}
                >
                  <td className="py-3 px-3 xl:px-4">
                    <span className="font-mono text-xs font-medium text-[var(--color-terra)]">{order.order_code}</span>
                  </td>
                  <td className="py-3 px-3 xl:px-4">
                    <p className="font-medium text-sm truncate max-w-[140px] xl:max-w-none">{order.customer_name}</p>
                    <PhoneDisplay phone={order.customer_phone} />
                  </td>
                  <td className="py-3 px-3 xl:px-4">
                    <p className="text-sm truncate max-w-[120px] xl:max-w-none">{order.product_name}</p>
                    <p className="text-xs text-muted-foreground">x{order.quantity}</p>
                  </td>
                  <td className="py-3 px-3 xl:px-4">
                    <InlineImageCell images={order.reference_images || []} orderId={order.id} canUpload={role === 'admin'} />
                  </td>
                  <td className="py-3 px-3 xl:px-4">
                    <InlineDateCell
                      value={order.start_date}
                      orderId={order.id}
                      onUpdate={handleDateUpdate}
                      isEditing={activeDropdown === `date-${order.id}`}
                      onStartEdit={() => toggleDropdown(`date-${order.id}`)}
                      onStopEdit={closeAllDropdowns}
                    />
                  </td>
                  <td className="py-3 px-3 xl:px-4">
                    <InlineStaffSelect
                      currentStaff={order.assigned_staff}
                      orderId={order.id}
                      onUpdate={handleStaffUpdate}
                      isOpen={activeDropdown === `staff-${order.id}`}
                      onToggle={() => toggleDropdown(`staff-${order.id}`)}
                    />
                  </td>
                  <td className="py-3 px-3 xl:px-4">
                    <InlineStatusSelect
                      value={order.status}
                      orderId={order.id}
                      onUpdate={handleStatusUpdate}
                      isOpen={activeDropdown === `status-${order.id}`}
                      onToggle={() => toggleDropdown(`status-${order.id}`)}
                    />
                  </td>
                  <td className="py-3 px-3 xl:px-4 hidden xl:table-cell">
                    {order.latest_update ? (
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(order.latest_update.created_at)}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 xl:px-4">
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

        {/* ====================== */}
        {/* Tablet Grid (md to lg: 768px - 1023px) */}
        {/* ====================== */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-3 animate-fade-in-up">
          {filteredOrders.map((order, i) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-[var(--color-border-warm)] overflow-hidden transition-all duration-200 card-hover animate-fade-in-up"
              style={{ animationDelay: `${getStaggerDelay(i)}s` }}
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-cream)]/30 border-b border-[var(--color-border-warm)]/50">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[var(--color-terra)] font-medium">{order.order_code}</span>
                  <InlineStatusSelect
                    value={order.status}
                    orderId={order.id}
                    onUpdate={handleStatusUpdate}
                    isOpen={activeDropdown === `t-status-${order.id}`}
                    onToggle={() => toggleDropdown(`t-status-${order.id}`)}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/don-hang/${order.id}`}>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg">
                      <Eye size={13} />
                    </Button>
                  </Link>
                  {role === 'admin' && (
                    <Link href={`/admin/don-hang/${order.id}/sua`}>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg">
                        <Pencil size={13} />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Card body */}
              <div className="p-4 space-y-2.5">
                <div>
                  <p className="font-semibold text-sm">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{order.product_name} x{order.quantity}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Ngày đặt</p>
                    <InlineDateCell
                      value={order.start_date}
                      orderId={order.id}
                      onUpdate={handleDateUpdate}
                      isEditing={activeDropdown === `t-date-${order.id}`}
                      onStartEdit={() => toggleDropdown(`t-date-${order.id}`)}
                      onStopEdit={closeAllDropdowns}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Nghệ nhân</p>
                    <InlineStaffSelect
                      currentStaff={order.assigned_staff}
                      orderId={order.id}
                      onUpdate={handleStaffUpdate}
                      isOpen={activeDropdown === `t-staff-${order.id}`}
                      onToggle={() => toggleDropdown(`t-staff-${order.id}`)}
                    />
                  </div>
                </div>

                {(order.reference_images.length > 0 || role === 'admin') && (
                  <div className="pt-2 border-t border-[var(--color-border-warm)]/50">
                    <InlineImageCell images={order.reference_images || []} orderId={order.id} canUpload={role === 'admin'} />
                  </div>
                )}
              </div>
            </div>
          ))}
          {filteredOrders.length === 0 && (
            <div className="col-span-2 text-center py-12 text-muted-foreground bg-white rounded-2xl border border-[var(--color-border-warm)]">
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Không tìm thấy đơn hàng</p>
            </div>
          )}
        </div>

        {/* ====================== */}
        {/* Mobile Cards (<768px) */}
        {/* ====================== */}
        <div className="md:hidden space-y-2.5">
          {filteredOrders.map((order, i) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-[var(--color-border-warm)] overflow-hidden transition-all duration-200 active:scale-[0.99] animate-fade-in-up"
              style={{ animationDelay: `${getStaggerDelay(i)}s` }}
            >
              {/* Top: code + status + arrow — status NGOÀI Link để tránh navigate */}
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-[var(--color-cream)]/20 border-b border-[var(--color-border-warm)]/30">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[11px] text-[var(--color-terra)] font-medium shrink-0">{order.order_code}</span>
                  <InlineStatusSelect
                    value={order.status}
                    orderId={order.id}
                    onUpdate={handleStatusUpdate}
                    isOpen={activeDropdown === `m-status-${order.id}`}
                    onToggle={() => toggleDropdown(`m-status-${order.id}`)}
                  />
                </div>
                <Link href={`/don-hang/${order.id}`} className="p-1.5 -mr-1.5 rounded-lg hover:bg-[var(--color-cream)] transition-colors">
                  <ChevronRight size={16} className="text-muted-foreground" />
                </Link>
              </div>

              {/* Body */}
              <div className="px-3.5 py-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-[13px] truncate">{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{order.product_name} x{order.quantity}</p>
                  </div>
                  <PhoneDisplay phone={order.customer_phone} />
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Ngày đặt</p>
                    <InlineDateCell
                      value={order.start_date}
                      orderId={order.id}
                      onUpdate={handleDateUpdate}
                      isEditing={activeDropdown === `m-date-${order.id}`}
                      onStartEdit={() => toggleDropdown(`m-date-${order.id}`)}
                      onStopEdit={closeAllDropdowns}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Nghệ nhân</p>
                    <InlineStaffSelect
                      currentStaff={order.assigned_staff}
                      orderId={order.id}
                      onUpdate={handleStaffUpdate}
                      isOpen={activeDropdown === `m-staff-${order.id}`}
                      onToggle={() => toggleDropdown(`m-staff-${order.id}`)}
                    />
                  </div>
                  {order.latest_update && (
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      🕐 {formatRelativeTime(order.latest_update.created_at)}
                    </span>
                  )}
                </div>

                {/* Ảnh minh họa */}
                {(order.reference_images.length > 0 || role === 'admin') && (
                  <div className="pt-2 border-t border-[var(--color-border-warm)]/30">
                    <InlineImageCell images={order.reference_images || []} orderId={order.id} canUpload={role === 'admin'} />
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <Package size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium text-sm">Không tìm thấy đơn hàng</p>
              <p className="text-xs mt-1">Thử thay đổi bộ lọc hoặc từ khóa</p>
            </div>
          )}
        </div>
      </div>
    </div>
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
