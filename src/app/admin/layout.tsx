'use client';

import Header from '@/components/layout/Header';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarDays, LayoutList, PlusCircle, Users, Package, FileSpreadsheet,
  Settings, ChevronRight
} from 'lucide-react';

const adminNavItems = [
  { href: '/dashboard', label: 'Dashboard Lịch', icon: CalendarDays, group: 'main' },
  { href: '/don-hang', label: 'Dashboard Bảng', icon: LayoutList, group: 'main' },
  { href: '/admin/don-hang/moi', label: 'Tạo đơn mới', icon: PlusCircle, group: 'orders' },
  { href: '/admin/khach-hang', label: 'Khách hàng', icon: Users, group: 'manage' },
  { href: '/admin/san-pham', label: 'Sản phẩm', icon: Package, group: 'manage' },
  { href: '/admin/dong-bo-sheet', label: 'Đồng bộ Sheet', icon: FileSpreadsheet, group: 'tools' },
  { href: '/admin/cai-dat', label: 'Cài đặt', icon: Settings, group: 'tools' },
];

const groups = [
  { key: 'main', label: 'Xem dữ liệu' },
  { key: 'orders', label: 'Đơn hàng' },
  { key: 'manage', label: 'Quản lý' },
  { key: 'tools', label: 'Công cụ' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (role !== null && role !== 'admin') {
      // Non-admin trying to access admin routes
      const isAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin/dang-nhap');
      if (isAdminRoute) {
        router.replace('/dashboard');
      }
    }
  }, [role, pathname, router]);

  // Skip layout for login page
  if (pathname === '/admin/dang-nhap') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Header />
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-60 shrink-0 border-r border-[var(--color-border-warm)] bg-white min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="py-4 px-3">
            {groups.map(group => {
              const items = adminNavItems.filter(i => i.group === group.key);
              return (
                <div key={group.key} className="mb-4">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1.5">
                    {group.label}
                  </p>
                  {items.map(item => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/don-hang' && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`
                          flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-200
                          ${isActive
                            ? 'bg-[var(--color-terra)]/10 text-[var(--color-terra)] font-semibold'
                            : 'text-muted-foreground hover:bg-[var(--color-cream)] hover:text-[var(--color-text-primary)]'}
                        `}
                      >
                        <item.icon size={16} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 pb-20 md:pb-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
