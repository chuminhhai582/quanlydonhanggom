'use client';

import { useState, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import StatusTabs from '@/components/orders/StatusTabs';
import StatusBadge from '@/components/orders/StatusBadge';
import { useAuth } from '@/lib/auth/auth-context';
import { getOrdersWithCustomer } from '@/lib/mock-data';
import { OrderWithCustomer, CalendarEvent, OrderStatus } from '@/lib/types';
import { isOverdue } from '@/lib/utils/date';
import { getStatusColor } from '@/lib/utils/order-code';
import { formatShortDate, formatRelativeTime } from '@/lib/utils/date';
import { useOrderCounts } from '@/lib/hooks/useOrderCounts';
import PhoneDisplay from '@/components/orders/PhoneDisplay';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ExternalLink, Clock, User, Package, AlertTriangle } from 'lucide-react';

const locales = { 'vi': vi };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

function DashboardContent() {
  const searchParams = useSearchParams();
  const { role } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCustomer | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const statusFilter = (searchParams.get('status') as OrderStatus | null);

  const orders = useMemo(() => {
    return getOrdersWithCustomer(role || 'viewer');
  }, [role]);

  const filteredOrders = useMemo(() => {
    if (!statusFilter) return orders;
    return orders.filter(o => o.status === statusFilter);
  }, [orders, statusFilter]);

  const counts = useOrderCounts(orders);

  const events: CalendarEvent[] = useMemo(() => {
    return filteredOrders.map(order => ({
      id: order.id,
      title: `${order.customer_name} - ${order.product_name}`,
      start: order.start_date ? parseISO(order.start_date) : parseISO(order.created_at),
      end: order.start_date ? parseISO(order.start_date) : parseISO(order.created_at),
      status: order.status,
      isOverdue: isOverdue(order.due_date, order.status),
      order,
    }));
  }, [filteredOrders]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedOrder(event.order);
    setDrawerOpen(true);
  }, []);

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const color = getStatusColor(event.status);
    return {
      style: {
        backgroundColor: color + '18',
        color: color,
        borderLeft: `3px solid ${color}`,
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 600,
        padding: '2px 6px',
        ...(event.isOverdue ? {
          boxShadow: `0 0 0 2px #DC2626`,
        } : {}),
      },
    };
  }, []);

  const dayPropGetter = useCallback((date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    if (d.getTime() === today.getTime()) {
      return {
        style: { background: '#C8621A08' },
      };
    }

    // Past days with incomplete orders
    if (d < today) {
      const hasIncomplete = filteredOrders.some(o => {
        const dueDate = parseISO(o.due_date);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === d.getTime() && o.status === 'broken';
      });
      if (hasIncomplete) {
        return {
          style: { background: '#DC262608' },
        };
      }
    }

    return {};
  }, [filteredOrders]);

  const [defaultView, setDefaultView] = useState<(typeof Views)[keyof typeof Views]>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return Views.WEEK;
    }
    return Views.MONTH;
  });

  const messages = {
    today: 'Hôm nay',
    previous: '‹',
    next: '›',
    month: 'Tháng',
    week: 'Tuần',
    day: 'Ngày',
    agenda: 'Lịch',
    showMore: (total: number) => `+${total} đơn nữa`,
    noEventsInRange: 'Không có đơn trong khoảng này',
  };

  return (
    <div>
      <StatusTabs counts={counts} />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border-warm)] p-2.5 sm:p-4 md:p-6 animate-fade-in-up">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 'calc(100vh - 260px)', minHeight: 350 }}
            defaultView={defaultView}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            date={currentDate}
            onNavigate={setCurrentDate}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            dayPropGetter={dayPropGetter}
            messages={messages}
            popup
            selectable={false}
          />
        </div>
      </div>

      {/* Order Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-lg font-bold text-[var(--color-terra)]">
                    {selectedOrder.order_code}
                  </SheetTitle>
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                {/* Overdue warning */}
                {isOverdue(selectedOrder.due_date, selectedOrder.status) && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl p-3 text-sm">
                    <AlertTriangle size={16} />
                    <span className="font-medium">Đơn hàng đã trễ hạn!</span>
                  </div>
                )}

                {/* Customer info */}
                <div className="bg-[var(--color-cream)] rounded-xl p-4 space-y-2.5">
                  <div className="flex items-start gap-3">
                    <User size={16} className="text-[var(--color-terra)] mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-[var(--color-text-primary)]">{selectedOrder.customer_name}</p>
                      <PhoneDisplay phone={selectedOrder.customer_phone} showIcon />
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Package size={16} className="text-[var(--color-ember)] mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">{selectedOrder.product_name}</p>
                      <p className="text-sm text-muted-foreground">Số lượng: {selectedOrder.quantity}</p>
                    </div>
                  </div>
                  {selectedOrder.custom_requirements && (
                    <p className="text-sm text-muted-foreground pl-7 italic">
                      &ldquo;{selectedOrder.custom_requirements}&rdquo;
                    </p>
                  )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-[var(--color-border-warm)] rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">Ngày đặt</p>
                    <p className="font-semibold text-sm">{selectedOrder.start_date ? formatShortDate(selectedOrder.start_date) : '—'}</p>
                  </div>
                </div>

                {/* Staff */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Nghệ nhân phụ trách</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.assigned_staff.map(staff => (
                      <Badge key={staff.id} variant="secondary" className="rounded-full" style={{ borderColor: staff.avatar_color + '40' }}>
                        <span className="w-2 h-2 rounded-full mr-1.5" style={{ background: staff.avatar_color }} />
                        {staff.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Tiến độ</p>
                    <span className="text-sm font-semibold">{selectedOrder.updates_count}/6 mốc</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${Math.min((selectedOrder.updates_count / 6) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Latest update */}
                {selectedOrder.latest_update && (
                  <div className="bg-[var(--color-cream)] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={14} className="text-[var(--color-ember)]" />
                      <span className="text-xs text-muted-foreground">
                        Cập nhật mới nhất — {formatRelativeTime(selectedOrder.latest_update.created_at)}
                      </span>
                    </div>
                    <p className="font-medium text-sm">{selectedOrder.latest_update.milestone_name}</p>
                    {selectedOrder.latest_update.note && (
                      <p className="text-sm text-muted-foreground mt-1">{selectedOrder.latest_update.note}</p>
                    )}
                  </div>
                )}

                {/* View detail link */}
                <Link
                  href={`/don-hang/${selectedOrder.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[var(--color-terra)] text-white font-semibold text-sm hover:bg-[var(--color-terra-dark)] transition-colors"
                >
                  Xem chi tiết
                  <ExternalLink size={14} />
                </Link>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-[var(--color-terra)]">Đang tải...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
