'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Customer, Product, StaffName } from '@/lib/types';
import { createOrder } from '@/actions/order';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Plus, Calendar, User, Package, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CreateOrderPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    customer_id: '',
    product_name: '',
    product_id: '',
    quantity: 1,
    custom_requirements: '',
    due_date: '',
    start_date: '',
    price: '',
    deposit: '',
    internal_note: '',
  });
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Data từ Supabase
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [staffNames, setStaffNames] = useState<StaffName[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch customers, products, staff từ Supabase
  useEffect(() => {
    async function fetchData() {
      setLoadingData(true);
      try {
        const [cusRes, prodRes, staffRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/products'),
          fetch('/api/staff'),
        ]);

        if (cusRes.ok) {
          const cusData = await cusRes.json();
          if (Array.isArray(cusData)) setCustomers(cusData);
        }
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (Array.isArray(prodData)) setProducts(prodData);
        }
        if (staffRes.ok) {
          const staffData = await staffRes.json();
          if (Array.isArray(staffData)) setStaffNames(staffData);
        }
      } catch (err) {
        console.error('Error fetching form data:', err);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_id) {
      toast.error('Vui lòng chọn khách hàng');
      return;
    }
    if (!formData.due_date) {
      toast.error('Vui lòng chọn hạn giao');
      return;
    }

    setSaving(true);
    try {
      const orderPayload = {
        customer_id: formData.customer_id,
        product_name: formData.product_name || 'Chưa đặt tên',
        product_id: formData.product_id || null,
        quantity: formData.quantity,
        custom_requirements: formData.custom_requirements || null,
        due_date: formData.due_date,
        start_date: formData.start_date || null,
        price: formData.price ? parseFloat(formData.price) : null,
        deposit: formData.deposit ? parseFloat(formData.deposit) : null,
        internal_note: formData.internal_note || null,
        status: 'not_started' as const,
      };

      const result = await createOrder(orderPayload);

      // Tạo order_assignments cho staff đã chọn
      if (result.data?.id && selectedStaff.length > 0) {
        const assignRes = await fetch('/api/orders/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: result.data.id,
            staff_ids: selectedStaff,
          }),
        });
        if (!assignRes.ok) {
          console.warn('Không thể gán nghệ nhân, nhưng đơn hàng đã tạo thành công.');
        }
      }

      toast.success('Đã tạo đơn hàng mới!');
      router.push('/don-hang');
    } catch (err: any) {
      console.error('Create order error:', err);
      toast.error(err.message || 'Lỗi khi tạo đơn hàng');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/don-hang" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[var(--color-terra)] transition-colors mb-6">
        <ArrowLeft size={16} />
        Quay lại
      </Link>

      <div className="bg-white rounded-2xl border border-[var(--color-border-warm)] shadow-sm overflow-hidden animate-fade-in-up">
        <div className="px-6 py-5 border-b border-[var(--color-border-warm)]/50 bg-gradient-to-r from-[var(--color-terra)]/5 to-transparent">
          <h1 className="text-xl font-bold text-[var(--color-terra)] flex items-center gap-2">
            <Plus size={20} />
            Tạo đơn hàng mới
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Nhập thông tin đơn hàng để bắt đầu theo dõi</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <User size={14} className="text-[var(--color-terra)]" />
              Khách hàng <span className="text-red-500">*</span>
            </Label>
            <select
              value={formData.customer_id}
              onChange={e => setFormData(p => ({ ...p, customer_id: e.target.value }))}
              disabled={loadingData}
              className="w-full h-10 rounded-xl border border-[var(--color-border-warm)] px-3 text-sm bg-white focus:outline-none focus:border-[var(--color-ember)] focus:ring-2 focus:ring-[var(--color-ember)]/20 disabled:opacity-50"
            >
              <option value="">{loadingData ? 'Đang tải...' : 'Chọn khách hàng...'}</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
              ))}
            </select>
          </div>

          {/* Product */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Package size={14} className="text-[var(--color-ember)]" />
                Sản phẩm
              </Label>
              <select
                value={formData.product_id}
                onChange={e => {
                  const prod = products.find(p => p.id === e.target.value);
                  setFormData(p => ({
                    ...p,
                    product_id: e.target.value,
                    product_name: prod?.name || p.product_name,
                    price: prod?.reference_price?.toString() || p.price,
                  }));
                }}
                disabled={loadingData}
                className="w-full h-10 rounded-xl border border-[var(--color-border-warm)] px-3 text-sm bg-white focus:outline-none focus:border-[var(--color-ember)] disabled:opacity-50"
              >
                <option value="">{loadingData ? 'Đang tải...' : 'Chọn từ catalog...'}</option>
                {products.filter(p => p.is_active).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tên SP (tùy chỉnh)</Label>
              <Input
                value={formData.product_name}
                onChange={e => setFormData(p => ({ ...p, product_name: e.target.value }))}
                placeholder="VD: Ấm trà 200ml"
                className="rounded-xl border-[var(--color-border-warm)]"
              />
            </div>
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Số lượng</Label>
              <Input
                type="number"
                min={1}
                value={formData.quantity}
                onChange={e => setFormData(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))}
                className="rounded-xl border-[var(--color-border-warm)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Giá (VNĐ)</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={e => setFormData(p => ({ ...p, price: e.target.value }))}
                placeholder="0"
                className="rounded-xl border-[var(--color-border-warm)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Đã cọc (VNĐ)</Label>
              <Input
                type="number"
                value={formData.deposit}
                onChange={e => setFormData(p => ({ ...p, deposit: e.target.value }))}
                placeholder="0"
                className="rounded-xl border-[var(--color-border-warm)]"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Calendar size={14} />
                Ngày bắt đầu
              </Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={e => setFormData(p => ({ ...p, start_date: e.target.value }))}
                className="rounded-xl border-[var(--color-border-warm)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Calendar size={14} className="text-red-500" />
                Hạn giao <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={e => setFormData(p => ({ ...p, due_date: e.target.value }))}
                className="rounded-xl border-[var(--color-border-warm)]"
              />
            </div>
          </div>

          {/* Staff */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Nghệ nhân phụ trách</Label>
            {loadingData ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 size={14} className="animate-spin" />
                Đang tải danh sách nghệ nhân...
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {staffNames.filter(s => s.is_active).map(staff => (
                  <label
                    key={staff.id}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all
                      ${selectedStaff.includes(staff.id)
                        ? 'border-[var(--color-ember)] bg-[var(--color-ember)]/5'
                        : 'border-[var(--color-border-warm)] hover:border-gray-300'}
                    `}
                  >
                    <Checkbox
                      checked={selectedStaff.includes(staff.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedStaff(prev => [...prev, staff.id]);
                        } else {
                          setSelectedStaff(prev => prev.filter(id => id !== staff.id));
                        }
                      }}
                      className="sr-only"
                    />
                    <span className="w-3 h-3 rounded-full" style={{ background: staff.avatar_color }} />
                    <span className="text-sm">{staff.name}</span>
                  </label>
                ))}
                {staffNames.filter(s => s.is_active).length === 0 && (
                  <p className="text-sm text-muted-foreground">Chưa có nghệ nhân nào</p>
                )}
              </div>
            )}
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Yêu cầu riêng</Label>
            <Textarea
              value={formData.custom_requirements}
              onChange={e => setFormData(p => ({ ...p, custom_requirements: e.target.value }))}
              placeholder="VD: Khách muốn quai cao hơn, men nâu đất..."
              className="rounded-xl border-[var(--color-border-warm)] min-h-[80px]"
            />
          </div>

          {/* Internal note */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Ghi chú nội bộ</Label>
            <Textarea
              value={formData.internal_note}
              onChange={e => setFormData(p => ({ ...p, internal_note: e.target.value }))}
              placeholder="Ghi chú chỉ admin thấy..."
              className="rounded-xl border-[var(--color-border-warm)] min-h-[60px]"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 h-11 rounded-xl" onClick={() => router.back()}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={saving || loadingData}
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[var(--color-terra)] to-[var(--color-ember)] shadow-md"
            >
              {saving ? (
                <><Loader2 size={16} className="mr-1.5 animate-spin" />Đang lưu...</>
              ) : (
                <><Save size={16} className="mr-1.5" />Tạo đơn hàng</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
