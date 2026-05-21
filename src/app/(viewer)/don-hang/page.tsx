'use client';

import { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import StatusTabs from '@/components/orders/StatusTabs';
import OrderSkeleton from '@/components/orders/OrderSkeleton';
import { useAuth } from '@/lib/auth/auth-context';
import { StaffName } from '@/lib/types';
import OrderTableRow from '@/components/orders/OrderTableRow';
import OrderCardMobile from '@/components/orders/OrderCardMobile';
import { useOrders } from '@/lib/hooks/useOrders';
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

  // Fetch staff từ Supabase
  const [staffList, setStaffList] = useState<StaffName[]>([]);
  useEffect(() => {
    async function fetchStaff() {
      try {
        const res = await fetch('/api/staff');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setStaffList(data);
        }
      } catch (err) {
        console.error('Error fetching staff:', err);
      }
    }
    fetchStaff();
  }, []);

  // Dữ liệu — fetch từ Supabase
  const { orders: ordersState, setOrders: setOrdersState, loading } = useOrders(role || 'viewer');
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
    const staff = staffList.find(s => s.id === staffId);
    if (!staff) return;
    setOrdersState(prev =>
      prev.map(o => o.id === orderId ? { ...o, assigned_staff: [staff], updated_at: new Date().toISOString() } : o)
    );
    toast.success(`Đã chọn nghệ nhân: ${staff.name}`);
  }, [staffList]);

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

        {loading ? (
          <OrderSkeleton />
        ) : (
          <>
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
                <OrderTableRow
                  key={order.id}
                  order={order}
                  role={role}
                  activeDropdown={activeDropdown}
                  toggleDropdown={toggleDropdown}
                  closeAllDropdowns={closeAllDropdowns}
                  handleStatusUpdate={handleStatusUpdate}
                  handleDateUpdate={handleDateUpdate}
                  handleStaffUpdate={handleStaffUpdate}
                />
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
            <div key={order.id} className="animate-fade-in-up" style={{ animationDelay: `${getStaggerDelay(i)}s` }}>
              <OrderCardMobile
                order={order}
                role={role}
                activeDropdown={activeDropdown}
                toggleDropdown={toggleDropdown}
                closeAllDropdowns={closeAllDropdowns}
                handleStatusUpdate={handleStatusUpdate}
                handleDateUpdate={handleDateUpdate}
                handleStaffUpdate={handleStaffUpdate}
                isTablet={true}
              />
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
            <div key={order.id} className="animate-fade-in-up" style={{ animationDelay: `${getStaggerDelay(i)}s` }}>
              <OrderCardMobile
                order={order}
                role={role}
                activeDropdown={activeDropdown}
                toggleDropdown={toggleDropdown}
                closeAllDropdowns={closeAllDropdowns}
                handleStatusUpdate={handleStatusUpdate}
                handleDateUpdate={handleDateUpdate}
                handleStaffUpdate={handleStaffUpdate}
                isTablet={false}
              />
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
        </>
        )}
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
