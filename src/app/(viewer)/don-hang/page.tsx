'use client';

import { useState, useMemo, useCallback, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import StatusTabs from '@/components/orders/StatusTabs';
import StatusBadge from '@/components/orders/StatusBadge';
import PhoneDisplay from '@/components/orders/PhoneDisplay';
import { useAuth } from '@/lib/auth/auth-context';
import { getOrdersWithCustomer, mockStaffNames } from '@/lib/mock-data';
import { OrderWithCustomer, OrderStatus } from '@/lib/types';
import { formatShortDate, formatRelativeTime } from '@/lib/utils/date';
import { getStatusLabel, getStatusColor } from '@/lib/utils/order-code';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Search, Plus, FileSpreadsheet, Eye, Pencil, Trash2, ChevronRight, ImagePlus, X, ChevronDown, Check
} from 'lucide-react';
import { toast } from 'sonner';

// Danh sách tất cả trạng thái
const ALL_STATUSES: OrderStatus[] = [
  'not_started', 'crafting', 'drying', 'firing', 'broken', 'redoing', 'refiring'
];

// ==========================================
// Quản lý dropdown: chỉ 1 dropdown mở tại 1 thời điểm
// Key format: "status-{orderId}" hoặc "staff-{orderId}"
// ==========================================

// ---------- Inline Status Dropdown ----------
function InlineStatusSelect({
  value, orderId, onUpdate, isOpen, onToggle
}: {
  value: OrderStatus;
  orderId: string;
  onUpdate: (id: string, status: OrderStatus) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) {
        onToggle();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={onToggle}
        className="flex items-center gap-1.5 group cursor-pointer"
      >
        <StatusBadge status={value} size="sm" />
        <ChevronDown size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute left-0 top-full mt-1 z-[100] bg-white rounded-xl shadow-xl border border-[var(--color-border-warm)] py-1.5 min-w-[180px] animate-scale-in"
          style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.12))' }}
        >
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => { onUpdate(orderId, s); onToggle(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[var(--color-cream)]/60 transition-colors ${s === value ? 'bg-[var(--color-cream)]/40 font-medium' : ''}`}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getStatusColor(s) }} />
              {getStatusLabel(s)}
              {s === value && <Check size={14} className="ml-auto text-[var(--color-terra)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Inline Staff Dropdown ----------
function InlineStaffSelect({
  currentStaff, orderId, onUpdate, isOpen, onToggle
}: {
  currentStaff: { id: string; name: string; avatar_color: string }[];
  orderId: string;
  onUpdate: (id: string, staffId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedId = currentStaff[0]?.id || '';

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) {
        onToggle();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={onToggle}
        className="flex items-center gap-1.5 group cursor-pointer"
      >
        {currentStaff.length > 0 ? (
          <div className="flex items-center gap-1.5">
            <Avatar className="w-7 h-7 border-2 border-white">
              <AvatarFallback className="text-[10px] font-bold text-white" style={{ background: currentStaff[0].avatar_color }}>
                {currentStaff[0].name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground hidden lg:inline">{currentStaff[0].name}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Chọn</span>
        )}
        <ChevronDown size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute left-0 top-full mt-1 z-[100] bg-white rounded-xl shadow-xl border border-[var(--color-border-warm)] py-1.5 min-w-[160px] animate-scale-in"
          style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.12))' }}
        >
          {mockStaffNames.map(staff => (
            <button
              key={staff.id}
              onClick={() => { onUpdate(orderId, staff.id); onToggle(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[var(--color-cream)]/60 transition-colors ${staff.id === selectedId ? 'bg-[var(--color-cream)]/40 font-medium' : ''}`}
            >
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-[9px] font-bold text-white" style={{ background: staff.avatar_color }}>
                  {staff.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {staff.name}
              {staff.id === selectedId && <Check size={14} className="ml-auto text-[var(--color-terra)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Inline Image Cell ----------
function InlineImageCell({
  images, orderId, canUpload
}: {
  images: string[]; orderId: string; canUpload: boolean;
}) {
  const [imgs, setImgs] = useState<string[]>(images);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 3 - imgs.length;
    if (remaining <= 0) {
      toast.error('Tối đa 3 ảnh minh họa');
      return;
    }
    const newImgs = [...imgs];
    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      newImgs.push(URL.createObjectURL(files[i]));
    }
    setImgs(newImgs);
    toast.success('Đã thêm ảnh minh họa');
    e.target.value = '';
  };

  const removeImg = (idx: number) => {
    setImgs(prev => prev.filter((_, i) => i !== idx));
    toast.success('Đã xóa ảnh');
  };

  return (
    <div className="flex items-center gap-1.5">
      {imgs.map((src, i) => (
        <div key={i} className="relative group w-9 h-9 rounded-lg overflow-hidden border border-[var(--color-border-warm)] shrink-0">
          <img src={src} alt={`Ảnh ${i + 1}`} className="w-full h-full object-cover" />
          {canUpload && (
            <button
              onClick={() => removeImg(i)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <X size={12} className="text-white" />
            </button>
          )}
        </div>
      ))}
      {canUpload && imgs.length < 3 && (
        <>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-9 h-9 rounded-lg border-2 border-dashed border-[var(--color-border-warm)] flex items-center justify-center hover:border-[var(--color-terra)] hover:bg-[var(--color-cream)]/50 transition-colors shrink-0"
          >
            <ImagePlus size={14} className="text-muted-foreground" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
      {!canUpload && imgs.length === 0 && (
        <span className="text-xs text-muted-foreground">—</span>
      )}
    </div>
  );
}

// ---------- Inline Date Cell ----------
function InlineDateCell({
  value, orderId, onUpdate, isEditing, onStartEdit, onStopEdit
}: {
  value: string | null;
  orderId: string;
  onUpdate: (id: string, date: string) => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
}) {
  const display = value ? formatShortDate(value) : '—';

  if (isEditing) {
    return (
      <input
        type="date"
        defaultValue={value || ''}
        autoFocus
        className="text-xs border border-[var(--color-terra)] rounded-lg px-2 py-1 w-[130px] outline-none focus:ring-2 focus:ring-[var(--color-terra)]/30"
        onBlur={(e) => {
          if (e.target.value) {
            onUpdate(orderId, e.target.value);
            toast.success('Đã cập nhật ngày đặt');
          }
          onStopEdit();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          if (e.key === 'Escape') onStopEdit();
        }}
      />
    );
  }

  return (
    <button
      onClick={onStartEdit}
      className="text-sm font-medium hover:text-[var(--color-terra)] hover:underline decoration-dashed underline-offset-2 transition-colors cursor-pointer"
    >
      {display}
    </button>
  );
}


function OrdersTableContent() {
  const searchParams = useSearchParams();
  const { role } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const statusFilter = searchParams.get('status') as OrderStatus | null;

  // ============================================
  // State quản lý dropdown: chỉ 1 cái mở tại 1 thời điểm
  // Giá trị: null (tất cả đóng) hoặc "status-{orderId}" / "staff-{orderId}" / "date-{orderId}"
  // ============================================
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = useCallback((key: string) => {
    setActiveDropdown(prev => prev === key ? null : key);
  }, []);

  const closeAllDropdowns = useCallback(() => {
    setActiveDropdown(null);
  }, []);

  // Dữ liệu mẫu
  const [ordersState, setOrdersState] = useState(() => getOrdersWithCustomer(role || 'viewer'));
  const orders = ordersState;

  const counts = useMemo(() => ({
    all: orders.length,
    not_started: orders.filter(o => o.status === 'not_started').length,
    crafting: orders.filter(o => o.status === 'crafting').length,
    drying: orders.filter(o => o.status === 'drying').length,
    firing: orders.filter(o => o.status === 'firing').length,
    broken: orders.filter(o => o.status === 'broken').length,
    redoing: orders.filter(o => o.status === 'redoing').length,
    refiring: orders.filter(o => o.status === 'refiring').length,
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

  // --- Handlers cho Inline Editing ---
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
              style={{ animationDelay: `${i * 0.05}s` }}
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
