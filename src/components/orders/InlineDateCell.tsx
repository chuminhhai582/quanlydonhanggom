'use client';

import { formatShortDate } from '@/lib/utils/date';
import { toast } from 'sonner';

interface InlineDateCellProps {
  value: string | null;
  orderId: string;
  onUpdate: (id: string, date: string) => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
}

export default function InlineDateCell({
  value, orderId, onUpdate, isEditing, onStartEdit, onStopEdit
}: InlineDateCellProps) {
  const display = value ? formatShortDate(value) : '—';

  if (isEditing) {
    return (
      <input
        type="date"
        defaultValue={value || ''}
        autoFocus
        aria-label="Chọn ngày đặt hàng"
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
      aria-label={`Ngày đặt: ${display}. Bấm để sửa`}
      className="text-sm font-medium hover:text-[var(--color-terra)] hover:underline decoration-dashed underline-offset-2 transition-colors cursor-pointer"
    >
      {display}
    </button>
  );
}
