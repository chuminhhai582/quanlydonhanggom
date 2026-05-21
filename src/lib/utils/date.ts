import { format, formatDistanceToNow, isAfter, isBefore, addDays, differenceInDays, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

export function formatDate(date: string | Date, formatStr: string = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: vi });
}

export function formatShortDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd/MM', { locale: vi });
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: vi });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd/MM/yyyy HH:mm', { locale: vi });
}

export function isOverdue(dueDate: string | Date, status: string): boolean {
  if (status === 'completed') return false;
  const d = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  return isBefore(d, new Date());
}

export function isDueSoon(dueDate: string | Date, days: number = 3): boolean {
  const d = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  const now = new Date();
  return isAfter(d, now) && isBefore(d, addDays(now, days));
}

export function getDaysUntilDue(dueDate: string | Date): number {
  const d = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  return differenceInDays(d, new Date());
}

export function getDueDateColor(dueDate: string, status: string): string {
  if (status === 'completed') return 'text-green-600';
  if (isOverdue(dueDate, status)) return 'text-red-600 font-semibold';
  if (isDueSoon(dueDate)) return 'text-amber-600 font-semibold';
  return 'text-[var(--text-primary)]';
}

export function getDueDateLabel(dueDate: string, status: string): string {
  if (status === 'completed') return 'Đã xong';
  const days = getDaysUntilDue(dueDate);
  if (days < 0) return `Trễ ${Math.abs(days)} ngày`;
  if (days === 0) return 'Hôm nay';
  if (days <= 3) return `Còn ${days} ngày`;
  return formatShortDate(dueDate);
}
