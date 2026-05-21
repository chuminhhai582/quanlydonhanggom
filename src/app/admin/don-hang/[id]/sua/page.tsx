'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditOrderPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/don-hang" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[var(--color-terra)] transition-colors mb-6">
        <ArrowLeft size={16} />
        Quay lại
      </Link>
      <div className="bg-white rounded-2xl border border-[var(--color-border-warm)] shadow-sm p-8 text-center animate-fade-in-up">
        <div className="text-4xl mb-3">✏️</div>
        <h1 className="text-xl font-bold text-[var(--color-terra)]">Sửa đơn hàng</h1>
        <p className="text-sm text-muted-foreground mt-2">Trang sửa đơn hàng — tương tự form tạo đơn với dữ liệu đã có</p>
      </div>
    </div>
  );
}
