import { format } from 'date-fns';

/**
 * Generate order code: DH-YYYYMMDD-XXX
 * In production, the XXX counter should come from DB sequence
 */
export function generateOrderCode(existingCodes: string[] = []): string {
  const dateStr = format(new Date(), 'yyyyMMdd');
  const prefix = `DH-${dateStr}-`;
  
  // Find max existing code for today
  const todayCodes = existingCodes
    .filter(c => c.startsWith(prefix))
    .map(c => parseInt(c.replace(prefix, ''), 10))
    .filter(n => !isNaN(n));
  
  const nextNum = todayCodes.length > 0 ? Math.max(...todayCodes) + 1 : 1;
  return `${prefix}${String(nextNum).padStart(3, '0')}`;
}

export function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return '—';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'not_started': return 'Chưa bắt đầu';
    case 'in_progress': return 'Đang chế tác';
    case 'completed': return 'Đã hoàn thành';
    default: return status;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'not_started': return '#94A3B8';
    case 'in_progress': return '#C8621A';
    case 'completed': return '#16A34A';
    default: return '#94A3B8';
  }
}
