'use client';

import { useState, useRef, useCallback } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';

const MAX_IMAGES = 3;

interface InlineImageCellProps {
  images: string[];
  orderId: string;
  canUpload: boolean;
}

export default function InlineImageCell({ images, orderId, canUpload }: InlineImageCellProps) {
  const [imgs, setImgs] = useState<string[]>(images);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = MAX_IMAGES - imgs.length;
    if (remaining <= 0) {
      toast.error(`Tối đa ${MAX_IMAGES} ảnh minh họa`);
      return;
    }

    const newImgs = [...imgs];
    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      newImgs.push(URL.createObjectURL(files[i]));
    }
    setImgs(newImgs);
    toast.success('Đã thêm ảnh minh họa');
    e.target.value = '';
  }, [imgs]);

  const removeImg = useCallback((idx: number) => {
    setImgs(prev => {
      // Revoke URL để tránh memory leak
      const url = prev[idx];
      if (url?.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
      return prev.filter((_, i) => i !== idx);
    });
    toast.success('Đã xóa ảnh');
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      {imgs.map((src, i) => (
        <div key={i} className="relative group w-9 h-9 rounded-lg overflow-hidden border border-[var(--color-border-warm)] shrink-0">
          <img src={src} alt={`Ảnh minh họa ${i + 1}`} className="w-full h-full object-cover" />
          {canUpload && (
            <button
              onClick={() => removeImg(i)}
              aria-label={`Xóa ảnh ${i + 1}`}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <X size={12} className="text-white" />
            </button>
          )}
        </div>
      ))}
      {canUpload && imgs.length < MAX_IMAGES && (
        <>
          <button
            onClick={() => fileRef.current?.click()}
            aria-label="Thêm ảnh minh họa"
            className="w-9 h-9 rounded-lg border-2 border-dashed border-[var(--color-border-warm)] flex items-center justify-center hover:border-[var(--color-terra)] hover:bg-[var(--color-cream)]/50 transition-colors shrink-0"
          >
            <ImagePlus size={14} className="text-muted-foreground" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
      {!canUpload && imgs.length === 0 && (
        <span className="text-xs text-muted-foreground">—</span>
      )}
    </div>
  );
}
