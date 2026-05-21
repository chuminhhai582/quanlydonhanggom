import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/customers
 * Trả về danh sách khách hàng từ Supabase
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
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Customers query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error('API /customers error:', err);
    return NextResponse.json(
      { error: err.message || 'Lỗi lấy dữ liệu khách hàng' },
      { status: 500 }
    );
  }
}
