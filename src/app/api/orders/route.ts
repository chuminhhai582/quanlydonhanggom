import { NextRequest, NextResponse } from 'next/server';
import { fetchOrders } from '@/lib/data/orders';

/**
 * GET /api/orders?role=viewer|admin
 * Trả về danh sách đơn hàng từ Supabase (hoặc mock-data nếu chưa cấu hình)
 */
export async function GET(req: NextRequest) {
  try {
    const role = (req.nextUrl.searchParams.get('role') || 'viewer') as 'admin' | 'viewer';
    const orders = await fetchOrders(role);
    return NextResponse.json(orders);
  } catch (err: any) {
    console.error('API /orders error:', err);
    return NextResponse.json(
      { error: err.message || 'Lỗi lấy dữ liệu' },
      { status: 500 }
    );
  }
}
