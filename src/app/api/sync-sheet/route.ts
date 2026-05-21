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

  for (const row of dataRows) {
    const orderCode = row[0]?.trim();
    if (!orderCode) { skipped++; continue; }

    // Kiểm tra đơn đã tồn tại
    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('order_code', orderCode)
      .single();

    if (existing) {
      // Cập nhật (chỉ các trường cho phép)
      const statusLabel = row[6]?.trim();
      const statusMap: Record<string, string> = {
        'Chưa bắt đầu': 'not_started',
        'Đang chế tác': 'crafting',
        'Đang phơi khô': 'drying',
        'Đang nung': 'firing',
        'Hỏng - Vỡ': 'broken',
        'Đang làm lại': 'redoing',
        'Đang nung lại': 'refiring',
      };

      const updateData: Record<string, any> = {};
      if (statusLabel && statusMap[statusLabel]) {
        updateData.status = statusMap[statusLabel];
      }
      if (row[5]?.trim()) updateData.start_date = row[5].trim();
      if (row[10]?.trim()) updateData.custom_requirements = row[10].trim();

      if (Object.keys(updateData).length > 0) {
        await supabase.from('orders').update(updateData).eq('id', existing.id);
        updated++;
      } else {
        skipped++;
      }
    } else {
      // Tạo mới — cần tìm/tạo customer trước
      const customerName = row[1]?.trim();
      const customerPhone = row[2]?.trim();

      if (!customerName) { skipped++; continue; }

      // Tìm customer hoặc tạo mới
      let customerId: string;
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('name', customerName)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: insertCustomerErr } = await supabase
          .from('customers')
          .insert({ name: customerName, phone: customerPhone || null })
          .select('id')
          .single();
        if (insertCustomerErr) {
          console.error('Error creating customer:', insertCustomerErr, 'Name:', customerName);
        }
        customerId = newCustomer?.id;
      }

      if (!customerId) { skipped++; continue; }

      const { error: insertOrderErr } = await supabase.from('orders').insert({
        order_code: orderCode,
        customer_id: customerId,
        product_name: row[3]?.trim() || 'Chưa đặt tên',
        quantity: parseInt(row[4]) || 1,
        start_date: row[5]?.trim() || null,
        due_date: row[5]?.trim() || new Date().toISOString().split('T')[0],
        price: row[8] ? parseFloat(row[8]) : null,
        deposit: row[9] ? parseFloat(row[9]) : null,
        custom_requirements: row[10]?.trim() || null,
        internal_note: row[11]?.trim() || null,
      });
      added++;
    }
  }

  // Log kết quả
  await supabase.from('sync_logs').insert({
    direction: 'sheet_to_app',
    sheet_id: process.env.GOOGLE_SHEET_ID,
    rows_added: added,
    rows_updated: updated,
    rows_skipped: skipped,
    rows_conflict: 0,
    status: 'success',
  });

  return NextResponse.json({
    success: true,
    message: `Đã nhập: +${added} mới, ${updated} cập nhật, ${skipped} bỏ qua`,
    added, updated, skipped,
  });
}
