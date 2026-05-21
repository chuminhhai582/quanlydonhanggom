'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, Key, Users, FileSpreadsheet, AlertTriangle, Trash2, Plus, CheckCircle2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [adminEmails] = useState(['admin1@example.com', 'admin2@example.com']);
  const [newEmail, setNewEmail] = useState('');
  const [sheetUrl, setSheetUrl] = useState('https://docs.google.com/spreadsheets/d/example');
  const [testing, setTesting] = useState(false);

  const handleChangePin = () => {
    if (!currentPin) {
      toast.error('Vui lòng nhập mã PIN hiện tại');
      return;
    }
    if (newPin.length < 4 || newPin.length > 6) {
      toast.error('Mã PIN phải từ 4-6 chữ số');
      return;
    }
    if (newPin !== confirmPin) {
      toast.error('Mã PIN mới không khớp');
      return;
    }
    toast.success('Đã đổi mã PIN!', {
      description: 'Tất cả thiết bị Viewer sẽ phải nhập lại mã mới.',
    });
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
  };

  const handleForceLogout = () => {
    toast.success('Đã buộc tất cả Viewer đăng nhập lại!');
  };

  const handleTestConnection = async () => {
    setTesting(true);
    await new Promise(r => setTimeout(r, 1500));
    setTesting(false);
    toast.success('Kết nối Google Sheet thành công!');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-[var(--color-terra)] flex items-center gap-2">
          <Settings size={24} />
          Cài đặt
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Quản lý mã PIN, tài khoản admin và kết nối Sheet</p>
      </div>

      <div className="space-y-6">
        {/* Section 1: PIN */}
        <div className="bg-white rounded-2xl border border-[var(--color-border-warm)] shadow-sm overflow-hidden animate-fade-in-up">
          <div className="px-6 py-4 border-b border-[var(--color-border-warm)]/50 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-terra)]/10 flex items-center justify-center">
              <Key size={16} className="text-[var(--color-terra)]" />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--color-text-primary)]">Mã PIN truy cập</h2>
              <p className="text-xs text-muted-foreground">Mã PIN cho nhân viên xưởng nhập khi vào app</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>Đổi mã PIN sẽ khiến <strong>tất cả thiết bị Viewer</strong> phải nhập lại mã mới.</span>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Mã PIN hiện tại</Label>
              <Input
                type="password"
                value={currentPin}
                onChange={e => setCurrentPin(e.target.value)}
                placeholder="Nhập mã PIN hiện tại"
                className="rounded-xl border-[var(--color-border-warm)] max-w-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              <div className="space-y-2">
                <Label className="text-sm">Mã PIN mới</Label>
                <Input
                  type="password"
                  value={newPin}
                  onChange={e => setNewPin(e.target.value)}
                  placeholder="4-6 số"
                  maxLength={6}
                  className="rounded-xl border-[var(--color-border-warm)]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Xác nhận</Label>
                <Input
                  type="password"
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value)}
                  placeholder="Nhập lại"
                  maxLength={6}
                  className="rounded-xl border-[var(--color-border-warm)]"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleChangePin} className="rounded-xl bg-gradient-to-r from-[var(--color-terra)] to-[var(--color-ember)]">
                Đổi mã PIN
              </Button>
              <Button variant="outline" onClick={handleForceLogout} className="rounded-xl border-red-200 text-red-600 hover:bg-red-50">
                <RefreshCw size={14} className="mr-1.5" />
                Buộc tất cả đăng nhập lại
              </Button>
            </div>
          </div>
        </div>

        {/* Section 2: Admin Emails */}
        <div className="bg-white rounded-2xl border border-[var(--color-border-warm)] shadow-sm overflow-hidden animate-fade-in-up stagger-1">
          <div className="px-6 py-4 border-b border-[var(--color-border-warm)]/50 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-ember)]/10 flex items-center justify-center">
              <Users size={16} className="text-[var(--color-ember)]" />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--color-text-primary)]">Email Admin</h2>
              <p className="text-xs text-muted-foreground">Các email được phép đăng nhập admin</p>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {adminEmails.map(email => (
              <div key={email} className="flex items-center justify-between bg-[var(--color-cream)] rounded-xl px-4 py-3">
                <span className="text-sm font-medium">{email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-lg text-red-500 hover:bg-red-50"
                  disabled={adminEmails.length <= 1}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <Input
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="email@example.com"
                className="rounded-xl border-[var(--color-border-warm)]"
              />
              <Button
                variant="outline"
                className="rounded-xl border-[var(--color-border-warm)] shrink-0"
                onClick={() => {
                  if (newEmail) { toast.success(`Đã thêm ${newEmail}`); setNewEmail(''); }
                }}
              >
                <Plus size={14} className="mr-1" />
                Thêm
              </Button>
            </div>
          </div>
        </div>

        {/* Section 3: Google Sheet */}
        <div className="bg-white rounded-2xl border border-[var(--color-border-warm)] shadow-sm overflow-hidden animate-fade-in-up stagger-2">
          <div className="px-6 py-4 border-b border-[var(--color-border-warm)]/50 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <FileSpreadsheet size={16} className="text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--color-text-primary)]">Cấu hình Google Sheet</h2>
              <p className="text-xs text-muted-foreground">Kết nối Google Sheet để đồng bộ dữ liệu</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">URL Google Sheet đích</Label>
              <Input
                value={sheetUrl}
                onChange={e => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="rounded-xl border-[var(--color-border-warm)]"
              />
            </div>
            <div className="bg-[var(--color-cream)] rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-1">Service Account email (share quyền Editor cho email này):</p>
              <code className="text-xs bg-white px-2 py-1 rounded border border-[var(--color-border-warm)] select-all">
                gom-tracker@project.iam.gserviceaccount.com
              </code>
            </div>
            <Button onClick={handleTestConnection} disabled={testing} variant="outline" className="rounded-xl border-[var(--color-border-warm)]">
              {testing ? (
                <RefreshCw size={14} className="mr-1.5 animate-spin" />
              ) : (
                <CheckCircle2 size={14} className="mr-1.5" />
              )}
              {testing ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
