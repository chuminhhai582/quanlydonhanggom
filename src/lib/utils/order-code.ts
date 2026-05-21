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
    case 'crafting': return 'Đang chế tác';
    case 'drying': return 'Đang phơi khô';
    case 'firing': return 'Đang nung';
    case 'broken': return 'Hỏng - Vỡ';
    case 'redoing': return 'Đang làm lại';
    case 'refiring': return 'Đang nung lại';
    default: return status;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'not_started': return '#94A3B8';
    case 'crafting': return '#C8621A';
    case 'drying': return '#0EA5E9';
    case 'firing': return '#EAB308';
    case 'broken': return '#DC2626';
    case 'redoing': return '#F97316';
    case 'refiring': return '#A855F7';
    default: return '#94A3B8';
  }
}
