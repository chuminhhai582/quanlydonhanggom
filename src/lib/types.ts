// ============================================
// Gốm Tracker — Type Definitions
// ============================================

// --- Enums ---
export type OrderStatus = 'not_started' | 'crafting' | 'drying' | 'firing' | 'broken' | 'redoing' | 'refiring';
export type UpdateCreatorType = 'admin' | 'viewer';
export type ExportStatus = 'success' | 'failed' | 'partial';
export type SyncDirection = 'app_to_sheet' | 'sheet_to_app';
export type UserRole = 'admin' | 'viewer' | null;

// --- Database Models ---
export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  note: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  reference_price: number | null;
  reference_image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_code: string;
  customer_id: string;
  product_name: string;
  product_id: string | null;
  quantity: number;
  custom_requirements: string | null;
  reference_images: string[];
  status: OrderStatus;
  start_date: string | null;
  due_date: string;
  price: number | null;
  deposit: number | null;
  internal_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderWithCustomer extends Order {
  customer_name: string;
  customer_phone: string | null;
  customer_email?: string | null;
  customer_address?: string | null;
  assigned_staff: StaffName[];
  updates_count: number;
  latest_update?: OrderUpdate;
}

export interface StaffName {
  id: string;
  name: string;
  avatar_color: string;
  is_active: boolean;
  created_at: string;
}

export interface OrderAssignment {
  id: string;
  order_id: string;
  staff_name_id: string;
  staff_name?: StaffName;
}

export interface OrderUpdate {
  id: string;
  order_id: string;
  milestone_name: string;
  note: string | null;
  status_after: OrderStatus;
  created_by_type: UpdateCreatorType;
  created_by_admin_id: string | null;
  created_by_name: string | null;
  created_at: string;
  images: OrderUpdateImage[];
}

export interface OrderUpdateImage {
  id: string;
  update_id: string;
  image_url: string;
  storage_path: string;
  display_order: number;
  created_at: string;
}

export interface AppSetting {
  key: string;
  value: unknown;
  updated_by: string | null;
  updated_at: string;
}

export interface PinAttempt {
  id: string;
  ip_address: string;
  success: boolean;
  attempted_at: string;
}

export interface SyncFieldConfig {
  id: string;
  data_group: 'orders' | 'customers' | 'updates';
  field_name: string;
  display_name: string;
  sheet_column: string;
  enabled: boolean;
  sync_to_sheet: boolean;
  sync_from_sheet: boolean;
  is_readonly: boolean;
  display_order: number;
  updated_at: string;
}

export interface SyncLog {
  id: string;
  synced_by: string;
  direction: SyncDirection;
  sheet_id: string;
  rows_added: number;
  rows_updated: number;
  rows_skipped: number;
  rows_conflict: number;
  date_range_start: string | null;
  date_range_end: string | null;
  field_config_snapshot: SyncFieldConfig[];
  status: ExportStatus;
  error_message: string | null;
  created_at: string;
}

// --- UI Types ---
export interface StatusTabItem {
  key: OrderStatus | 'all';
  label: string;
  icon: string;
  color: string;
  count: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: OrderStatus;
  isOverdue: boolean;
  order: OrderWithCustomer;
}

export interface SyncPreviewItem {
  type: 'add' | 'update' | 'conflict';
  order_code: string;
  customer_name: string;
  field_name?: string;
  sheet_value?: string;
  app_value?: string;
  resolution?: 'keep_sheet' | 'keep_app' | 'skip';
}
