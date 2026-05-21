'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CalendarDays, LayoutList, Settings, LogOut, Menu, X, UserCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { role, adminName, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Lịch', icon: CalendarDays },
    { href: '/don-hang', label: 'Bảng', icon: LayoutList },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <header className="sticky top-0 z-50 glass border-b border-[var(--color-border-warm)]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-6">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[var(--color-cream-dark)] transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-terra)] to-[var(--color-ember)] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-lg">🏺</span>
              </div>
              <span className="font-bold text-lg text-[var(--color-terra)] hidden sm:inline tracking-tight">
                Gốm Tracker
              </span>
            </Link>

            {/* Desktop nav tabs */}
            <nav className="hidden md:flex items-center bg-[var(--color-cream-dark)] rounded-xl p-1">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive(item.href)
                      ? 'bg-white text-[var(--color-terra)] shadow-sm'
                      : 'text-muted-foreground hover:text-[var(--color-terra)]'}
                  `}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: User menu */}
          <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[var(--color-cream-dark)] transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className={`text-xs font-semibold ${
                    role === 'admin'
                      ? 'bg-gradient-to-br from-[var(--color-terra)] to-[var(--color-ember)] text-white'
                      : 'bg-[var(--color-cream-dark)] text-[var(--color-terra)]'
                  }`}>
                    {role === 'admin' ? adminName.charAt(0).toUpperCase() : 'K'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {role === 'admin' ? adminName : 'Khách'}
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-none">
                    {role === 'admin' ? 'Quản lý' : 'Nhân viên'}
                  </span>
                </div>
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>
            }
          />
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-[var(--color-border-warm)]">
              {role === 'admin' && (
                <>
                  <DropdownMenuItem onClick={() => window.location.href = '/admin/cai-dat'} className="flex items-center gap-2 cursor-pointer">
                      <Settings size={16} />
                      Cài đặt
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={logout} className="flex items-center gap-2 cursor-pointer text-red-600">
                <LogOut size={16} />
                {role === 'admin' ? 'Đăng xuất' : 'Thoát'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-16 w-64 bg-white shadow-xl border-r border-[var(--color-border-warm)] h-[calc(100vh-4rem)] animate-slide-in-right">
            <nav className="p-4 space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${isActive(item.href)
                      ? 'bg-[var(--color-terra)]/10 text-[var(--color-terra)]'
                      : 'text-muted-foreground hover:bg-[var(--color-cream-dark)]'}
                  `}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
              {role === 'admin' && (
                <>
                  <div className="h-px bg-[var(--color-border-warm)] my-3" />
                  <p className="text-xs text-muted-foreground px-4 mb-2 uppercase tracking-wider">Admin</p>
                  {[
                    { href: '/admin/don-hang/moi', label: 'Tạo đơn mới' },
                    { href: '/admin/dong-bo-sheet', label: 'Đồng bộ Sheet' },
                    { href: '/admin/cai-dat', label: 'Cài đặt' },
                  ].map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all
                        ${pathname.startsWith(item.href)
                          ? 'bg-[var(--color-terra)]/10 text-[var(--color-terra)] font-medium'
                          : 'text-muted-foreground hover:bg-[var(--color-cream-dark)]'}
                      `}
                    >
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile bottom nav — safe area cho iPhone notch */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-[var(--color-border-warm)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <nav className="flex items-center justify-around h-14 max-w-md mx-auto px-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-0.5 py-1.5 px-5 rounded-xl transition-all active:scale-95
                ${isActive(item.href)
                  ? 'text-[var(--color-terra)]'
                  : 'text-muted-foreground'}
              `}
            >
              <item.icon size={20} strokeWidth={isActive(item.href) ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive(item.href) && (
                <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[var(--color-terra)]" />
              )}
            </Link>
          ))}
          <button className="flex flex-col items-center gap-0.5 py-1.5 px-5 text-muted-foreground active:scale-95 rounded-xl relative">
            <UserCircle size={20} />
            <span className="text-[10px] font-medium">
              {role === 'admin' ? 'Admin' : 'Khách'}
            </span>
          </button>
        </nav>
      </div>
    </>
  );
}
