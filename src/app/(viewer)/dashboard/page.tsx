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
import { useOrders } from '@/lib/hooks/useOrders';
import { OrderWithCustomer, CalendarEvent, OrderStatus } from '@/lib/types';
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
import { ExternalLink, Clock, User, Package } from 'lucide-react';

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

  const { orders } = useOrders(role || 'viewer');

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
      isOverdue: false,
      order,
    }));
  }, [filteredOrders]);

  // Custom event component — hiển thị 2 dòng: khách hàng + sản phẩm
  const EventComponent = useCallback(({ event }: { event: CalendarEvent }) => {
    return (
      <div className="calendar-event-content">
        <div className="calendar-event-customer">{event.order.customer_name}</div>
        <div className="calendar-event-product">{event.order.product_name}</div>
      </div>
    );
  }, []);

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
        padding: '1px 5px',
        lineHeight: '1.3',
        overflow: 'visible' as const,
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
            components={{
              event: EventComponent,
            }}
            popup
            selectable={false}
          />
        </div>
      </div>

      {/* Order Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[340px] sm:w-[420px] overflow-y-auto p-0">
          {selectedOrder && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="px-5 pt-5 pb-4 border-b border-[var(--color-border-warm)]/60 bg-gradient-to-b from-[var(--color-cream)] to-white">
                <SheetHeader>
                  <div className="flex items-center justify-between gap-3">
                    <SheetTitle className="text-lg font-bold text-[var(--color-terra)] tracking-tight">
                      #{selectedOrder.order_code}
                    </SheetTitle>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                </SheetHeader>
              </div>

              {/* Body */}
              <div className="flex-1 px-5 py-4 space-y-4">
                {/* Customer */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-terra)]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <User size={15} className="text-[var(--color-terra)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[var(--color-text-primary)] truncate">{selectedOrder.customer_name}</p>
                    <PhoneDisplay phone={selectedOrder.customer_phone} showIcon />
                  </div>
                </div>

                {/* Product */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-ember)]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Package size={15} className="text-[var(--color-ember)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{selectedOrder.product_name}</p>
                    <p className="text-xs text-muted-foreground">SL: {selectedOrder.quantity}</p>
                  </div>
                </div>

                {selectedOrder.custom_requirements && (
                  <p className="text-xs text-muted-foreground italic bg-[var(--color-cream)]/60 rounded-lg px-3 py-2">
                    &ldquo;{selectedOrder.custom_requirements}&rdquo;
                  </p>
                )}

                {/* Info cards */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[var(--color-cream)] rounded-xl p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ngày đặt</p>
                    <p className="font-semibold text-sm mt-0.5">{selectedOrder.start_date ? formatShortDate(selectedOrder.start_date) : '—'}</p>
                  </div>
                  {selectedOrder.price && (
                    <div className="bg-[var(--color-cream)] rounded-xl p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Giá</p>
                      <p className="font-semibold text-sm mt-0.5 text-[var(--color-ember)]">
                        {new Intl.NumberFormat('vi-VN').format(selectedOrder.price)}đ
                      </p>
                    </div>
                  )}
                </div>

                {/* Staff */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Nghệ nhân</p>
                  {selectedOrder.assigned_staff.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedOrder.assigned_staff.map(staff => (
                        <Badge key={staff.id} variant="secondary" className="rounded-full text-xs py-0.5" style={{ borderColor: staff.avatar_color + '40' }}>
                          <span className="w-2 h-2 rounded-full mr-1" style={{ background: staff.avatar_color }} />
                          {staff.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Chưa phân công</p>
                  )}
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Tiến độ</p>
                    <span className="text-xs font-semibold text-[var(--color-terra)]">{selectedOrder.updates_count}/6</span>
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
                  <div className="bg-[var(--color-cream)]/70 rounded-xl p-3 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-[var(--color-ember)]" />
                      <span className="text-[10px] text-muted-foreground">
                        {formatRelativeTime(selectedOrder.latest_update.created_at)}
                      </span>
                    </div>
                    <p className="font-medium text-sm">{selectedOrder.latest_update.milestone_name}</p>
                    {selectedOrder.latest_update.note && (
                      <p className="text-xs text-muted-foreground">{selectedOrder.latest_update.note}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-[var(--color-border-warm)]/60 bg-white">
                <Link
                  href={`/don-hang/${selectedOrder.id}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-terra)] to-[var(--color-ember)] text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                >
                  Xem chi tiết
                  <ExternalLink size={14} />
                </Link>
              </div>
            </div>
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
