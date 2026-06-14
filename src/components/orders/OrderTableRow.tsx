import React from 'react';
import Link from 'next/link';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderWithCustomer, OrderStatus } from '@/lib/types';
import InlineStatusSelect from './InlineStatusSelect';
import InlineImageCell from './InlineImageCell';
import InlineDateCell from './InlineDateCell';
import InlineStaffSelect from './InlineStaffSelect';
import { formatRelativeTime } from '@/lib/utils/date';
import PhoneDisplay from './PhoneDisplay';

interface OrderTableRowProps {
  order: OrderWithCustomer;
  role: 'admin' | 'viewer' | null;
  activeDropdown: string | null;
  toggleDropdown: (key: string) => void;
  closeAllDropdowns: () => void;
  handleStatusUpdate: (orderId: string, status: OrderStatus) => void;
  handleDateUpdate: (orderId: string, date: string) => void;
  handleStaffUpdate: (orderId: string, staffId: string) => void;
  handleImagesUpdate?: (orderId: string, images: string[], notes?: string[]) => void;
}

export default function OrderTableRow({
  order,
  role,
  activeDropdown,
  toggleDropdown,
  closeAllDropdowns,
  handleStatusUpdate,
  handleDateUpdate,
  handleStaffUpdate,
  handleImagesUpdate
}: OrderTableRowProps) {
  return (
    <tr className="border-b border-[var(--color-border-warm)] hover:bg-[var(--color-cream)]/30 transition-colors">
      <td className="py-3 px-3 xl:px-4">
        <span className="font-mono text-xs text-[var(--color-terra)] font-medium bg-[var(--color-terra)]/10 px-2 py-1 rounded-md">{order.order_code}</span>
      </td>
      <td className="py-3 px-3 xl:px-4">
        <p className="font-medium text-sm text-[var(--color-text-primary)]">{order.customer_name}</p>
        <PhoneDisplay phone={order.customer_phone} />
      </td>
      <td className="py-3 px-3 xl:px-4">
        <p className="text-sm truncate max-w-[120px] xl:max-w-none">{order.product_name}</p>
        <p className="text-xs text-muted-foreground">x{order.quantity}</p>
      </td>
      <td className="py-3 px-3 xl:px-4">
        <InlineImageCell 
          images={order.reference_images || []} 
          notes={order.reference_images_notes || []} 
          orderId={order.id} 
          canUpload={role === 'admin'} 
          onUpdate={handleImagesUpdate} 
        />
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
          <Link href={`/don-hang/${order.id}`} className="flex items-center gap-1 text-xs font-medium text-[var(--color-terra)] hover:text-[var(--color-ember)] transition-colors whitespace-nowrap">
              <Eye size={13} />
              Xem chi tiết
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
  );
}
