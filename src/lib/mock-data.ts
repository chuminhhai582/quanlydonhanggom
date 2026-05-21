// Mock data store for Gốm Tracker
// Used when Supabase is not configured
import { 
  Customer, Product, Order, StaffName, OrderUpdate, 
  OrderUpdateImage, OrderWithCustomer, SyncFieldConfig, SyncLog 
} from './types';

// ---- Staff Names ----
export const mockStaffNames: StaffName[] = [
  { id: 's1', name: 'Linh', avatar_color: '#E57373', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 's2', name: 'Tú', avatar_color: '#64B5F6', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 's3', name: 'Hoa', avatar_color: '#81C784', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 's4', name: 'An', avatar_color: '#FFB74D', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 's5', name: 'Phương', avatar_color: '#BA68C8', is_active: true, created_at: '2026-01-01T00:00:00Z' },
];

// ---- Customers ----
export const mockCustomers: Customer[] = [
  { id: 'c1', name: 'Anh Minh', phone: '0912345678', email: 'minh@email.com', address: '123 Bát Tràng, Gia Lâm, Hà Nội', note: 'Khách quen, hay đặt ấm trà', created_at: '2026-01-15T00:00:00Z' },
  { id: 'c2', name: 'Chị Hà', phone: '0987654321', email: null, address: '45 Nguyễn Trãi, Q5, HCM', note: null, created_at: '2026-02-01T00:00:00Z' },
  { id: 'c3', name: 'Anh Tú', phone: '0909123456', email: 'tu.nguyen@gmail.com', address: null, note: 'Đặt cho quán cà phê', created_at: '2026-03-10T00:00:00Z' },
  { id: 'c4', name: 'Chị Lan', phone: '0933456789', email: null, address: '78 Lê Lợi, Đà Nẵng', note: null, created_at: '2026-04-20T00:00:00Z' },
  { id: 'c5', name: 'Anh Hùng', phone: '0971234567', email: 'hung.tran@company.vn', address: '256 Trần Phú, Nha Trang', note: 'Đặt sỉ cho showroom', created_at: '2026-05-01T00:00:00Z' },
];

// ---- Products ----
export const mockProducts: Product[] = [
  { id: 'p1', name: 'Ấm trà 200ml', description: 'Ấm trà gốm thủ công, dung tích 200ml', reference_price: 350000, reference_image_url: null, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'p2', name: 'Bát ăn cơm', description: 'Bát ăn cơm gốm men lam', reference_price: 85000, reference_image_url: null, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'p3', name: 'Bình hoa lớn', description: 'Bình hoa trang trí cao 40cm', reference_price: 750000, reference_image_url: null, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'p4', name: 'Đĩa trang trí', description: 'Đĩa gốm men rạn trang trí', reference_price: 200000, reference_image_url: null, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'p5', name: 'Ly uống trà', description: 'Ly uống trà gốm thủ công set 6', reference_price: 180000, reference_image_url: null, is_active: true, created_at: '2026-01-01T00:00:00Z' },
];

// ---- Order Update Images ----
const mockImages: OrderUpdateImage[] = [
  { id: 'img1', update_id: 'u1', image_url: '/placeholder-pottery-1.jpg', storage_path: 'order-updates/o1/u1/img1.jpg', display_order: 1, created_at: '2026-05-10T08:30:00Z' },
  { id: 'img2', update_id: 'u1', image_url: '/placeholder-pottery-2.jpg', storage_path: 'order-updates/o1/u1/img2.jpg', display_order: 2, created_at: '2026-05-10T08:30:00Z' },
  { id: 'img3', update_id: 'u2', image_url: '/placeholder-pottery-3.jpg', storage_path: 'order-updates/o1/u2/img3.jpg', display_order: 1, created_at: '2026-05-12T10:15:00Z' },
  { id: 'img4', update_id: 'u3', image_url: '/placeholder-pottery-4.jpg', storage_path: 'order-updates/o1/u3/img4.jpg', display_order: 1, created_at: '2026-05-15T14:00:00Z' },
  { id: 'img5', update_id: 'u4', image_url: '/placeholder-pottery-5.jpg', storage_path: 'order-updates/o2/u4/img5.jpg', display_order: 1, created_at: '2026-05-18T09:00:00Z' },
];

