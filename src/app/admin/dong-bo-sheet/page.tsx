'use client';

import { useState, useEffect } from 'react';
import { SyncFieldConfig, SyncLog, SyncDirection } from '@/lib/types';
import { formatDateTime, formatRelativeTime } from '@/lib/utils/date';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowUpFromLine, ArrowDownToLine, FileSpreadsheet, Save, RefreshCw,
  CheckCircle2, XCircle, AlertTriangle, Clock, ExternalLink, Eye,
  ArrowLeftRight, Settings2, History
} from 'lucide-react';
import { toast } from 'sonner';

export default function SheetSyncPage() {
  const [fieldConfigs, setFieldConfigs] = useState<SyncFieldConfig[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [syncDirection, setSyncDirection] = useState<SyncDirection>('app_to_sheet');
  const [dateRange, setDateRange] = useState<'all' | '30days' | 'custom'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [duplicateMode, setDuplicateMode] = useState<'skip' | 'overwrite' | 'copy'>('skip');
  const [writeMode, setWriteMode] = useState<'overwrite' | 'append'>('overwrite');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('config');

  // Fetch cấu hình và lịch sử đồng bộ từ Supabase
  useEffect(() => {
    async function fetchSyncData() {
      try {
        setLoadingConfig(true);
        const res = await fetch('/api/sync-config');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.fieldConfigs) && data.fieldConfigs.length > 0) {
            setFieldConfigs(data.fieldConfigs);
          }
          if (Array.isArray(data.syncLogs)) {
            setSyncLogs(data.syncLogs);
          }
        }
      } catch (err) {
        console.error('Error fetching sync config:', err);
      } finally {
        setLoadingConfig(false);
      }
    }
    fetchSyncData();
  }, []);

  const groups = [
    { key: 'orders', label: 'Đơn hàng', icon: '📦' },
    { key: 'updates', label: 'Tiến độ (chỉ App → Sheet)', icon: '📸' },
    { key: 'customers', label: 'Khách hàng', icon: '👤' },
  ];

  const handleToggleField = (id: string, field: 'enabled' | 'sync_to_sheet' | 'sync_from_sheet') => {
    setFieldConfigs(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, [field]: !c[field] };
      }
      return c;
    }));
  };

  const handleSaveConfig = () => {
    toast.success('Đã lưu cấu hình đồng bộ!');
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sync-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction: syncDirection }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Lỗi đồng bộ');
      } else {
        toast.success(data.message, {
          description: 'Xem chi tiết trong lịch sử đồng bộ.',
        });
      }
    } catch (err: any) {
      toast.error('Lỗi kết nối: ' + (err.message || 'Không thể kết nối server'));
    } finally {
      setSyncing(false);
    }
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-terra)] flex items-center gap-2">
            <FileSpreadsheet size={24} />
            Đồng bộ Google Sheet
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Đồng bộ 2 chiều giữa webapp và Google Sheet</p>
        </div>
        <a
          href="/api/open-sheet"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border-warm)] text-sm font-medium hover:bg-[var(--color-cream)] transition-colors"
        >
          <ExternalLink size={14} />
          Mở Sheet
        </a>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 rounded-xl bg-[var(--color-cream-dark)] p-1 h-auto">
          <TabsTrigger value="config" className="rounded-lg py-2.5 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Settings2 size={14} className="mr-1.5" />
            Cấu hình trường
          </TabsTrigger>
          <TabsTrigger value="sync" className="rounded-lg py-2.5 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <ArrowLeftRight size={14} className="mr-1.5" />
            Đồng bộ
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg py-2.5 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <History size={14} className="mr-1.5" />
            Lịch sử
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Field Configuration */}
        <TabsContent value="config" className="animate-fade-in-up">
          <div className="bg-white rounded-2xl border border-[var(--color-border-warm)] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--color-border-warm)]/50 bg-gradient-to-r from-[var(--color-terra)]/5 to-transparent">
              <h2 className="font-semibold text-[var(--color-terra)]">Cấu hình trường đồng bộ</h2>
              <p className="text-xs text-muted-foreground mt-1">Chọn trường nào sẽ được đồng bộ và hướng đồng bộ</p>
            </div>

            <div className="divide-y divide-[var(--color-border-warm)]/50">
              {groups.map(group => {
                const fields = fieldConfigs.filter(f => f.data_group === group.key);
                return (
                  <div key={group.key} className="px-6 py-5">
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                      <span>{group.icon}</span>
                      {group.label}
                    </h3>

                    {/* Header */}
                    <div className="grid grid-cols-[1fr_auto_auto_auto_80px] gap-3 items-center mb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <span>Trường</span>
                      <span className="w-20 text-center">Bật</span>
                      <span className="w-24 text-center">Sheet→App</span>
                      <span className="w-24 text-center">App→Sheet</span>
                      <span className="text-center">Cột Sheet</span>
                    </div>

                    <div className="space-y-1">
                      {fields.map(field => (
                        <div
                          key={field.id}
                          className={`
                            grid grid-cols-[1fr_auto_auto_auto_80px] gap-3 items-center py-2.5 px-3 rounded-xl transition-all
                            ${field.enabled ? 'bg-[var(--color-cream)]/50' : 'opacity-50'}
                          `}
                        >
                          <span className="text-sm font-medium">{field.display_name}</span>
                          
                          <div className="w-20 flex justify-center">
                            <Checkbox
                              checked={field.enabled}
                              onCheckedChange={() => handleToggleField(field.id, 'enabled')}
                              className="border-[var(--color-border-warm)] data-[state=checked]:bg-[var(--color-terra)] data-[state=checked]:border-[var(--color-terra)]"
                            />
                          </div>

                          <div className="w-24 flex justify-center">
                            {field.is_readonly && field.data_group !== 'customers' ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : (
                              <Checkbox
                                checked={field.sync_from_sheet}
                                onCheckedChange={() => handleToggleField(field.id, 'sync_from_sheet')}
                                disabled={!field.enabled || field.is_readonly}
                                className="border-[var(--color-border-warm)] data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                              />
                            )}
                          </div>

                          <div className="w-24 flex justify-center">
                            <Checkbox
                              checked={field.sync_to_sheet}
                              onCheckedChange={() => handleToggleField(field.id, 'sync_to_sheet')}
                              disabled={!field.enabled}
                              className="border-[var(--color-border-warm)] data-[state=checked]:bg-[var(--color-ember)] data-[state=checked]:border-[var(--color-ember)]"
                            />
                          </div>

                          <div className="text-center">
                            <span className="text-xs text-muted-foreground font-mono bg-[var(--color-cream-dark)] px-2 py-0.5 rounded">
                              {field.sheet_column}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-4 border-t border-[var(--color-border-warm)]/50 bg-[var(--color-cream)]/30 flex justify-end">
              <Button onClick={handleSaveConfig} className="rounded-xl bg-gradient-to-r from-[var(--color-terra)] to-[var(--color-ember)]">
                <Save size={14} className="mr-1.5" />
                Lưu cấu hình
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: Sync Action */}
        <TabsContent value="sync" className="animate-fade-in-up">
          <div className="bg-white rounded-2xl border border-[var(--color-border-warm)] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--color-border-warm)]/50 bg-gradient-to-r from-[var(--color-terra)]/5 to-transparent">
              <h2 className="font-semibold text-[var(--color-terra)]">Thực hiện đồng bộ</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Direction */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Hướng đồng bộ</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSyncDirection('app_to_sheet')}
                    className={`
                      flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all
                      ${syncDirection === 'app_to_sheet'
                        ? 'border-[var(--color-ember)] bg-[var(--color-ember)]/5 shadow-sm'
                        : 'border-[var(--color-border-warm)] hover:border-gray-300'}
                    `}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${syncDirection === 'app_to_sheet' ? 'bg-[var(--color-ember)] text-white' : 'bg-[var(--color-cream)] text-muted-foreground'}`}>
                      <ArrowUpFromLine size={22} />
                    </div>
                    <span className="font-semibold text-sm">App → Sheet</span>
                    <span className="text-xs text-muted-foreground text-center">Xuất dữ liệu từ webapp ra Sheet</span>
                  </button>
                  <button
                    onClick={() => setSyncDirection('sheet_to_app')}
                    className={`
                      flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all
                      ${syncDirection === 'sheet_to_app'
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-[var(--color-border-warm)] hover:border-gray-300'}
                    `}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${syncDirection === 'sheet_to_app' ? 'bg-blue-500 text-white' : 'bg-[var(--color-cream)] text-muted-foreground'}`}>
                      <ArrowDownToLine size={22} />
                    </div>
                    <span className="font-semibold text-sm">Sheet → App</span>
                    <span className="text-xs text-muted-foreground text-center">Nhập dữ liệu từ Sheet vào webapp</span>
                  </button>
                </div>
              </div>

              <Separator className="bg-[var(--color-border-warm)]" />

              {/* Date range */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Khoảng thời gian</Label>
                <RadioGroup value={dateRange} onValueChange={v => setDateRange(v as typeof dateRange)} className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <RadioGroupItem value="all" />
                    Tất cả
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <RadioGroupItem value="30days" />
                    30 ngày gần nhất
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <RadioGroupItem value="custom" />
                    Tùy chọn
                  </label>
                </RadioGroup>
                {dateRange === 'custom' && (
                  <div className="grid grid-cols-2 gap-3 pl-6">
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                      className="rounded-xl border-[var(--color-border-warm)]"
                    />
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={e => setDateTo(e.target.value)}
                      className="rounded-xl border-[var(--color-border-warm)]"
                    />
                  </div>
                )}
              </div>

              <Separator className="bg-[var(--color-border-warm)]" />

              {/* Mode options */}
              {syncDirection === 'sheet_to_app' ? (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Xử lý trùng lặp</Label>
                  <RadioGroup value={duplicateMode} onValueChange={v => setDuplicateMode(v as typeof duplicateMode)} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <RadioGroupItem value="skip" />
                      Bỏ qua đơn đã tồn tại (theo mã đơn)
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <RadioGroupItem value="overwrite" />
                      Cập nhật đơn đã tồn tại (ghi đè)
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <RadioGroupItem value="copy" />
                      Tạo bản sao mới
                    </label>
                  </RadioGroup>
                </div>
              ) : (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Cách ghi</Label>
                  <RadioGroup value={writeMode} onValueChange={v => setWriteMode(v as typeof writeMode)} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <RadioGroupItem value="overwrite" />
                      Ghi đè sheet (xóa data cũ, ghi mới)
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <RadioGroupItem value="append" />
                      Thêm vào cuối
                    </label>
                  </RadioGroup>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 rounded-xl border-[var(--color-border-warm)]" onClick={handlePreview}>
                  <Eye size={14} className="mr-1.5" />
                  Xem trước thay đổi
                </Button>
                <Button
                  className={`flex-1 rounded-xl shadow-md ${
                    syncDirection === 'app_to_sheet'
                      ? 'bg-gradient-to-r from-[var(--color-terra)] to-[var(--color-ember)]'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600'
                  }`}
                  onClick={handleSync}
                  disabled={syncing}
                >
                  <RefreshCw size={14} className={`mr-1.5 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: Sync History */}
        <TabsContent value="history" className="animate-fade-in-up">
          <div className="bg-white rounded-2xl border border-[var(--color-border-warm)] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--color-border-warm)]/50 bg-gradient-to-r from-[var(--color-terra)]/5 to-transparent">
              <h2 className="font-semibold text-[var(--color-terra)]">Lịch sử đồng bộ</h2>
            </div>

            <div className="divide-y divide-[var(--color-border-warm)]/50">
              {syncLogs.map((log, i) => (
                <div key={log.id} className="px-6 py-4 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        log.status === 'success' ? 'bg-green-50 text-green-600' :
                        log.status === 'failed' ? 'bg-red-50 text-red-500' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {log.status === 'success' ? <CheckCircle2 size={20} /> :
                         log.status === 'failed' ? <XCircle size={20} /> :
                         <AlertTriangle size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={`rounded-full text-[10px] font-semibold ${
                            log.direction === 'app_to_sheet' ? 'bg-[var(--color-ember)]/10 text-[var(--color-ember)]' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {log.direction === 'app_to_sheet' ? '📤 App→Sheet' : '📥 Sheet→App'}
                          </Badge>
                          <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className="rounded-full text-[10px]">
                            {log.status === 'success' ? 'Thành công' : log.status === 'failed' ? 'Lỗi' : 'Một phần'}
                          </Badge>
                        </div>

                        {log.status === 'success' && (
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                            {log.rows_added > 0 && <span className="text-green-600">+{log.rows_added} thêm mới</span>}
                            {log.rows_updated > 0 && <span className="text-blue-600">{log.rows_updated} cập nhật</span>}
                            {log.rows_skipped > 0 && <span>{log.rows_skipped} bỏ qua</span>}
                            {log.rows_conflict > 0 && <span className="text-amber-600">{log.rows_conflict} xung đột</span>}
                          </div>
                        )}

                        {log.error_message && (
                          <p className="text-xs text-red-500 mt-1">{log.error_message}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={10} />
                        {formatRelativeTime(log.created_at)}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{formatDateTime(log.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}

              {syncLogs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <History size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Chưa có lịch sử đồng bộ</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="rounded-2xl sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Xem trước thay đổi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-green-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                Thêm mới (3)
              </h4>
              <div className="space-y-1.5 text-sm text-green-800">
                <p>DH-20261215-001 • Anh Tùng • Bình hoa lớn</p>
                <p>DH-20261216-002 • Chị Mai • Ấm trà set 4</p>
                <p>DH-20261216-003 • Anh Hùng • Đĩa trang trí</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-1.5">
                <RefreshCw size={14} />
                Cập nhật (2)
              </h4>
              <div className="space-y-1.5 text-sm text-blue-800">
                <p>DH-20261210-005 • Hạn giao: 25/12 → 28/12</p>
                <p>DH-20261211-006 • NV: Linh → Linh, Tú</p>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-1.5">
                <AlertTriangle size={14} />
                Xung đột (1)
              </h4>
              <div className="text-sm text-amber-800 space-y-2">
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="font-medium">DH-20261210-005 • Yêu cầu riêng</p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div className="bg-blue-50 rounded-lg p-2">
                      <p className="font-semibold text-blue-600">Sheet:</p>
                      <p>&ldquo;Quai cao 3cm&rdquo;</p>
                    </div>
                    <div className="bg-[var(--color-ember)]/5 rounded-lg p-2">
                      <p className="font-semibold text-[var(--color-ember)]">App:</p>
                      <p>&ldquo;Quai cao 2.5cm, thêm nắp&rdquo;</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" className="rounded-lg text-xs h-7 flex-1 border-blue-200 text-blue-600 hover:bg-blue-50">Giữ Sheet</Button>
                    <Button size="sm" variant="outline" className="rounded-lg text-xs h-7 flex-1 border-[var(--color-ember)]/30 text-[var(--color-ember)] hover:bg-[var(--color-ember)]/5">Giữ App</Button>
                    <Button size="sm" variant="ghost" className="rounded-lg text-xs h-7">Bỏ qua</Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setPreviewOpen(false)}>Hủy</Button>
              <Button
                className="flex-1 rounded-xl bg-gradient-to-r from-[var(--color-terra)] to-[var(--color-ember)]"
                onClick={() => { setPreviewOpen(false); handleSync(); }}
              >
                ✅ Áp dụng 5 thay đổi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
