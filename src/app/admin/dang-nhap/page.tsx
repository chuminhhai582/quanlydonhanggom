'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { LogIn, Loader2, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setRole } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate auth - in production uses Supabase Auth
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock: accept any email/password combo for demo
    if (email && password) {
      localStorage.setItem('admin_logged_in', 'true');
      localStorage.setItem('admin_name', email.split('@')[0]);
      setRole('admin');
      router.push('/dashboard');
    } else {
      setError('Vui lòng nhập email và mật khẩu');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-cream)]">
      {/* Decorative */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[var(--color-terra)]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[var(--color-ember)]/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in-up">
        <div className="glass rounded-3xl p-8 shadow-xl shadow-[var(--color-terra)]/5">
          {/* Back link */}
          <Link
            href="/nhap-ma"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[var(--color-terra)] transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Quay lại nhập mã
          </Link>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-terra)] to-[var(--color-terra-dark)] shadow-lg shadow-[var(--color-terra)]/20 mb-4">
              <LogIn className="text-white" size={28} />
            </div>
            <h1 className="text-xl font-bold text-[var(--color-terra)]">Đăng nhập Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">Dành cho quản lý xưởng</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[var(--color-text-primary)]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-11 rounded-xl border-[var(--color-border-warm)] focus:border-[var(--color-ember)] bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-[var(--color-text-primary)]">
                Mật khẩu
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-11 rounded-xl border-[var(--color-border-warm)] focus:border-[var(--color-ember)] bg-white"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center animate-fade-in">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-[var(--color-terra)] to-[var(--color-ember)] hover:from-[var(--color-terra-dark)] hover:to-[var(--color-ember-dark)] shadow-lg shadow-[var(--color-terra)]/20 transition-all duration-300"
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Demo: nhập bất kỳ email + mật khẩu
          </p>
        </div>
      </div>
    </div>
  );
}
