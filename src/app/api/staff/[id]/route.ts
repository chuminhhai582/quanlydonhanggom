import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ error: 'Supabase URL is not configured' }, { status: 500 });
    }

    const supabase = await createAdminClient();
    
    // Check if staff is assigned to any order
    const { data: assignments, error: checkError } = await supabase
      .from('order_assignments')
      .select('id')
      .eq('staff_name_id', id)
      .limit(1);

    if (checkError) throw checkError;

    if (assignments && assignments.length > 0) {
      return NextResponse.json(
        { error: 'Không thể xóa nghệ nhân đang được gán cho đơn hàng.' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('staff_names')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API delete staff error:', err);
    return NextResponse.json(
      { error: err.message || 'Lỗi xóa nghệ nhân' },
      { status: 500 }
    );
  }
}
