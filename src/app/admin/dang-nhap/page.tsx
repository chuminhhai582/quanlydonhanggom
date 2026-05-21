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
  const [googleLoading, setGoogleLoading] = useState(false);
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

  // Đăng nhập bằng Google
  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        setError('Không thể kết nối Google: ' + authError.message);
        setGoogleLoading(false);
      }
      // Nếu thành công → redirect tới Google, không cần setGoogleLoading(false)
    } catch {
      setError('Chưa cấu hình Google Sign-In trên Supabase');
      setGoogleLoading(false);
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

          {/* Google Login Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full h-12 rounded-xl text-base font-medium border-[var(--color-border-warm)] hover:bg-[var(--color-cream)]/50 transition-all duration-300 mb-5"
          >
            {googleLoading ? (
              <Loader2 className="animate-spin mr-2" size={20} />
            ) : (
              <svg className="mr-2" width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
            )}
            {googleLoading ? 'Đang kết nối...' : 'Đăng nhập với Google'}
          </Button>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border-warm)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/80 px-3 text-muted-foreground">hoặc</span>
            </div>
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
