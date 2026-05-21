'use client';

import Header from '@/components/layout/Header';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ViewerLayout({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (role === null) {
      // Wait a bit for auth to initialize
      const timer = setTimeout(() => {
        const viewerValid = localStorage.getItem('viewer_pin_valid_until');
        const adminLoggedIn = localStorage.getItem('admin_logged_in');
        if (!viewerValid && !adminLoggedIn) {
          router.replace('/nhap-ma');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [role, router]);

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Header />
      <main className="pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
}
