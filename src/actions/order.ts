'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Order, OrderStatus } from '@/lib/types';

export async function createOrder(orderData: Partial<Order>) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single();

  if (error) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    throw new Error('Không thể tạo đơn hàng: ' + error.message);
  }

  // Cập nhật lại các trang hiển thị đơn hàng
  revalidatePath('/(viewer)/dashboard', 'page');
  revalidatePath('/admin/don-hang', 'page');
  revalidatePath('/(viewer)/don-hang', 'page');

  return { success: true, data };
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('orders')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Lỗi khi cập nhật trạng thái:', error);
    throw new Error('Không thể cập nhật trạng thái: ' + error.message);
  }

  revalidatePath('/(viewer)/dashboard', 'page');
  revalidatePath('/admin/don-hang', 'page');
  revalidatePath('/(viewer)/don-hang', 'page');
  revalidatePath(`/(viewer)/don-hang/${orderId}`, 'page');
  revalidatePath(`/admin/don-hang/${orderId}/sua`, 'page');

  return { success: true, data };
}

export async function updateOrder(orderId: string, orderData: Partial<Order>) {
  const supabase = await createClient();

  // Loại bỏ các trường không được phép update trực tiếp nếu cần thiết
  const { id, created_at, ...updateData } = orderData as any;

  const { data, error } = await supabase
    .from('orders')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Lỗi khi cập nhật đơn hàng:', error);
    throw new Error('Không thể cập nhật đơn hàng: ' + error.message);
  }

  revalidatePath('/(viewer)/dashboard', 'page');
  revalidatePath('/admin/don-hang', 'page');
  revalidatePath('/(viewer)/don-hang', 'page');
  revalidatePath(`/(viewer)/don-hang/${orderId}`, 'page');
  revalidatePath(`/admin/don-hang/${orderId}/sua`, 'page');

  return { success: true, data };
}

export async function deleteOrder(orderId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);

  if (error) {
    console.error('Lỗi khi xóa đơn hàng:', error);
    throw new Error('Không thể xóa đơn hàng: ' + error.message);
  }

  revalidatePath('/(viewer)/dashboard', 'page');
  revalidatePath('/admin/don-hang', 'page');
  revalidatePath('/(viewer)/don-hang', 'page');

  return { success: true };
}