// ---- Order Updates ----
export const mockOrderUpdates: OrderUpdate[] = [
  { id: 'u1', order_id: 'o1', milestone_name: 'Nhào đất', note: 'Đất đã nhào xong, để ủ qua đêm', status_after: 'in_progress', created_by_type: 'viewer', created_by_admin_id: null, created_by_name: 'Linh', created_at: '2026-05-10T08:30:00Z', images: mockImages.filter(i => i.update_id === 'u1') },
  { id: 'u2', order_id: 'o1', milestone_name: 'Tạo hình', note: 'Đã tạo hình trên bàn xoay, đang chỉnh chi tiết', status_after: 'in_progress', created_by_type: 'viewer', created_by_admin_id: null, created_by_name: 'Linh', created_at: '2026-05-12T10:15:00Z', images: mockImages.filter(i => i.update_id === 'u2') },
  { id: 'u3', order_id: 'o1', milestone_name: 'Phơi khô', note: 'Sản phẩm đã phơi khô 3 ngày', status_after: 'in_progress', created_by_type: 'viewer', created_by_admin_id: null, created_by_name: 'Tú', created_at: '2026-05-15T14:00:00Z', images: mockImages.filter(i => i.update_id === 'u3') },
  { id: 'u4', order_id: 'o2', milestone_name: 'Nhào đất', note: 'Bắt đầu làm set bát', status_after: 'in_progress', created_by_type: 'viewer', created_by_admin_id: null, created_by_name: 'Hoa', created_at: '2026-05-18T09:00:00Z', images: mockImages.filter(i => i.update_id === 'u4') },
  { id: 'u5', order_id: 'o3', milestone_name: 'Tạo hình', note: 'Bình hoa đã tạo hình xong', status_after: 'in_progress', created_by_type: 'admin', created_by_admin_id: 'admin1', created_by_name: 'Admin', created_at: '2026-05-08T16:00:00Z', images: [] },
  { id: 'u6', order_id: 'o3', milestone_name: 'Phơi khô', note: null, status_after: 'in_progress', created_by_type: 'viewer', created_by_admin_id: null, created_by_name: 'An', created_at: '2026-05-11T09:00:00Z', images: [] },
  { id: 'u7', order_id: 'o3', milestone_name: 'Nung lần 1', note: 'Nung ở 1000°C trong 8 tiếng', status_after: 'in_progress', created_by_type: 'viewer', created_by_admin_id: null, created_by_name: 'Linh', created_at: '2026-05-14T06:00:00Z', images: [] },
  { id: 'u8', order_id: 'o3', milestone_name: 'Tráng men', note: 'Men lam xanh theo yêu cầu', status_after: 'in_progress', created_by_type: 'viewer', created_by_admin_id: null, created_by_name: 'An', created_at: '2026-05-16T10:00:00Z', images: [] },
  { id: 'u9', order_id: 'o3', milestone_name: 'Nung lần 2', note: 'Nung men ở 1200°C', status_after: 'in_progress', created_by_type: 'viewer', created_by_admin_id: null, created_by_name: 'Linh', created_at: '2026-05-18T06:00:00Z', images: [] },
  { id: 'u10', order_id: 'o3', milestone_name: 'Hoàn thiện', note: 'Sản phẩm đẹp, đã đóng gói', status_after: 'completed', created_by_type: 'admin', created_by_admin_id: 'admin1', created_by_name: 'Admin', created_at: '2026-05-20T14:00:00Z', images: [] },
];

