import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const orderId = params.id;
    const body = await req.json();
    
    if (!Array.isArray(body.images)) {
      return NextResponse.json({ error: 'Mảng images không hợp lệ' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from('orders')
      .update({ 
        reference_images: body.images,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('API /orders/[id]/images error:', err);
    return NextResponse.json(
      { error: err.message || 'Lỗi cập nhật ảnh đơn hàng' },
      { status: 500 }
    );
  }
}
