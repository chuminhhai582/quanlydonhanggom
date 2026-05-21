import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/products
 * Trả về danh sách sản phẩm từ Supabase
 */
export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { error: 'Supabase URL is not configured' },
        { status: 500 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Products query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error('API /products error:', err);
    return NextResponse.json(
      { error: err.message || 'Lỗi lấy dữ liệu sản phẩm' },
      { status: 500 }
    );
  }
}
