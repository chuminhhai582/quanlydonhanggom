'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

export default function HomePage() {
  const router = useRouter();
  const { role } = useAuth();

  useEffect(() => {
    if (role === 'admin' || role === 'viewer') {
      router.replace('/dashboard');
    } else {
      router.replace('/nhap-ma');
    }
  }, [role, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-cream)]">
      <div className="animate-pulse flex flex-col items-center gap-3">
        <div className="text-4xl">🏺</div>
        <p className="text-[var(--color-terra)] font-medium">Đang tải...</p>
      </div>
    </div>
  );
}
