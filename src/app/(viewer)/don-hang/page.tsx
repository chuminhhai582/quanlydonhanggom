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

// Giới hạn stagger animation để tránh jank
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

  const closeAllDropdowns = useCallback(() => {
    setActiveDropdown(null);
  }, []);

  // Dữ liệu
  const [ordersState, setOrdersState] = useState(() => getOrdersWithCustomer(role || 'viewer'));
  const counts = useOrderCounts(ordersState);

  const filteredOrders = useMemo(() => {
    let result = ordersState;
    if (statusFilter) {
      result = result.filter(o => o.status === statusFilter);
    }
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

  const getStaggerDelay = (index: number) =>
    Math.min(index * 0.03, MAX_STAGGER_DELAY);

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
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-[var(--color-border-warm)] overflow-visible animate-fade-in-up">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border-warm)] bg-[var(--color-cream)]/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mã đơn</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Khách hàng</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sản phẩm</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ảnh minh họa</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ngày đặt</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nghệ nhân</th>
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
                  style={{ animationDelay: `${getStaggerDelay(i)}s` }}
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
                    <InlineImageCell
                      images={order.reference_images || []}
                      orderId={order.id}
                      canUpload={role === 'admin'}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <InlineDateCell
                      value={order.start_date}
                      orderId={order.id}
                      onUpdate={handleDateUpdate}
                      isEditing={activeDropdown === `date-${order.id}`}
                      onStartEdit={() => toggleDropdown(`date-${order.id}`)}
                      onStopEdit={closeAllDropdowns}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <InlineStaffSelect
                      currentStaff={order.assigned_staff}
                      orderId={order.id}
                      onUpdate={handleStaffUpdate}
                      isOpen={activeDropdown === `staff-${order.id}`}
                      onToggle={() => toggleDropdown(`staff-${order.id}`)}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <InlineStatusSelect
                      value={order.status}
                      orderId={order.id}
                      onUpdate={handleStatusUpdate}
                      isOpen={activeDropdown === `status-${order.id}`}
                      onToggle={() => toggleDropdown(`status-${order.id}`)}
                    />
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
            <div
              key={order.id}
              className="bg-white rounded-2xl p-4 border border-[var(--color-border-warm)] transition-all duration-200 card-hover animate-fade-in-up"
              style={{ animationDelay: `${getStaggerDelay(i)}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[var(--color-terra)] font-medium">{order.order_code}</span>
                  <InlineStatusSelect
                    value={order.status}
                    orderId={order.id}
                    onUpdate={handleStatusUpdate}
                    isOpen={activeDropdown === `m-status-${order.id}`}
                    onToggle={() => toggleDropdown(`m-status-${order.id}`)}
                  />
                </div>
                <Link href={`/don-hang/${order.id}`}>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </Link>
              </div>

              <p className="font-semibold text-sm">{order.customer_name}</p>
              <PhoneDisplay phone={order.customer_phone} />
              <p className="text-sm text-muted-foreground mt-1">{order.product_name} x{order.quantity}</p>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border-warm)]/50">
                <div className="flex items-center gap-4">
                  <div>
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
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Nghệ nhân</p>
                    <InlineStaffSelect
                      currentStaff={order.assigned_staff}
                      orderId={order.id}
                      onUpdate={handleStaffUpdate}
                      isOpen={activeDropdown === `m-staff-${order.id}`}
                      onToggle={() => toggleDropdown(`m-staff-${order.id}`)}
                    />
                  </div>
                </div>
                {order.latest_update && (
                  <span className="text-[10px] text-muted-foreground">
                    🕐 {formatRelativeTime(order.latest_update.created_at)}
                  </span>
                )}
              </div>

              {(order.reference_images.length > 0 || role === 'admin') && (
                <div className="mt-3 pt-3 border-t border-[var(--color-border-warm)]/50">
                  <p className="text-[10px] text-muted-foreground mb-1.5">Ảnh minh họa</p>
                  <InlineImageCell images={order.reference_images || []} orderId={order.id} canUpload={role === 'admin'} />
                </div>
              )}
            </div>
          ))}
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
