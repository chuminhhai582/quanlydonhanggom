export function formatPhone(phone: string | null): string {
  if (!phone) return '—';
  // Remove all non-digit chars
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

export function maskPhone(phone: string | null): string {
  if (!phone) return '—';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 4) {
    return `${digits.slice(0, 4)} *** ***`;
  }
  return '*** ***';
}

export function isValidVNPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return /^(0[3|5|7|8|9])\d{8}$/.test(digits);
}
