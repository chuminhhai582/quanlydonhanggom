import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string; imageId: string }> }) {
  try {
    const params = await props.params;
    const { imageId } = params;

    const supabase = await createAdminClient();

    const { error } = await supabase
      .from('order_update_images')
      .delete()
      .eq('id', imageId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API delete update image error:', err);
    return NextResponse.json(
      { error: err.message || 'Lỗi xóa ảnh tiến độ' },
      { status: 500 }
    );
  }
}
