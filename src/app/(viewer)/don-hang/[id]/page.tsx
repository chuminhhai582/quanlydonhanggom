'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { getOrdersWithCustomer, mockOrderUpdates } from '@/lib/mock-data';
import { OrderUpdate, OrderStatus } from '@/lib/types';
import StatusBadge from '@/components/orders/StatusBadge';
import PhoneDisplay from '@/components/orders/PhoneDisplay';
import { formatDate, formatRelativeTime, isOverdue, getDueDateLabel } from '@/lib/utils/date';
import { formatPrice, getStatusColor, getStatusLabel } from '@/lib/utils/order-code';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger
} from '@/components/ui/sheet';
import {
  ArrowLeft, Plus, Camera, Pencil, Trash2, Phone, User, Package,
  Calendar, AlertTriangle, Clock, Image as ImageIcon, MessageSquare, X, Upload
} from 'lucide-react';
import { toast } from 'sonner';

export default function OrderDetailPage() {
  const params = useParams();
  const { role } = useAuth();
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [milestoneName, setMilestoneName] = useState('');
  const [updaterName, setUpdaterName] = useState('');
  const [updateNote, setUpdateNote] = useState('');
  const [statusAfter, setStatusAfter] = useState<OrderStatus>('in_progress');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const order = useMemo(() => {
    const orders = getOrdersWithCustomer(role || 'viewer');
    return orders.find(o => o.id === params.id);
  }, [params.id, role]);

  const updates = useMemo(() => {
    return mockOrderUpdates
      .filter(u => u.order_id === params.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [params.id]);

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

  const overdue = isOverdue(order.due_date, order.status);

  const handleAddImage = () => {
    // Simulate image upload
    const fakeUrl = `/placeholder-pottery-${Math.floor(Math.random() * 5) + 1}.jpg`;
    setUploadedImages(prev => [...prev, fakeUrl]);
    toast.success('Đã thêm ảnh');
  };

  const handleSubmitUpdate = () => {
    if (!milestoneName) {
      toast.error('Vui lòng nhập tên mốc');
      return;
    }
    toast.success('Đã cập nhật tiến độ!', {
      description: `Mốc "${milestoneName}" đã được lưu.`,
    });
    setUpdateDialogOpen(false);
    setMilestoneName('');
    setUpdaterName('');
    setUpdateNote('');
    setUploadedImages([]);
    setStatusAfter('in_progress');
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const UpdateForm = () => (
    <div className="space-y-5 py-2">
      <div className="space-y-2">
        <Label htmlFor="milestone" className="text-sm font-medium">Tên mốc <span className="text-red-500">*</span></Label>
        <Input
          id="milestone"
          placeholder="VD: Nung lần 1, Phơi khô..."
          value={milestoneName}
          onChange={e => setMilestoneName(e.target.value)}
          className="rounded-xl border-[var(--color-border-warm)]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="updater" className="text-sm font-medium">Tên người cập nhật</Label>
        <Input
          id="updater"
          placeholder="VD: Linh, Tú..."
          value={updaterName}
          onChange={e => setUpdaterName(e.target.value)}
          className="rounded-xl border-[var(--color-border-warm)]"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Ảnh tiến độ (1-5 ảnh) <span className="text-red-500">*</span></Label>
        <div className="flex flex-wrap gap-2">
          {uploadedImages.map((img, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl bg-[var(--color-cream-dark)] border border-[var(--color-border-warm)] overflow-hidden group">
              <div className="w-full h-full flex items-center justify-center text-2xl">🏺</div>
              <button
                onClick={() => setUploadedImages(prev => prev.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          {uploadedImages.length < 5 && (
            <button
              onClick={handleAddImage}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-[var(--color-border-warm)] flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-[var(--color-ember)] hover:text-[var(--color-ember)] transition-colors"
            >
              <Camera size={18} />
              <span className="text-[10px]">Thêm ảnh</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note" className="text-sm font-medium">Ghi chú</Label>
        <Textarea
          id="note"
          placeholder="Mô tả tiến độ..."
          value={updateNote}
          onChange={e => setUpdateNote(e.target.value)}
          className="rounded-xl border-[var(--color-border-warm)] min-h-[80px]"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Trạng thái đơn sau cập nhật</Label>
        <RadioGroup value={statusAfter} onValueChange={v => setStatusAfter(v as OrderStatus)} className="flex gap-3">
          {(['not_started', 'in_progress', 'completed'] as OrderStatus[]).map(s => (
            <label key={s} className={`
              flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all
              ${statusAfter === s
                ? 'border-[var(--color-ember)] bg-[var(--color-ember)]/5'
                : 'border-[var(--color-border-warm)] hover:border-gray-300'}
            `}>
              <RadioGroupItem value={s} className="sr-only" />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: getStatusColor(s) }} />
              <span className="text-xs font-medium">{getStatusLabel(s)}</span>
            </label>
          ))}
        </RadioGroup>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setUpdateDialogOpen(false)}>
          Hủy
        </Button>
        <Button
          className="flex-1 rounded-xl bg-gradient-to-r from-[var(--color-terra)] to-[var(--color-ember)]"
          onClick={handleSubmitUpdate}
        >
          <Upload size={14} className="mr-1.5" />
          Lưu cập nhật
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <Link href="/don-hang" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[var(--color-terra)] transition-colors">
          <ArrowLeft size={16} />
          Quay lại
        </Link>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} size="lg" />
          {role === 'admin' && (
            <Link href={`/admin/don-hang/${order.id}/sua`}>
              <Button variant="outline" size="sm" className="rounded-xl border-[var(--color-border-warm)]">
                <Pencil size={14} className="mr-1" />
                Sửa
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Overdue banner */}
      {overdue && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm animate-fade-in">
          <AlertTriangle size={16} />
          <span className="font-medium">Đơn hàng đã trễ hạn! {getDueDateLabel(order.due_date, order.status)}</span>
        </div>
      )}

      {/* Order info card */}
      <div className="bg-white rounded-2xl border border-[var(--color-border-warm)] shadow-sm overflow-hidden mb-6 animate-fade-in-up">
        <div className="p-5 border-b border-[var(--color-border-warm)]/50">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            📋 Thông tin đơn
          </h2>

          <div className="space-y-3.5">
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

            {order.custom_requirements && (
              <div className="flex items-start gap-3">
                <span className="text-xs text-muted-foreground w-20 shrink-0">Yêu cầu</span>
                <span className="text-sm italic text-muted-foreground">&ldquo;{order.custom_requirements}&rdquo;</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-[var(--color-cream)] rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ngày đặt</p>
                <p className="font-semibold text-sm mt-0.5">{order.start_date ? formatDate(order.start_date) : '—'}</p>
              </div>
              <div className={`rounded-xl p-3 ${overdue ? 'bg-red-50' : 'bg-[var(--color-cream)]'}`}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Hạn giao</p>
                <p className={`font-semibold text-sm mt-0.5 ${overdue ? 'text-red-600' : ''}`}>{formatDate(order.due_date)}</p>
              </div>
            </div>

            {order.price && (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs text-muted-foreground w-20 shrink-0">Giá</span>
                <span className="text-sm font-semibold">{formatPrice(order.price)}</span>
                {order.deposit && (
                  <span className="text-xs text-muted-foreground">(Cọc: {formatPrice(order.deposit)})</span>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-20 shrink-0">Nhân viên</span>
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

        {/* Progress bar */}
        <div className="px-5 py-4 bg-[var(--color-cream)]/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Tiến độ sản xuất</span>
            <span className="text-sm font-bold text-[var(--color-ember)]">{updates.length}/6 mốc</span>
          </div>
          <div className="progress-bar h-2.5">
            <div className="progress-bar-fill" style={{ width: `${Math.min((updates.length / 6) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Timeline section */}
      <div className="animate-fade-in-up stagger-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            📸 Tiến độ sản xuất
          </h2>

          {/* Add update button */}
          <Button
            className="h-9 rounded-xl bg-gradient-to-r from-[var(--color-terra)] to-[var(--color-ember)] shadow-sm text-sm"
            onClick={() => setUpdateDialogOpen(true)}
          >
            <Plus size={14} className="mr-1" />
            Cập nhật tiến độ
          </Button>

          {isMobile ? (
            <Sheet open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
              <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Cập nhật tiến độ mới</SheetTitle>
                </SheetHeader>
                <UpdateForm />
              </SheetContent>
            </Sheet>
          ) : (
            <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
              <DialogContent className="sm:max-w-lg rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Cập nhật tiến độ mới</DialogTitle>
                </DialogHeader>
                <UpdateForm />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {updates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[var(--color-border-warm)] p-8 text-center">
              <div className="text-4xl mb-3">📷</div>
              <p className="font-medium text-[var(--color-text-primary)]">Chưa có cập nhật nào</p>
              <p className="text-sm text-muted-foreground mt-1">Bấm &ldquo;Cập nhật tiến độ&rdquo; để thêm mốc đầu tiên</p>
            </div>
          ) : (
            updates.map((update, i) => (
              <div
                key={update.id}
                className="bg-white rounded-2xl border border-[var(--color-border-warm)] overflow-hidden animate-fade-in-up shadow-sm"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {/* Update header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-warm)]/50 bg-[var(--color-cream)]/30">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                      style={{ background: getStatusColor(update.status_after) }}
                    >
                      {updates.length - i}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{update.milestone_name}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Clock size={10} />
                        {formatDate(update.created_at, 'dd/MM HH:mm')}
                        <span>•</span>
                        <span>Bởi: {update.created_by_name || 'Khách'}</span>
                      </div>
                    </div>
                  </div>

                  {role === 'admin' && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg">
                        <Pencil size={12} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg text-red-500 hover:bg-red-50">
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Images */}
                {update.images.length > 0 && (
                  <div className="p-4 flex gap-2 overflow-x-auto">
                    {update.images.map(img => (
                      <div
                        key={img.id}
                        className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-gradient-to-br from-[var(--color-cream)] to-[var(--color-cream-dark)] border border-[var(--color-border-warm)] flex items-center justify-center text-3xl shrink-0 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        🏺
                      </div>
                    ))}
                  </div>
                )}

                {/* Note */}
                {update.note && (
                  <div className="px-4 pb-4 flex items-start gap-2">
                    <MessageSquare size={14} className="text-[var(--color-ember)] shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground italic">&ldquo;{update.note}&rdquo;</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
