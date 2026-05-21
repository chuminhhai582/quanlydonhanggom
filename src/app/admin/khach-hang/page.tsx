'use client';

import { useState } from 'react';
import { mockCustomers } from '@/lib/mock-data';
import { Customer } from '@/lib/types';
import { formatPhone } from '@/lib/utils/phone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Plus, Search, Pencil, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomersPage() {
  const [customers] = useState(mockCustomers);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-terra)]">Khách hàng</h1>
          <p className="text-sm text-muted-foreground mt-1">{customers.length} khách hàng</p>
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
                <Input placeholder="VD: Anh Minh" className="rounded-xl border-[var(--color-border-warm)]" />
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input placeholder="0912 345 678" className="rounded-xl border-[var(--color-border-warm)]" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="email@example.com" className="rounded-xl border-[var(--color-border-warm)]" />
              </div>
              <div className="space-y-2">
                <Label>Địa chỉ</Label>
                <Input placeholder="Địa chỉ giao hàng" className="rounded-xl border-[var(--color-border-warm)]" />
              </div>
              <div className="space-y-2">
                <Label>Ghi chú</Label>
                <Textarea placeholder="Ghi chú nội bộ..." className="rounded-xl border-[var(--color-border-warm)]" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDialogOpen(false)}>Hủy</Button>
                <Button className="flex-1 rounded-xl bg-gradient-to-r from-[var(--color-terra)] to-[var(--color-ember)]" onClick={() => { toast.success('Đã thêm khách hàng!'); setDialogOpen(false); }}>
                  Lưu
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
      </div>
    </div>
  );
}