// ---- Orders ----
export const mockOrders: Order[] = [
  { id: 'o1', order_code: 'DH-20260508-001', customer_id: 'c1', product_name: 'Ấm trà 200ml', product_id: 'p1', quantity: 2, custom_requirements: 'Khách muốn quai cao hơn bình thường, men nâu đất', reference_images: [], status: 'in_progress', start_date: '2026-05-08', due_date: '2026-05-25', price: 700000, deposit: 350000, internal_note: 'Khách quen, ưu tiên làm trước', created_at: '2026-05-08T00:00:00Z', updated_at: '2026-05-15T14:00:00Z' },
  { id: 'o2', order_code: 'DH-20260510-002', customer_id: 'c2', product_name: 'Bát ăn cơm set 10', product_id: 'p2', quantity: 10, custom_requirements: null, reference_images: [], status: 'in_progress', start_date: '2026-05-10', due_date: '2026-05-28', price: 850000, deposit: 400000, internal_note: null, created_at: '2026-05-10T00:00:00Z', updated_at: '2026-05-18T09:00:00Z' },
  { id: 'o3', order_code: 'DH-20260505-003', customer_id: 'c3', product_name: 'Bình hoa lớn', product_id: 'p3', quantity: 1, custom_requirements: 'Men lam xanh, cao 45cm', reference_images: [], status: 'completed', start_date: '2026-05-05', due_date: '2026-05-20', price: 750000, deposit: 750000, internal_note: null, created_at: '2026-05-05T00:00:00Z', updated_at: '2026-05-20T14:00:00Z' },
  { id: 'o4', order_code: 'DH-20260515-004', customer_id: 'c4', product_name: 'Đĩa trang trí', product_id: 'p4', quantity: 5, custom_requirements: 'Men rạn, đường kính 25cm', reference_images: [], status: 'not_started', start_date: null, due_date: '2026-06-01', price: 1000000, deposit: 500000, internal_note: 'Chờ đất về', created_at: '2026-05-15T00:00:00Z', updated_at: '2026-05-15T00:00:00Z' },
  { id: 'o5', order_code: 'DH-20260518-005', customer_id: 'c5', product_name: 'Ly uống trà set 6', product_id: 'p5', quantity: 20, custom_requirements: 'Logo công ty khắc chìm mặt ngoài', reference_images: [], status: 'not_started', start_date: null, due_date: '2026-06-10', price: 3600000, deposit: 1800000, internal_note: 'Đơn sỉ lớn', created_at: '2026-05-18T00:00:00Z', updated_at: '2026-05-18T00:00:00Z' },
  { id: 'o6', order_code: 'DH-20260501-006', customer_id: 'c1', product_name: 'Bình hoa nhỏ', product_id: null, quantity: 3, custom_requirements: 'Men trắng sữa', reference_images: [], status: 'in_progress', start_date: '2026-05-01', due_date: '2026-05-18', price: 600000, deposit: 300000, internal_note: null, created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-16T00:00:00Z' },
  { id: 'o7', order_code: 'DH-20260520-007', customer_id: 'c2', product_name: 'Ấm trà set lớn', product_id: 'p1', quantity: 1, custom_requirements: 'Ấm + 6 ly + khay gỗ', reference_images: [], status: 'not_started', start_date: null, due_date: '2026-06-15', price: 1200000, deposit: 600000, internal_note: null, created_at: '2026-05-20T00:00:00Z', updated_at: '2026-05-20T00:00:00Z' },
  { id: 'o8', order_code: 'DH-20260503-008', customer_id: 'c3', product_name: 'Bát decor', product_id: null, quantity: 8, custom_requirements: 'Vẽ tay hoa sen', reference_images: [], status: 'completed', start_date: '2026-05-03', due_date: '2026-05-15', price: 960000, deposit: 960000, internal_note: null, created_at: '2026-05-03T00:00:00Z', updated_at: '2026-05-14T00:00:00Z' },
];

// ---- Orders with Customer (joined) ----
export function getOrdersWithCustomer(role: 'admin' | 'viewer'): OrderWithCustomer[] {
  return mockOrders.map(order => {
    const customer = mockCustomers.find(c => c.id === order.customer_id)!;
    const updates = mockOrderUpdates.filter(u => u.order_id === order.id);
    const staffIds = ['s1', 's2']; // simplified mock assignments
    const staff = mockStaffNames.filter(s => staffIds.includes(s.id));

    return {
      ...order,
      customer_name: customer.name,
      customer_phone: role === 'admin' ? customer.phone : maskPhone(customer.phone),
      customer_email: role === 'admin' ? customer.email : undefined,
      customer_address: role === 'admin' ? customer.address : undefined,
      assigned_staff: staff,
      updates_count: updates.length,
      latest_update: updates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0],
    };
  });
}

