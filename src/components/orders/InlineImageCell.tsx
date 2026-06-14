'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';

const MAX_IMAGES = 3;

interface InlineImageCellProps {
  images: string[];
  notes?: string[];
  orderId: string;
  canUpload: boolean;
  onUpdate?: (orderId: string, newImages: string[], newNotes?: string[]) => void;
  showNotesList?: boolean;
}

export default function InlineImageCell({ 
  images, 
  notes = [], 
  orderId, 
  canUpload, 
  onUpdate,
  showNotesList = false 
}: InlineImageCellProps) {
  const [imgs, setImgs] = useState<string[]>(images);
  const [localNotes, setLocalNotes] = useState<string[]>(notes);
  const [isUploading, setIsUploading] = useState(false);
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Sync props to state
  useEffect(() => {
    setImgs(images);
  }, [images]);

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  const openViewingModal = useCallback((idx: number) => {
    setViewingIndex(idx);
    setEditingNote(localNotes[idx] || '');
  }, [localNotes]);

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
    const newNotes = [...localNotes];

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
        newNotes.push('');
      }

      // Save to database
      const updateRes = await fetch(`/api/orders/${orderId}/images`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: newImgs, notes: newNotes })
      });
      if (!updateRes.ok) throw new Error('Lỗi cập nhật CSDL');

      setImgs(newImgs);
      setLocalNotes(newNotes);
      if (onUpdate) onUpdate(orderId, newImgs, newNotes);
      toast.success('Đã lưu ảnh mới', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi tải ảnh lên', { id: toastId });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  }, [imgs, localNotes, orderId, onUpdate]);

  const removeImg = useCallback(async (e: React.MouseEvent, idx: number) => {
    e.stopPropagation(); // Ngăn sự kiện click lan truyền ra ngoài
    if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh mẫu này?')) {
      return;
    }

    const newImgs = imgs.filter((_, i) => i !== idx);
    const newNotes = localNotes.filter((_, i) => i !== idx);
    const toastId = toast.loading('Đang xóa ảnh...');
    try {
      const updateRes = await fetch(`/api/orders/${orderId}/images`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: newImgs, notes: newNotes })
      });
      if (!updateRes.ok) throw new Error('Lỗi cập nhật CSDL');

      setImgs(newImgs);
      setLocalNotes(newNotes);
      if (onUpdate) onUpdate(orderId, newImgs, newNotes);
      toast.success('Đã xóa ảnh', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi xóa ảnh', { id: toastId });
    }
  }, [imgs, localNotes, orderId, onUpdate]);

  const handleSaveNote = useCallback(async (idx: number) => {
    if (idx === null || idx < 0 || idx >= imgs.length) return;

    setIsSavingNote(true);
    const toastId = toast.loading('Đang lưu ghi chú...');
    const newNotes = [...localNotes];
    while (newNotes.length < imgs.length) {
      newNotes.push('');
    }
    newNotes[idx] = editingNote;

    try {
      const updateRes = await fetch(`/api/orders/${orderId}/images`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: imgs, notes: newNotes })
      });
      if (!updateRes.ok) throw new Error('Lỗi cập nhật CSDL');

      setLocalNotes(newNotes);
      if (onUpdate) onUpdate(orderId, imgs, newNotes);
      toast.success('Đã lưu ghi chú', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi lưu ghi chú', { id: toastId });
    } finally {
      setIsSavingNote(false);
    }
  }, [imgs, localNotes, editingNote, orderId, onUpdate]);

  return (
    <div className="flex flex-col items-start w-full">
      <div className="flex items-center gap-2">
        {imgs.map((src, i) => (
          <div 
            key={i} 
            className="relative group w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border border-[var(--color-border-warm)] shadow-sm shrink-0 cursor-pointer hover:border-[var(--color-terra)] transition-colors"
            onClick={() => openViewingModal(i)}
          >
            <img src={src} alt={`Ảnh minh họa ${i + 1}`} className="w-full h-full object-cover" />
            {localNotes[i] && (
              <div className="absolute top-0.5 right-0.5 w-4.5 h-4.5 rounded bg-black/60 text-white flex items-center justify-center pointer-events-none z-10 shadow-sm border border-white/10">
                <span className="text-[10px]">📝</span>
              </div>
            )}
            {canUpload && (
              <button
                onClick={(e) => removeImg(e, i)}
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

      {showNotesList && imgs.some((_, i) => localNotes[i]) && (
        <div className="mt-2.5 space-y-1.5 text-xs text-muted-foreground w-full max-w-md">
          {imgs.map((_, i) => localNotes[i] ? (
            <div key={i} className="flex items-start gap-1.5 bg-[var(--color-cream)]/30 border border-[var(--color-border-warm)]/40 p-2 rounded-lg">
              <span className="font-semibold text-[var(--color-terra)] shrink-0">Ảnh #{i + 1}:</span>
              <span className="italic break-words text-[var(--color-text-primary)]">{localNotes[i]}</span>
            </div>
          ) : null)}
        </div>
      )}

      {/* Fullscreen Image Viewer Modal */}
      {viewingIndex !== null && imgs[viewingIndex] && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setViewingIndex(null)}
        >
          <button 
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
            onClick={(e) => { e.stopPropagation(); setViewingIndex(null); }}
          >
            <X size={24} />
          </button>
          
          <div className="flex flex-col items-center max-w-[95vw] max-h-[85vh] gap-4">
            <img 
              src={imgs[viewingIndex]} 
              alt={`Ảnh xem to ${viewingIndex + 1}`} 
              className="max-h-[60vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()} 
            />
            
            <div 
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 w-full max-w-lg text-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-sm font-semibold mb-2.5 flex items-center gap-1.5 text-zinc-300">
                📝 Ghi chú cho ảnh #{viewingIndex + 1}
              </h3>
              {canUpload ? (
                <div className="space-y-3">
                  <textarea
                    value={editingNote}
                    onChange={(e) => setEditingNote(e.target.value)}
                    placeholder="Nhập thông tin ghi chú cho ảnh mẫu này..."
                    className="w-full text-sm bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--color-terra)] focus:ring-1 focus:ring-[var(--color-terra)]"
                    rows={2.5}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setViewingIndex(null)}
                      className="px-3 py-1.5 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded-lg text-xs font-semibold active:scale-95 transition-all"
                    >
                      Đóng
                    </button>
                    <button
                      onClick={() => handleSaveNote(viewingIndex)}
                      disabled={isSavingNote}
                      className="px-4 py-1.5 bg-[var(--color-terra)] text-white hover:bg-[var(--color-terra-dark)] disabled:opacity-50 rounded-lg text-xs font-semibold active:scale-95 transition-all"
                    >
                      {isSavingNote ? 'Đang lưu...' : 'Lưu ghi chú'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-300 italic min-h-[40px] whitespace-pre-wrap">
                    {localNotes[viewingIndex] || 'Không có ghi chú nào cho ảnh này.'}
                  </p>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setViewingIndex(null)}
                      className="px-4 py-1.5 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded-lg text-xs font-semibold active:scale-95 transition-all"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
