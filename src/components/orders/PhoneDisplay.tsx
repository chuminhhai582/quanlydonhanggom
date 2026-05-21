'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { formatPhone, maskPhone } from '@/lib/utils/phone';
import { Phone } from 'lucide-react';

interface PhoneDisplayProps {
  phone: string | null;
  showIcon?: boolean;
}

export default function PhoneDisplay({ phone, showIcon = false }: PhoneDisplayProps) {
  const { role } = useAuth();

  if (!phone) return <span className="text-muted-foreground">—</span>;

  const displayPhone = role === 'admin' ? formatPhone(phone) : maskPhone(phone);

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={role === 'admin' ? 'text-[var(--color-text-primary)]' : 'text-muted-foreground'}>
        {displayPhone}
      </span>
      {role === 'admin' && showIcon && (
        <a
          href={`tel:${phone}`}
          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-status-completed)]/10 text-[var(--color-status-completed)] hover:bg-[var(--color-status-completed)]/20 transition-colors"
          title="Gọi điện"
        >
          <Phone size={12} />
        </a>
      )}
    </span>
  );
}