function maskPhone(phone: string | null): string | null {
  if (!phone || phone.length < 4) return null;
  return phone.substring(0, 4) + ' *** ***';
}

// ---- Sync Field Config ----
export const mockSyncFieldConfig: SyncFieldConfig[] = [
  { id: 'sf1', data_group: 'orders', field_name: 'order_code', display_name: 'Mã đơn', sheet_column: 'A', enabled: true, sync_to_sheet: true, sync_from_sheet: false, is_readonly: true, display_order: 1, updated_at: '2026-01-01T00:00:00Z' },
  { id: 'sf2', data_group: 'orders', field_name: 'customer_name', display_name: 'Tên khách hàng', sheet_column: 'B', enabled: true, sync_to_sheet: true, sync_from_sheet: true, is_readonly: false, display_order: 2, updated_at: '2026-01-01T00:00:00Z' },
  { id: 'sf3', data_group: 'orders', field_name: 'customer_phone', display_name: 'SĐT khách', sheet_column: 'C', enabled: true, sync_to_sheet: true, sync_from_sheet: true, is_readonly: false, display_order: 3, updated_at: '2026-01-01T00:00:00Z' },
  { id: 'sf4', data_group: 'orders', field_name: 'product_name', display_name: 'Sản phẩm', sheet_column: 'D', enabled: true, sync_to_sheet: true, sync_from_sheet: true, is_readonly: false, display_order: 4, updated_at: '2026-01-01T00:00:00Z' },
  { id: 'sf5', data_group: 'orders', field_name: 'quantity', display_name: 'Số lượng', sheet_column: 'E', enabled: true, sync_to_sheet: true, sync_from_sheet: true, is_readonly: false, display_order: 5, updated_at: '2026-01-01T00:00:00Z' },
  { id: 'sf6', data_group: 'orders', field_name: 'start_date', display_name: 'Ngày đặt', sheet_column: 'F', enabled: true, sync_to_sheet: true, sync_from_sheet: true, is_readonly: false, display_order: 6, updated_at: '2026-01-01T00:00:00Z' },
  { id: 'sf7', data_group: 'orders', field_name: 'due_date', display_name: 'Hạn giao', sheet_column: 'G', enabled: true, sync_to_sheet: true, sync_from_sheet: true, is_readonly: false, display_order: 7, updated_at: '2026-01-01T00:00:00Z' },
  { id: 'sf8', data_group: 'orders', field_name: 'status', display_name: 'Trạng thái', sheet_column: 'H', enabled: true, sync_to_sheet: true, sync_from_sheet: true, is_readonly: false, display_order: 8, updated_at: '2026-01-01T00:00:00Z' },
  { id: 'sf9', data_group: 'orders', field_name: 'staff_names', display_name: 'Nhân viên', sheet_column: 'I', enabled: true, sync_to_sheet: true, sync_from_sheet: true, is_readonly: false, display_order: 9, updated_at: '2026-01-01T00:00:00Z' },
  { id: 'sf10', data_group: 'orders', field_name: 'price', display_name: 'Giá', sheet_column: 'J', enabled: false, sync_to_sheet: true, sync_from_sheet: false, is_readonly: false, display_order: 10, updated_at: '2026-01-01T00:00:00Z' },
  { id: 'sf11', data_group: 'orders', field_name: 'deposit', display_name: 'Đã cọc', sheet_column: 'K', enabled: false, sync_to_sheet: true, sync_from_sheet: false, is_readonly: false, display_order: 11, updated_at: '2026-01-01T00:00:00Z' },
  { id: 'sf12', data_group: 'orders', field_name: 'custom_requirements', display_name: 'Yêu cầu riêng', sheet_column: 'L', enabled: true, sync_to_sheet: true, sync_from_sheet: true, is_readonly: false, display_order: 12, updated_at: '2026-01-01T00:00:00Z' },
  { id: 'sf13', data_group: 'orders', field_name: 'internal_note', display_name: 'Ghi chú nội bộ', sheet_column: 'M', enabled: false, sync_to_sheet: true, sync_from_sheet: false, is_readonly: false, display_order: 13, updated_at: '2026-01-01T00:00:00Z' },
  // Updates (only App → Sheet)
  { id: 'sf14', data_group: 'updates', field_name: 'milestone_name', display_name: 'Tên mốc', sheet_column: 'A', enabled: true, sync_to_sheet: true, sync_from_sheet: false, is_readonly: true, display_order: 1, updated_at: '2026-01-01T00:00:00Z' },
  { id: 'sf15', data_group: 'updates', field_name: 'note', display_name: 'Ghi chú mốc', sheet_column: 'B', enabled: true, sync_to_sheet: true, sync_from_sheet: false, is_readonly: true, display_order: 2, updated_at: '2026-01-01T00:00:00Z' },
  { id: 'sf16', data_group: 'updates', field_name: 'created_by_name', display_name: 'Người cập nhật', sheet_column: 'C', enabled: true, sync_to_sheet: true, sync_from_sheet: false, is_readonly: true, display_order: 3, updated_at: '2026-01-01T00:00:00Z' },
  { id: 'sf17', data_group: 'updates', field_name: 'created_at', display_name: 'Thời gian', sheet_column: 'D', enabled: true, sync_to_sheet: true, sync_from_sheet: false, is_readonly: true, display_order: 4, updated_at: '2026-01-01T00:00:00Z' },
  { id: 'sf18', data_group: 'updates', field_name: 'images_count', display_name: 'Số ảnh', sheet_column: 'E', enabled: true, sync_to_sheet: true, sync_from_sheet: false, is_readonly: true, display_order: 5, updated_at: '2026-01-01T00:00:00Z' },
  // Customers
  { id: 'sf19', data_group: 'customers', field_name: 'name', display_name: 'Tên', sheet_column: 'A', enabled: true, sync_to_sheet: true, sync_from_sheet: true, is_readonly: false, display_order: 1, updated_at: '2026-01-01T00:00:00Z' },
  { id: 'sf20', data_group: 'customers', field_name: 'phone', display_name: 'SĐT', sheet_column: 'B', enabled: true, sync_to_sheet: true, sync_from_sheet: true, is_readonly: false, display_order: 2, updated_at: '2026-01-01T00:00:00Z' },
  { id: 'sf21', data_group: 'customers', field_name: 'email', display_name: 'Email', sheet_column: 'C', enabled: false, sync_to_sheet: true, sync_from_sheet: true, is_readonly: false, display_order: 3, updated_at: '2026-01-01T00:00:00Z' },
  { id: 'sf22', data_group: 'customers', field_name: 'address', display_name: 'Địa chỉ', sheet_column: 'D', enabled: false, sync_to_sheet: true, sync_from_sheet: true, is_readonly: false, display_order: 4, updated_at: '2026-01-01T00:00:00Z' },
];

