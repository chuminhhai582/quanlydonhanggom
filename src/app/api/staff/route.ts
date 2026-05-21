import { NextRequest, NextResponse } from 'next/server';
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

/**
 * POST /api/staff
 * Thêm nghệ nhân mới
 */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ error: 'Supabase URL is not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { name, avatar_color } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Tên nghệ nhân không được để trống' }, { status: 400 });
    }

    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('staff_names')
      .insert({
        name: name.trim(),
        avatar_color: avatar_color || '#94A3B8',
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Staff insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('API POST /staff error:', err);
    return NextResponse.json(
      { error: err.message || 'Lỗi thêm nghệ nhân' },
      { status: 500 }
    );
  }
}
