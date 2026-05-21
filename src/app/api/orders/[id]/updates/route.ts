import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { OrderStatus } from '@/lib/types';

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const orderId = params.id;
    const body = await req.json();
    
    const { milestone_name, status_after, image_urls } = body as {
      milestone_name: string;
      status_after: OrderStatus;
      image_urls: string[];
    };

    const supabase = await createAdminClient();

    // 1. Get current order to verify it exists and get its status if not provided
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    const finalStatus = status_after || order.status;

    // 2. Insert into order_updates
    const { data: updateData, error: updateError } = await supabase
      .from('order_updates')
      .insert({
        order_id: orderId,
        milestone_name: milestone_name || 'Cập nhật ảnh tiến độ',
        status_after: finalStatus,
        created_by_type: 'viewer', // or admin depending on context, but this is fine for tracking
      })
      .select()
      .single();

    if (updateError) throw updateError;

    // 3. Insert into order_update_images
    if (image_urls && image_urls.length > 0) {
      const imageRecords = image_urls.map((url, index) => ({
        update_id: updateData.id,
        image_url: url,
        storage_path: url, // Assuming URL for now
        display_order: index
      }));

      const { error: imagesError } = await supabase
        .from('order_update_images')
        .insert(imageRecords);

      if (imagesError) throw imagesError;
    }

    // Return the new update with images for the client
    return NextResponse.json({
      ...updateData,
      images: image_urls?.map((url, i) => ({
        id: `temp-${Date.now()}-${i}`,
        image_url: url,
        created_at: new Date().toISOString()
      })) || []
    });
  } catch (err: any) {
    console.error('API /orders/[id]/updates error:', err);
    return NextResponse.json(
      { error: err.message || 'Lỗi lưu cập nhật tiến độ' },
      { status: 500 }
    );
  }
}
