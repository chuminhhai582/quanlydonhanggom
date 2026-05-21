'use client';

import { useState, useEffect } from 'react';
import { Customer } from '@/lib/types';
import { formatPhone } from '@/lib/utils/phone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Plus, Search, Pencil, Trash2, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createCustomer } from '@/actions/customer';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '', phone: '', email: '', address: '', note: '',
  });
  const [saving, setSaving] = useState(false);

  // Fetch khách hàng từ Supabase
  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true);
        const res = await fetch('/api/customers');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setCustomers(data);
        }
      } catch (err) {
        console.error('Error fetching customers:', err);
        toast.error('Không thể tải danh sách khách hàng');
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCustomer = async () => {
    if (!newCustomer.name.trim()) {
      toast.error('Vui lòng nhập tên khách hàng');
      return;
    }
    setSaving(true);
    try {
      const result = await createCustomer({
        name: newCustomer.name.trim(),
        phone: newCustomer.phone.trim() || null,
        email: newCustomer.email.trim() || null,
        address: newCustomer.address.trim() || null,
        note: newCustomer.note.trim() || null,
      });
      if (result.data) {
        setCustomers(prev => [result.data, ...prev]);
      }
      toast.success('Đã thêm khách hàng!');
      setDialogOpen(false);
      setNewCustomer({ name: '', phone: '', email: '', address: '', note: '' });
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi thêm khách hàng');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-terra)]">Khách hàng</h1>
          <p className="text-sm text-muted-foreground mt-1">{loading ? 'Đang tải...' : `${customers.length} khách hàng`}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="rounded-xl bg-gradient-to-r from-[var(--color-terra)] to-[var(--color-ember)] shadow-sm">
                <Plus size={16} className="mr-1.5" />
                Thêm khách
              </Button>
            }
          />
          <DialogContent className="rounded-2xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Thêm khách hàng mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Tên khách hàng *</Label>
                <Input
                  placeholder="VD: Anh Minh"
                  value={newCustomer.name}
                  onChange={e => setNewCustomer(p => ({ ...p, name: e.target.value }))}
                  className="rounded-xl border-[var(--color-border-warm)]"
                />
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input
                  placeholder="0912 345 678"
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer(p => ({ ...p, phone: e.target.value }))}
                  className="rounded-xl border-[var(--color-border-warm)]"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={newCustomer.email}
                  onChange={e => setNewCustomer(p => ({ ...p, email: e.target.value }))}
                  className="rounded-xl border-[var(--color-border-warm)]"
                />
              </div>
              <div className="space-y-2">
                <Label>Địa chỉ</Label>
                <Input
                  placeholder="Địa chỉ giao hàng"
                  value={newCustomer.address}
                  onChange={e => setNewCustomer(p => ({ ...p, address: e.target.value }))}
                  className="rounded-xl border-[var(--color-border-warm)]"
                />
              </div>
              <div className="space-y-2">
                <Label>Ghi chú</Label>
                <Textarea
                  placeholder="Ghi chú nội bộ..."
                  value={newCustomer.note}
                  onChange={e => setNewCustomer(p => ({ ...p, note: e.target.value }))}
                  className="rounded-xl border-[var(--color-border-warm)]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDialogOpen(false)}>Hủy</Button>
                <Button
                  className="flex-1 rounded-xl bg-gradient-to-r from-[var(--color-terra)] to-[var(--color-ember)]"
                  onClick={handleAddCustomer}
                  disabled={saving}
                >
                  {saving ? <><Loader2 size={14} className="mr-1.5 animate-spin" />Đang lưu...</> : 'Lưu'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          placeholder="Tìm tên, SĐT, email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-10 rounded-xl border-[var(--color-border-warm)] bg-white"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 size={24} className="animate-spin mr-2" />
          Đang tải danh sách khách hàng...
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((customer, i) => (
            <div
              key={customer.id}
              className="bg-white rounded-2xl border border-[var(--color-border-warm)] p-4 card-hover animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--color-text-primary)]">{customer.name}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                    {customer.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone size={12} className="text-[var(--color-status-completed)]" />
                        {formatPhone(customer.phone)}
                      </span>
                    )}
                    {customer.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail size={12} className="text-[var(--color-ember)]" />
                        {customer.email}
                      </span>
                    )}
                    {customer.address && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={12} />
                        {customer.address}
                      </span>
                    )}
                  </div>
                  {customer.note && (
                    <p className="text-xs text-muted-foreground mt-2 italic">{customer.note}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0 ml-3">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-[var(--color-cream)]">
                    <Pencil size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-red-50 text-red-500">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="font-medium">Không tìm thấy khách hàng</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
