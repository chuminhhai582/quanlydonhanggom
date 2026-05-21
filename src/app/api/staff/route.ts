import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/staff
 * Trả về danh sách nghệ nhân (staff_names) từ Supabase
 */
export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { error: 'Supabase URL is not configured' },
        { status: 500 }
      );
    }

    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('staff_names')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Staff query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error('API /staff error:', err);
    return NextResponse.json(
      { error: err.message || 'Lỗi lấy dữ liệu nghệ nhân' },
      { status: 500 }
    );
  }
}
