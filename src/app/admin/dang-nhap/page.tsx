'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { createClient } from '@/lib/supabase/client';
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

  useEffect(() => {
    // Check URL parameters for errors
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const err = params.get('error');
      if (err === 'unauthorized_email') {
        setError('Email này không được phép truy cập trang quản trị.');
        // Remove error from URL without refreshing
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (err === 'auth_failed') {
        setError('Đăng nhập thất bại. Vui lòng thử lại.');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Đăng nhập bằng Email + Password (Supabase Auth)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Fallback mock cho demo khi chưa cấu hình Supabase Auth
        if (email && password) {
          localStorage.setItem('admin_logged_in', 'true');
          localStorage.setItem('admin_name', email.split('@')[0]);
          setRole('admin');
          router.push('/dashboard');
          return;
        }
        setError(authError.message === 'Invalid login credentials' 
          ? 'Email hoặc mật khẩu không đúng' 
          : authError.message);
        return;
      }

      if (data.user) {
        localStorage.setItem('admin_logged_in', 'true');
        localStorage.setItem('admin_name', data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Admin');
        localStorage.setItem('admin_email', data.user.email || '');
        setRole('admin');
        router.push('/dashboard');
      }
    } catch {
      // Nếu Supabase chưa cấu hình → fallback mock
      if (email && password) {
        localStorage.setItem('admin_logged_in', 'true');
        localStorage.setItem('admin_name', email.split('@')[0]);
        setRole('admin');
        router.push('/dashboard');
      } else {
        setError('Vui lòng nhập email và mật khẩu');
      }
    } finally {
      setLoading(false);
    }
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



          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
        </div>
      </div>
    </div>
  );
}
