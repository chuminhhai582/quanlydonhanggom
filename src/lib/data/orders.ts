'use server';

import { createClient } from '@/lib/supabase/server';
import { OrderWithCustomer, OrderStatus } from '@/lib/types';

/**
 * Lấy danh sách đơn hàng từ Supabase (thay thế getOrdersWithCustomer mock).
 * Nếu Supabase chưa kết nối → fallback về mock-data.
 */
export async function fetchOrders(role: 'admin' | 'viewer'): Promise<OrderWithCustomer[]> {
  // Kiểm tra Supabase đã cấu hình chưa
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // Fallback mock-data
    const { getOrdersWithCustomer } = await import('@/lib/mock-data');
    return getOrdersWithCustomer(role);
  }

  try {
    const supabase = await createClient();

    // Query đơn hàng kèm customer + staff
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers!inner (name, phone, email, address),
        order_assignments (
          staff_names (id, name, avatar_color, is_active)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      // Fallback mock-data khi lỗi
      const { getOrdersWithCustomer } = await import('@/lib/mock-data');
      return getOrdersWithCustomer(role);
    }

    // Lấy latest update cho mỗi đơn
    const orderIds = (orders || []).map((o: any) => o.id);
    const { data: latestUpdates } = await supabase
      .from('order_updates')
      .select('*')
      .in('order_id', orderIds)
      .order('created_at', { ascending: false });

    // Map sang OrderWithCustomer
    return (orders || []).map((order: any) => {
      const customer = order.customers;
      const staff = (order.order_assignments || [])
        .map((a: any) => a.staff_names)
        .filter(Boolean);
      const updates = (latestUpdates || []).filter((u: any) => u.order_id === order.id);

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
  } catch (err) {
    console.error('fetchOrders error:', err);
    const { getOrdersWithCustomer } = await import('@/lib/mock-data');
    return getOrdersWithCustomer(role);
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

  const supabase = await createClient();
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
