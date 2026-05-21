import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createAdminClient } from '@/lib/supabase/server';
import {
  readSheetTab, writeSheetTab, ensureTabExists
} from '@/lib/google-sheets';
import { getStatusLabel } from '@/lib/utils/order-code';

// Headers cho sheet đơn hàng
const ORDER_HEADERS = [
  'Mã đơn', 'Khách hàng', 'SĐT', 'Sản phẩm', 'SL',
  'Ngày đặt', 'Tiến độ', 'Nghệ nhân', 'Giá', 'Cọc',
  'Yêu cầu riêng', 'Ghi chú nội bộ', 'Cập nhật lúc'
];

const CUSTOMER_HEADERS = ['Tên', 'SĐT', 'Email', 'Địa chỉ', 'Ghi chú'];

/**
 * POST /api/sync-sheet
 * Body: { direction: 'app_to_sheet' | 'sheet_to_app' }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const direction = body.direction || 'app_to_sheet';

    // Kiểm tra env
    if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL || !process.env.GOOGLE_SHEET_ID) {
      return NextResponse.json(
        { error: 'Chưa cấu hình Google Sheets. Kiểm tra GOOGLE_SHEETS_CLIENT_EMAIL và GOOGLE_SHEET_ID.' },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { error: 'Chưa cấu hình Supabase. Thêm NEXT_PUBLIC_SUPABASE_URL trên Vercel.' },
        { status: 400 }
      );
    }

    if (direction === 'app_to_sheet') {
      return await syncAppToSheet();
    } else {
      return await syncSheetToApp();
    }
  } catch (err: any) {
    console.error('Sync error:', err);
    return NextResponse.json(
      { error: err.message || 'Lỗi đồng bộ' },
      { status: 500 }
    );
  }
}

// ---- APP → SHEET ----
async function syncAppToSheet() {
  const supabase = await createAdminClient();

  // 1. Lấy đơn hàng từ Supabase
  const { data: orders, error: ordersErr } = await supabase
    .from('orders')
    .select(`
      *,
      customers (name, phone),
      order_assignments (
        staff_names (name)
      )
    `)
    .order('created_at', { ascending: false });

  if (ordersErr) throw new Error('Lỗi lấy đơn hàng: ' + ordersErr.message);

  // 2. Lấy khách hàng
  const { data: customers, error: custErr } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (custErr) throw new Error('Lỗi lấy khách hàng: ' + custErr.message);

  // 3. Tạo tabs nếu chưa có
  await ensureTabExists('Đơn hàng');
  await ensureTabExists('Khách hàng');

  // 4. Ghi tab Đơn hàng
  const orderRows = [ORDER_HEADERS];
  for (const order of (orders || [])) {
    const customer = order.customers as any;
    const staffNames = ((order.order_assignments || []) as any[])
      .map((a: any) => a.staff_names?.name)
      .filter(Boolean)
      .join(', ');

    orderRows.push([
      order.order_code || '',
      customer?.name || '',
      customer?.phone || '',
      order.product_name || '',
      String(order.quantity || 1),
      order.start_date || '',
      getStatusLabel(order.status),
      staffNames,
      order.price ? String(order.price) : '',
      order.deposit ? String(order.deposit) : '',
      order.custom_requirements || '',
      order.internal_note || '',
      order.updated_at || '',
    ]);
  }
  await writeSheetTab('Đơn hàng', orderRows);

  // 5. Ghi tab Khách hàng
  const customerRows = [CUSTOMER_HEADERS];
  for (const c of (customers || [])) {
    customerRows.push([
      c.name || '',
      c.phone || '',
      c.email || '',
      c.address || '',
      c.note || '',
    ]);
  }
  await writeSheetTab('Khách hàng', customerRows);

  // 6. Log kết quả
  await supabase.from('sync_logs').insert({
    direction: 'app_to_sheet',
    sheet_id: process.env.GOOGLE_SHEET_ID,
    rows_added: 0,
    rows_updated: (orders || []).length,
    rows_skipped: 0,
    rows_conflict: 0,
    status: 'success',
  });

  return NextResponse.json({
    success: true,
    message: `Đã xuất ${(orders || []).length} đơn hàng và ${(customers || []).length} khách hàng ra Google Sheet`,
    orders_count: (orders || []).length,
    customers_count: (customers || []).length,
  });
}

// ---- SHEET → APP ----
async function syncSheetToApp() {
  const supabase = await createAdminClient();

  // 1. Đọc tab Đơn hàng
  const sheetData = await readSheetTab('Đơn hàng');
  if (sheetData.length < 2) {
    return NextResponse.json({
      success: true,
      message: 'Sheet trống hoặc chỉ có header',
      added: 0, updated: 0, skipped: 0,
    });
  }

  const headers = sheetData[0];
  const dataRows = sheetData.slice(1);

  let added = 0, updated = 0, skipped = 0;
  const errors: string[] = [];

  for (const row of dataRows) {
    const orderCode = row[0]?.trim();
    if (!orderCode) { skipped++; continue; }

    // Kiểm tra đơn đã tồn tại theo Mã đơn (cột A - ID gốc)
    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('order_code', orderCode)
      .maybeSingle();

    // Parse ngày từ Sheet (DD/MM/YYYY) → PostgreSQL (YYYY-MM-DD)
    const rawDate = row[5]?.trim();
    const parsedDate = parseSheetDate(rawDate);
    const today = new Date().toISOString().split('T')[0];

    // Map trạng thái từ label tiếng Việt → enum
    const statusLabel = row[6]?.trim();
    const statusMap: Record<string, string> = {
      'Chưa bắt đầu': 'not_started',
      'Chưa BD': 'not_started',
      'Đang chế tác': 'crafting',
      'Chế tác': 'crafting',
      'Đang phơi khô': 'drying',
      'Phơi khô': 'drying',
      'Đang nung': 'firing',
      'Nung': 'firing',
      'Hỏng - Vỡ': 'broken',
      'Hỏng': 'broken',
      'Đang làm lại': 'redoing',
      'Làm lại': 'redoing',
      'Đang nung lại': 'refiring',
      'Nung lại': 'refiring',
    };
    const mappedStatus = statusLabel ? statusMap[statusLabel] || 'not_started' : 'not_started';

    if (existing) {
      // === CẬP NHẬT đơn đã tồn tại ===
      const updateData: Record<string, any> = {};
      if (statusLabel && statusMap[statusLabel]) {
        updateData.status = statusMap[statusLabel];
      }
      if (parsedDate) updateData.start_date = parsedDate;
      if (row[8]?.trim()) updateData.price = parseFloat(row[8]);
      if (row[9]?.trim()) updateData.deposit = parseFloat(row[9]);
      if (row[10]?.trim()) updateData.custom_requirements = row[10].trim();
      if (row[11]?.trim()) updateData.internal_note = row[11].trim();

      if (Object.keys(updateData).length > 0) {
        const { error: updateErr } = await supabase
          .from('orders')
          .update(updateData)
          .eq('id', existing.id);
        if (updateErr) {
          errors.push(`Cập nhật đơn ${orderCode}: ${updateErr.message}`);
          console.error(`Update order ${orderCode} error:`, updateErr);
        } else {
          updated++;
        }
      } else {
        skipped++;
      }
    } else {
      // === TẠO MỚI — tìm/tạo customer trước ===
      const customerName = row[1]?.trim();
      const customerPhone = row[2]?.trim();

      if (!customerName) {
        errors.push(`Đơn ${orderCode}: thiếu tên khách hàng`);
        skipped++;
        continue;
      }

      // Tìm customer theo tên hoặc SĐT
      let customerId: string | null = null;

      if (customerPhone) {
        const { data: byPhone } = await supabase
          .from('customers')
          .select('id')
          .eq('phone', customerPhone)
          .maybeSingle();
        if (byPhone) customerId = byPhone.id;
      }

      if (!customerId) {
        const { data: byName } = await supabase
          .from('customers')
          .select('id')
          .eq('name', customerName)
          .maybeSingle();
        if (byName) customerId = byName.id;
      }

      // Tạo customer mới nếu chưa có
      if (!customerId) {
        const { data: newCustomer, error: insertCustErr } = await supabase
          .from('customers')
          .insert({ name: customerName, phone: customerPhone || null })
          .select('id')
          .single();
        if (insertCustErr) {
          errors.push(`Tạo KH "${customerName}": ${insertCustErr.message}`);
          console.error('Insert customer error:', insertCustErr);
          skipped++;
          continue;
        }
        customerId = newCustomer?.id;
      }

      if (!customerId) {
        errors.push(`Đơn ${orderCode}: không tạo được khách hàng`);
        skipped++;
        continue;
      }

      // Parse giá & cọc
      const price = row[8]?.trim() ? parseFloat(row[8].replace(/,/g, '')) : null;
      const deposit = row[9]?.trim() ? parseFloat(row[9].replace(/,/g, '')) : null;

      // Insert đơn hàng
      const { error: insertOrderErr } = await supabase.from('orders').insert({
        order_code: orderCode,
        customer_id: customerId,
        product_name: row[3]?.trim() || 'Chưa đặt tên',
        quantity: parseInt(row[4]) || 1,
        start_date: parsedDate || today,
        due_date: parsedDate || today, // Dùng ngày đặt làm hạn giao mặc định
        status: mappedStatus,
        price: isNaN(price as number) ? null : price,
        deposit: isNaN(deposit as number) ? null : deposit,
        custom_requirements: row[10]?.trim() || null,
        internal_note: row[11]?.trim() || null,
      });

      if (insertOrderErr) {
        errors.push(`Tạo đơn ${orderCode}: ${insertOrderErr.message}`);
        console.error(`Insert order ${orderCode} error:`, insertOrderErr);
        skipped++;
      } else {
        added++;
      }
    }
  }

  // Log kết quả
  const status = errors.length > 0 ? (added > 0 ? 'partial' : 'failed') : 'success';
  await supabase.from('sync_logs').insert({
    direction: 'sheet_to_app',
    sheet_id: process.env.GOOGLE_SHEET_ID,
    rows_added: added,
    rows_updated: updated,
    rows_skipped: skipped,
    rows_conflict: errors.length,
    status,
    error_message: errors.length > 0 ? errors.join('\n') : null,
  });

  const message = errors.length > 0
    ? `Đã nhập: +${added} mới, ${updated} cập nhật, ${skipped} bỏ qua. Lỗi: ${errors.length}`
    : `Đã nhập: +${added} mới, ${updated} cập nhật, ${skipped} bỏ qua`;

  return NextResponse.json({
    success: added > 0 || updated > 0,
    message,
    added, updated, skipped,
    errors: errors.length > 0 ? errors : undefined,
  });
}

/**
 * Parse ngày từ Sheet (DD/MM/YYYY hoặc MM/DD/YYYY hoặc YYYY-MM-DD)
 * → PostgreSQL format YYYY-MM-DD
 */
function parseSheetDate(raw: string | undefined | null): string | null {
  if (!raw || !raw.trim()) return null;
  const s = raw.trim();

  // Nếu đã đúng format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // DD/MM/YYYY
  const ddmmyyyy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyy) {
    const day = ddmmyyyy[1].padStart(2, '0');
    const month = ddmmyyyy[2].padStart(2, '0');
    const year = ddmmyyyy[3];
    // Nếu day > 12 thì chắc chắn là DD/MM/YYYY
    // Nếu cả hai ≤ 12, ưu tiên DD/MM/YYYY (format VN)
    return `${year}-${month}-${day}`;
  }

  // Fallback: thử parse bằng Date
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  return null;
}

