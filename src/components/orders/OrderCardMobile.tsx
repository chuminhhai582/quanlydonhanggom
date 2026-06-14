import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { OrderWithCustomer, OrderStatus } from '@/lib/types';
import InlineStatusSelect from './InlineStatusSelect';
import InlineImageCell from './InlineImageCell';
import InlineDateCell from './InlineDateCell';
import InlineStaffSelect from './InlineStaffSelect';
import { formatRelativeTime } from '@/lib/utils/date';

interface OrderCardMobileProps {
  order: OrderWithCustomer;
  role: 'admin' | 'viewer' | null;
  activeDropdown: string | null;
  toggleDropdown: (key: string) => void;
  closeAllDropdowns: () => void;
  handleStatusUpdate: (orderId: string, status: OrderStatus) => void;
  handleDateUpdate: (orderId: string, date: string) => void;
  handleStaffUpdate: (orderId: string, staffId: string) => void;
  handleImagesUpdate?: (orderId: string, images: string[], notes?: string[]) => void;
  isTablet?: boolean;
}

export default function OrderCardMobile({
  order,
  role,
  activeDropdown,
  toggleDropdown,
  closeAllDropdowns,
  handleStatusUpdate,
  handleDateUpdate,
  handleStaffUpdate,
  handleImagesUpdate,
  isTablet = false
}: OrderCardMobileProps) {
  const prefix = isTablet ? 't-' : 'm-';

  if (isTablet) {
    return (
      <div className="bg-white rounded-2xl border border-[var(--color-border-warm)] overflow-hidden transition-all duration-200 card-hover animate-fade-in-up">
        {/* Card header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-cream)]/30 border-b border-[var(--color-border-warm)]/50">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[var(--color-terra)] font-medium">{order.order_code}</span>
            <InlineStatusSelect
              value={order.status}
              orderId={order.id}
              onUpdate={handleStatusUpdate}
              isOpen={activeDropdown === `${prefix}status-${order.id}`}
              onToggle={() => toggleDropdown(`${prefix}status-${order.id}`)}
            />
          </div>
          <div className="flex items-center gap-1">
            <Link href={`/don-hang/${order.id}`} className="flex items-center gap-1 text-[11px] font-medium text-[var(--color-terra)] hover:text-[var(--color-ember)] transition-colors px-2 py-1 rounded-lg hover:bg-[var(--color-cream)]">
              Xem chi tiết
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Card body */}
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{order.customer_name}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{order.product_name} x{order.quantity}</p>
            </div>
            {(order.reference_images?.length > 0 || role === 'admin') && (
              <InlineImageCell 
                images={order.reference_images || []} 
                notes={order.reference_images_notes || []} 
                orderId={order.id} 
                canUpload={role === 'admin'} 
                onUpdate={handleImagesUpdate} 
              />
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground mb-0.5">Ngày đặt</p>
              <InlineDateCell
                value={order.start_date}
                orderId={order.id}
                onUpdate={handleDateUpdate}
                isEditing={activeDropdown === `${prefix}date-${order.id}`}
                onStartEdit={() => toggleDropdown(`${prefix}date-${order.id}`)}
                onStopEdit={closeAllDropdowns}
              />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground mb-0.5">Nghệ nhân</p>
              <InlineStaffSelect
                currentStaff={order.assigned_staff}
                orderId={order.id}
                onUpdate={handleStaffUpdate}
                isOpen={activeDropdown === `${prefix}staff-${order.id}`}
                onToggle={() => toggleDropdown(`${prefix}staff-${order.id}`)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile layout
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border-warm)] overflow-hidden transition-all duration-200 active:scale-[0.99] animate-fade-in-up">
      {/* Top: code + status + arrow */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[var(--color-cream)]/20 border-b border-[var(--color-border-warm)]/30">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[11px] text-[var(--color-terra)] font-medium shrink-0">{order.order_code}</span>
          <InlineStatusSelect
            value={order.status}
            orderId={order.id}
            onUpdate={handleStatusUpdate}
            isOpen={activeDropdown === `${prefix}status-${order.id}`}
            onToggle={() => toggleDropdown(`${prefix}status-${order.id}`)}
          />
        </div>
        <Link href={`/don-hang/${order.id}`} className="flex items-center gap-0.5 text-[11px] font-medium text-[var(--color-terra)] hover:text-[var(--color-ember)] transition-colors px-1.5 py-1 -mr-1.5 rounded-lg hover:bg-[var(--color-cream)]">
          Xem chi tiết
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Body */}
      <div className="px-3.5 py-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-[13px] truncate">{order.customer_name}</p>
            <p className="text-xs text-muted-foreground truncate">{order.product_name} x{order.quantity}</p>
          </div>
          {(order.reference_images?.length > 0 || role === 'admin') && (
            <InlineImageCell 
              images={order.reference_images || []} 
              notes={order.reference_images_notes || []} 
              orderId={order.id} 
              canUpload={role === 'admin'} 
              onUpdate={handleImagesUpdate} 
            />
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground mb-0.5">Ngày đặt</p>
            <InlineDateCell
              value={order.start_date}
              orderId={order.id}
              onUpdate={handleDateUpdate}
              isEditing={activeDropdown === `${prefix}date-${order.id}`}
              onStartEdit={() => toggleDropdown(`${prefix}date-${order.id}`)}
              onStopEdit={closeAllDropdowns}
            />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground mb-0.5">Nghệ nhân</p>
            <InlineStaffSelect
              currentStaff={order.assigned_staff}
              orderId={order.id}
              onUpdate={handleStaffUpdate}
              isOpen={activeDropdown === `${prefix}staff-${order.id}`}
              onToggle={() => toggleDropdown(`${prefix}staff-${order.id}`)}
            />
          </div>
          {order.latest_update && (
            <span className="text-[10px] text-muted-foreground ml-auto">
              🕐 {formatRelativeTime(order.latest_update.created_at)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
