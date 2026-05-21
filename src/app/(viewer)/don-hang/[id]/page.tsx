'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { useOrders } from '@/lib/hooks/useOrders';
import { OrderStatus } from '@/lib/types';
import InlineStatusSelect from '@/components/orders/InlineStatusSelect';
import PhoneDisplay from '@/components/orders/PhoneDisplay';
import { formatDate } from '@/lib/utils/date';
import { formatPrice, getStatusLabel } from '@/lib/utils/order-code';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Pencil, Camera, Image as ImageIcon, Clock, X
} from 'lucide-react';
import { toast } from 'sonner';
import InlineImageCell from '@/components/orders/InlineImageCell';

// Ảnh tiến độ + timestamp
interface ProgressPhoto {
  id: string;
  url: string;
  timestamp: string; // ISO string
}

export default function OrderDetailPage() {
  const params = useParams();
  const { role } = useAuth();
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  // State đơn hàng — fetch từ Supabase
  const { orders: ordersState, setOrders: setOrdersState } = useOrders(role || 'viewer');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // State ảnh tiến độ — mới nhất trước
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);

  const order = useMemo(() => {
    return ordersState.find(o => o.id === params.id);
  }, [params.id, ordersState]);

  const handleStatusChange = useCallback((orderId: string, newStatus: OrderStatus) => {
    setOrdersState(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: newStatus, updated_at: new Date().toISOString() } : o)
    );
    toast.success(`Đã cập nhật: ${getStatusLabel(newStatus)}`);
  }, []);

  const handleImagesUpdate = useCallback((orderId: string, images: string[]) => {
    setOrdersState(prev =>
      prev.map(o => o.id === orderId ? { ...o, reference_images: images, updated_at: new Date().toISOString() } : o)
    );
  }, []);

  // Xử lý chụp ảnh / tải ảnh
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: ProgressPhoto[] = [];
    for (let i = 0; i < files.length; i++) {
      newPhotos.push({
        id: `photo-${Date.now()}-${i}`,
        url: URL.createObjectURL(files[i]),
        timestamp: new Date().toISOString(),
      });
    }
    // Thêm mới nhất lên đầu
    setPhotos(prev => [...newPhotos, ...prev]);
    toast.success(`Đã thêm ${files.length} ảnh tiến độ`);
    e.target.value = '';
  }, []);

  const removePhoto = useCallback((id: string) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === id);
      if (photo?.url.startsWith('blob:')) URL.revokeObjectURL(photo.url);
      return prev.filter(p => p.id !== id);
    });
    toast.success('Đã xóa ảnh');
  }, []);

  // Format timestamp cho hiển thị
  const formatPhotoTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} giờ trước`;
    return formatDate(iso, 'dd/MM HH:mm');
  };

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <div className="text-6xl mb-4">🏺</div>
        <h2 className="text-xl font-bold text-[var(--color-terra)]">Không tìm thấy đơn hàng</h2>
        <Link href="/don-hang" className="text-[var(--color-ember)] hover:underline mt-2 inline-block">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 animate-fade-in">
        <Link href="/don-hang" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[var(--color-terra)] transition-colors">
          <ArrowLeft size={16} />
          Quay lại
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <InlineStatusSelect
            value={order.status}
            orderId={order.id}
            onUpdate={handleStatusChange}
            isOpen={statusDropdownOpen}
            onToggle={() => setStatusDropdownOpen(prev => !prev)}
          />
          {role === 'admin' && (
            <Link href={`/admin/don-hang/${order.id}/sua`}>
              <Button variant="outline" size="sm" className="rounded-xl border-[var(--color-border-warm)] h-8 text-xs sm:text-sm">
                <Pencil size={13} className="mr-1" />
                Sửa
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Order info card */}
      <div className="bg-white rounded-2xl border border-[var(--color-border-warm)] shadow-sm overflow-hidden mb-4 sm:mb-6 animate-fade-in-up">
        <div className="p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 sm:mb-4">
            📋 Thông tin đơn
          </h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-20 shrink-0">Mã đơn</span>
              <span className="font-mono text-sm font-bold text-[var(--color-terra)]">{order.order_code}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-20 shrink-0">Khách hàng</span>
              <span className="font-semibold text-sm">{order.customer_name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-20 shrink-0">SĐT</span>
              <PhoneDisplay phone={order.customer_phone} showIcon />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-20 shrink-0">Sản phẩm</span>
              <span className="text-sm">{order.product_name} <span className="text-muted-foreground">x{order.quantity}</span></span>
            </div>
            {(order.reference_images?.length > 0 || role === 'admin') && (
              <div className="flex items-start gap-3">
                <span className="text-xs text-muted-foreground w-20 shrink-0 pt-2">Ảnh mẫu</span>
                <InlineImageCell images={order.reference_images || []} orderId={order.id} canUpload={role === 'admin'} onUpdate={handleImagesUpdate} />
              </div>
            )}
            {order.custom_requirements && (
              <div className="flex items-start gap-3">
                <span className="text-xs text-muted-foreground w-20 shrink-0">Yêu cầu</span>
                <span className="text-sm italic text-muted-foreground">&ldquo;{order.custom_requirements}&rdquo;</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
              <div className="bg-[var(--color-cream)] rounded-xl p-2.5 sm:p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ngày đặt</p>
                <p className="font-semibold text-sm mt-0.5">{order.start_date ? formatDate(order.start_date) : '—'}</p>
              </div>
              {order.price && (
                <div className="bg-[var(--color-cream)] rounded-xl p-2.5 sm:p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Giá</p>
                  <p className="font-semibold text-sm mt-0.5">{formatPrice(order.price)}</p>
                  {order.deposit && <p className="text-[10px] text-muted-foreground">Cọc: {formatPrice(order.deposit)}</p>}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-20 shrink-0">Nghệ nhân</span>
              <div className="flex flex-wrap gap-1.5">
                {order.assigned_staff.map(staff => (
                  <Badge key={staff.id} variant="secondary" className="rounded-full text-xs">
                    <span className="w-2 h-2 rounded-full mr-1" style={{ background: staff.avatar_color }} />
                    {staff.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== */}
      {/* ẢNH TIẾN ĐỘ — đơn giản: chụp/tải + gallery log */}
      {/* ===================== */}
      <div className="animate-fade-in-up stagger-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            📸 Ảnh tiến độ
            {photos.length > 0 && (
              <span className="text-[10px] bg-[var(--color-terra)] text-white rounded-full px-1.5 py-0.5 font-bold">
                {photos.length}
              </span>
            )}
          </h2>
        </div>

        {/* Nút chụp / tải ảnh */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => cameraRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[var(--color-terra)] to-[var(--color-ember)] text-white rounded-xl font-medium text-sm shadow-sm active:scale-[0.98] transition-transform"
          >
            <Camera size={18} />
            Chụp ảnh
          </button>
          <button
            onClick={() => galleryRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-[var(--color-border-warm)] text-[var(--color-terra)] rounded-xl font-medium text-sm hover:bg-[var(--color-cream)]/50 active:scale-[0.98] transition-all"
          >
            <ImageIcon size={18} />
            Tải ảnh
          </button>
        </div>

        {/* Input ẩn: camera */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileInput}
        />
        {/* Input ẩn: gallery (cho chọn nhiều) */}
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />

        {/* Gallery ảnh — mới nhất trước */}
        {photos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-[var(--color-border-warm)] p-8 sm:p-10 text-center">
            <div className="text-4xl mb-3">📷</div>
            <p className="font-medium text-[var(--color-text-primary)] text-sm">Chưa có ảnh tiến độ</p>
            <p className="text-xs text-muted-foreground mt-1">Chụp ảnh hoặc tải ảnh để ghi lại quá trình sản xuất</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {photos.map((photo, i) => (
              <div
                key={photo.id}
                className="bg-white rounded-2xl border border-[var(--color-border-warm)] overflow-hidden shadow-sm animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Ảnh */}
                <div className="relative aspect-[4/3] sm:aspect-[16/9] bg-[var(--color-cream)]">
                  <img
                    src={photo.url}
                    alt={`Tiến độ ${photos.length - i}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Nút xóa */}
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500 active:scale-90 transition-all"
                    aria-label="Xóa ảnh"
                  >
                    <X size={14} />
                  </button>
                  {/* Badge số thứ tự */}
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    #{photos.length - i}
                  </div>
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground">
                  <Clock size={12} />
                  <span>{formatPhotoTime(photo.timestamp)}</span>
                  <span className="text-[10px]">•</span>
                  <span className="text-[10px]">{formatDate(photo.timestamp, 'dd/MM/yyyy HH:mm')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
