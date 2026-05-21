'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { OrderWithCustomer, OrderStatus } from '@/lib/types';

/**
 * Lấy danh sách đơn hàng từ Supabase.
 * Dùng adminClient (service role) để bypass RLS vì viewer auth
 * dựa trên PIN (không có Supabase session).
 */
export async function fetchOrders(role: 'admin' | 'viewer'): Promise<OrderWithCustomer[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Supabase URL is not configured');
  }

  try {
    const supabase = await createAdminClient();

    // Query đơn hàng kèm customer + staff
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (name, phone, email, address),
        order_assignments (
          staff_names (id, name, avatar_color, is_active)
        ),
        order_updates (
          id, order_id, milestone_name, note, status_after, created_by_name, created_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Supabase query error:', error);
      throw new Error(error.message);
    }

    // Map sang OrderWithCustomer
    return (orders || []).map((order: any) => {
      const customer = order.customers;
      const staff = (order.order_assignments || [])
        .map((a: any) => a.staff_names)
        .filter(Boolean);
        
      const updates = order.order_updates || [];
      updates.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return {
        id: order.id,
        order_code: order.order_code,
        customer_id: order.customer_id,
        product_name: order.product_name,
        product_id: order.product_id,
        quantity: order.quantity,
        custom_requirements: order.custom_requirements,
        reference_images: order.reference_images || [],
        status: order.status as OrderStatus,
        start_date: order.start_date,
        due_date: order.due_date,
        price: order.price,
        deposit: order.deposit,
        internal_note: order.internal_note,
        created_at: order.created_at,
        updated_at: order.updated_at,
        // Customer
        customer_name: customer?.name || 'N/A',
        customer_phone: role === 'admin' ? customer?.phone : maskPhone(customer?.phone),
        customer_email: role === 'admin' ? customer?.email : undefined,
        customer_address: role === 'admin' ? customer?.address : undefined,
        // Staff
        assigned_staff: staff,
        updates_count: updates.length,
        latest_update: updates[0] || undefined,
      };
    });
  } catch (err: any) {
    console.error('fetchOrders error:', err);
    throw new Error(err.message || 'Lỗi khi lấy dữ liệu đơn hàng');
  }
}

/** Upload ảnh lên Supabase Storage */
export async function uploadProgressImage(
  orderId: string,
  file: File
): Promise<{ url: string; path: string } | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null; // Không upload khi chưa cấu hình
  }

  const supabase = await createAdminClient();
  const fileName = `${orderId}/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from('order-images')
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('order-images')
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
}

function maskPhone(phone: string | null | undefined): string | null {
  if (!phone || phone.length < 4) return null;
  return phone.substring(0, 4) + ' *** ***';
}
