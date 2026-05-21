'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react';

const DEFAULT_PIN = '123456';

export default function PinEntryPage() {
  const [pin, setPin] = useState<string[]>(['', '', '', '', '', '']);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { setRole } = useAuth();

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newPin = [...pin];
    
    if (value.length > 1) {
      // Handle paste
      const chars = value.split('').slice(0, 6 - index);
      chars.forEach((char, i) => {
        if (index + i < 6) {
          newPin[index + i] = char;
        }
      });
      setPin(newPin);
      const nextIndex = Math.min(index + chars.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      newPin[index] = value;
      setPin(newPin);
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
    setError('');
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const enteredPin = pin.join('');
    if (enteredPin.length < 4) {
      setError('Vui lòng nhập đủ mã PIN');
      return;
    }

    setLoading(true);
    
    // Simulate API call - in production this calls /api/auth/verify-pin
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (enteredPin === DEFAULT_PIN) {
      if (rememberDevice) {
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + 30);
        localStorage.setItem('viewer_pin_valid_until', validUntil.toISOString());
        localStorage.setItem('viewer_token', 'mock_viewer_token_' + Date.now());
      }
      setRole('viewer');
      router.push('/dashboard');
    } else {
      setError('Mã PIN không đúng. Vui lòng thử lại.');
      setPin(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-cream)]">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[var(--color-ember)]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[var(--color-terra)]/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--color-ember)]/3 blur-[100px]" />
      </div>

      <div className="w-full max-w-md animate-fade-in-up">
        <div className="glass rounded-3xl p-8 shadow-xl shadow-[var(--color-terra)]/5">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-terra)] to-[var(--color-ember)] shadow-lg shadow-[var(--color-terra)]/20 mb-4">
              <span className="text-4xl">🏺</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-terra)] tracking-tight">
              GỐM TRACKER
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Nhập mã truy cập xưởng
            </p>
          </div>

          {/* PIN Input */}
          <div className="flex justify-center gap-2.5 mb-4">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={e => handleInputChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                className={`
                  w-12 h-14 text-center text-xl font-bold rounded-xl
                  border-2 transition-all duration-200
                  focus:outline-none focus:border-[var(--color-ember)] focus:ring-2 focus:ring-[var(--color-ember)]/20
                  ${digit ? 'border-[var(--color-terra)] bg-[var(--color-terra)]/5' : 'border-[var(--color-border-warm)] bg-white'}
                  ${error ? 'border-red-400 shake' : ''}
                `}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Show/Hide PIN */}
          <button
            onClick={() => setShowPin(!showPin)}
            className="flex items-center gap-1.5 mx-auto mb-5 text-xs text-muted-foreground hover:text-[var(--color-terra)] transition-colors"
          >
            {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPin ? 'Ẩn mã' : 'Hiện mã'}
          </button>

          {/* Error */}
          {error && (
            <div className="text-center text-sm text-red-500 mb-4 animate-fade-in">
              {error}
            </div>
          )}

          {/* Remember checkbox */}
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Checkbox
              id="remember"
              checked={rememberDevice}
              onCheckedChange={(checked) => setRememberDevice(checked as boolean)}
              className="border-[var(--color-border-warm)] data-[state=checked]:bg-[var(--color-terra)] data-[state=checked]:border-[var(--color-terra)]"
            />
            <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
              Nhớ thiết bị này 30 ngày
            </label>
          </div>

          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            disabled={loading || pin.join('').length < 4}
            className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-[var(--color-terra)] to-[var(--color-ember)] hover:from-[var(--color-terra-dark)] hover:to-[var(--color-ember-dark)] shadow-lg shadow-[var(--color-terra)]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--color-terra)]/30 hover:-translate-y-0.5"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" size={20} />
            ) : (
              <ShieldCheck className="mr-2" size={20} />
            )}
            {loading ? 'Đang xác thực...' : 'Vào xưởng'}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[var(--color-border-warm)]" />
            <span className="text-xs text-muted-foreground">hoặc</span>
            <div className="flex-1 h-px bg-[var(--color-border-warm)]" />
          </div>

          {/* Admin login link */}
          <Link href="/admin/dang-nhap">
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl border-[var(--color-border-warm)] text-[var(--color-terra)] hover:bg-[var(--color-terra)]/5 hover:border-[var(--color-terra)]/30 transition-all duration-200"
            >
              Đăng nhập Admin
            </Button>
          </Link>

          {/* Info */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Mã PIN mặc định: <code className="bg-[var(--color-cream-dark)] px-1.5 py-0.5 rounded text-[var(--color-terra)] font-mono">123456</code>
          </p>
        </div>
      </div>
    </div>
  );
}
