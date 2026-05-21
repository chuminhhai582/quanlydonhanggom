import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/orders/assignments
 * Body: { order_id: string, staff_ids: string[] }
 * Tạo order_assignments cho đơn hàng
 */
export async function POST(req: NextRequest) {
  try {
    const { order_id, staff_ids } = await req.json();

    if (!order_id || !Array.isArray(staff_ids) || staff_ids.length === 0) {
      return NextResponse.json(
        { error: 'Thiếu order_id hoặc staff_ids' },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    const assignments = staff_ids.map(staffId => ({
      order_id,
      staff_name_id: staffId,
    }));

    const { error } = await supabase
      .from('order_assignments')
      .insert(assignments);

    if (error) {
      console.error('Assignment error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API /orders/assignments error:', err);
    return NextResponse.json(
      { error: err.message || 'Lỗi gán nghệ nhân' },
      { status: 500 }
    );
  }
}