export const mockSyncLogs: SyncLog[] = [
  { id: 'sl1', synced_by: 'admin1', direction: 'app_to_sheet', sheet_id: 'sheet123', rows_added: 0, rows_updated: 25, rows_skipped: 0, rows_conflict: 0, date_range_start: '2026-05-01', date_range_end: '2026-05-21', field_config_snapshot: [], status: 'success', error_message: null, created_at: '2026-05-21T07:30:00Z' },
  { id: 'sl2', synced_by: 'admin1', direction: 'sheet_to_app', sheet_id: 'sheet123', rows_added: 3, rows_updated: 2, rows_skipped: 1, rows_conflict: 0, date_range_start: null, date_range_end: null, field_config_snapshot: [], status: 'success', error_message: null, created_at: '2026-05-20T09:15:00Z' },
  { id: 'sl3', synced_by: 'admin1', direction: 'app_to_sheet', sheet_id: 'sheet123', rows_added: 0, rows_updated: 0, rows_skipped: 0, rows_conflict: 0, date_range_start: '2026-05-01', date_range_end: '2026-05-19', field_config_snapshot: [], status: 'failed', error_message: 'Không thể kết nối đến Google Sheet. Kiểm tra lại quyền truy cập.', created_at: '2026-05-19T16:00:00Z' },
];
