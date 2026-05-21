'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils/order-code';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Plus, Search, Pencil, Trash2, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch sản phẩm từ Supabase
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setProducts(data);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        toast.error('Không thể tải danh sách sản phẩm');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-terra)]">Catalog sản phẩm</h1>
          <p className="text-sm text-muted-foreground mt-1">{loading ? 'Đang tải...' : `${products.length} sản phẩm mẫu`}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="rounded-xl bg-gradient-to-r from-[var(--color-terra)] to-[var(--color-ember)] shadow-sm">
                <Plus size={16} className="mr-1.5" />
                Thêm SP
              </Button>
            }
          />
          <DialogContent className="rounded-2xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Thêm sản phẩm mẫu</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Tên sản phẩm *</Label>
                <Input placeholder="VD: Ấm trà 200ml" className="rounded-xl border-[var(--color-border-warm)]" />
              </div>
              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Textarea placeholder="Mô tả sản phẩm..." className="rounded-xl border-[var(--color-border-warm)]" />
              </div>
              <div className="space-y-2">
                <Label>Giá tham khảo (VNĐ)</Label>
                <Input type="number" placeholder="0" className="rounded-xl border-[var(--color-border-warm)]" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDialogOpen(false)}>Hủy</Button>
                <Button className="flex-1 rounded-xl bg-gradient-to-r from-[var(--color-terra)] to-[var(--color-ember)]" onClick={() => { toast.success('Đã thêm sản phẩm!'); setDialogOpen(false); }}>
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
          placeholder="Tìm sản phẩm..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-10 rounded-xl border-[var(--color-border-warm)] bg-white"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 size={24} className="animate-spin mr-2" />
          Đang tải danh sách sản phẩm...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product, i) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-[var(--color-border-warm)] overflow-hidden card-hover animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="h-32 bg-gradient-to-br from-[var(--color-cream)] to-[var(--color-cream-dark)] flex items-center justify-center text-4xl">
                🏺
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{product.name}</h3>
                    {product.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                    )}
                  </div>
                  <Badge variant={product.is_active ? 'default' : 'secondary'} className={`text-[10px] shrink-0 ml-2 rounded-full ${product.is_active ? 'bg-[var(--color-status-completed)]' : ''}`}>
                    {product.is_active ? 'Đang bán' : 'Ẩn'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border-warm)]/50">
                  <span className="font-bold text-sm text-[var(--color-ember)]">
                    {formatPrice(product.reference_price)}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg">
                      <Pencil size={12} />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg text-red-500 hover:bg-red-50">
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Không tìm thấy sản phẩm</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
