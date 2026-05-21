'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Customer } from '@/lib/types';

export async function createCustomer(customerData: Partial<Customer>) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('customers')
    .insert([customerData])
    .select()
    .single();

  if (error) {
    console.error('Lỗi khi thêm khách hàng:', error);
    throw new Error('Không thể thêm khách hàng: ' + error.message);
  }

  revalidatePath('/admin/khach-hang', 'page');
  revalidatePath('/admin/don-hang/moi', 'page');

  return { success: true, data };
}

export async function updateCustomer(customerId: string, customerData: Partial<Customer>) {
  const supabase = await createClient();

  const { id, created_at, ...updateData } = customerData as any;

  const { data, error } = await supabase
    .from('customers')
    .update(updateData)
    .eq('id', customerId)
    .select()
    .single();

  if (error) {
    console.error('Lỗi khi cập nhật khách hàng:', error);
    throw new Error('Không thể cập nhật khách hàng: ' + error.message);
  }

  revalidatePath('/admin/khach-hang', 'page');
  revalidatePath('/(viewer)/dashboard', 'page');
  revalidatePath('/admin/don-hang', 'page');

  return { success: true, data };
}
