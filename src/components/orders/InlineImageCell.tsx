'use client';

import { useState, useRef, useCallback } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';

const MAX_IMAGES = 3;

interface InlineImageCellProps {
  images: string[];
  orderId: string;
  canUpload: boolean;
  onUpdate?: (orderId: string, newImages: string[]) => void;
}

export default function InlineImageCell({ images, orderId, canUpload, onUpdate }: InlineImageCellProps) {
  const [imgs, setImgs] = useState<string[]>(images);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = MAX_IMAGES - imgs.length;
    if (remaining <= 0) {
      toast.error(`Tối đa ${MAX_IMAGES} ảnh minh họa`);
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Đang tải ảnh lên (tự động nén)...');
    const newImgs = [...imgs];

    try {
      for (let i = 0; i < Math.min(files.length, remaining); i++) {
        // Nén ảnh trước khi upload
        const options = {
          maxSizeMB: 1, // Giới hạn 1MB
          maxWidthOrHeight: 1920,
          useWebWorker: true
        };
        const compressedFile = await imageCompression(files[i], options);

        const formData = new FormData();
        formData.append('file', compressedFile, compressedFile.name);
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!res.ok) throw new Error('Lỗi tải ảnh');
        
        const data = await res.json();
        newImgs.push(data.url);
      }

      // Save to database
      const updateRes = await fetch(`/api/orders/${orderId}/images`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: newImgs })
      });
      if (!updateRes.ok) throw new Error('Lỗi cập nhật CSDL');

      setImgs(newImgs);
      if (onUpdate) onUpdate(orderId, newImgs);
      toast.success('Đã lưu ảnh mới', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi tải ảnh lên', { id: toastId });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  }, [imgs, orderId, onUpdate]);

  const removeImg = useCallback(async (idx: number) => {
    const newImgs = imgs.filter((_, i) => i !== idx);
    const toastId = toast.loading('Đang xóa ảnh...');
    try {
      const updateRes = await fetch(`/api/orders/${orderId}/images`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: newImgs })
      });
      if (!updateRes.ok) throw new Error('Lỗi cập nhật CSDL');

      setImgs(newImgs);
      if (onUpdate) onUpdate(orderId, newImgs);
      toast.success('Đã xóa ảnh', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi xóa ảnh', { id: toastId });
    }
  }, [imgs, orderId, onUpdate]);

  return (
    <div className="flex items-center gap-2">
      {imgs.map((src, i) => (
        <div key={i} className="relative group w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border border-[var(--color-border-warm)] shadow-sm shrink-0">
          <img src={src} alt={`Ảnh minh họa ${i + 1}`} className="w-full h-full object-cover" />
          {canUpload && (
            <button
              onClick={() => removeImg(i)}
              aria-label={`Xóa ảnh ${i + 1}`}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <X size={16} className="text-white" />
            </button>
          )}
        </div>
      ))}
      {canUpload && imgs.length < MAX_IMAGES && (
        <>
          <button
            onClick={() => fileRef.current?.click()}
            aria-label="Thêm ảnh minh họa"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 border-dashed border-[var(--color-border-warm)] flex items-center justify-center hover:border-[var(--color-terra)] hover:bg-[var(--color-cream)]/50 transition-colors shrink-0"
            disabled={isUploading}
          >
            <ImagePlus size={18} className="text-muted-foreground" />
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
