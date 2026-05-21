-- =============================================
-- GỐM TRACKER — Migration 0001: Initial Schema
-- =============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom ENUM types
CREATE TYPE order_status AS ENUM ('not_started', 'crafting', 'drying', 'firing', 'broken', 'redoing', 'refiring');
CREATE TYPE update_creator_type AS ENUM ('admin', 'viewer');
CREATE TYPE export_status AS ENUM ('success', 'failed', 'partial');
CREATE TYPE sync_direction AS ENUM ('app_to_sheet', 'sheet_to_app');

-- =============================================
-- Table: customers
-- =============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Table: products (catalog mẫu)
-- =============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  reference_price NUMERIC,
  reference_image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Table: orders (bảng trung tâm)
-- =============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_code TEXT UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1,
  custom_requirements TEXT,
  reference_images TEXT[] DEFAULT '{}',
  status order_status DEFAULT 'not_started',
  start_date DATE,
  due_date DATE NOT NULL,
  price NUMERIC,
  deposit NUMERIC,
  internal_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate order_code: DH-YYYYMMDD-XXX
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS TRIGGER AS $$
DECLARE
  date_str TEXT;
  seq_num INTEGER;
  new_code TEXT;
BEGIN
  date_str := TO_CHAR(NOW(), 'YYYYMMDD');
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(order_code, '-', 3) AS INTEGER)
  ), 0) + 1
  INTO seq_num
  FROM orders
  WHERE order_code LIKE 'DH-' || date_str || '-%';
  
  new_code := 'DH-' || date_str || '-' || LPAD(seq_num::TEXT, 3, '0');
  NEW.order_code := new_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_order_code
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_code IS NULL)
  EXECUTE FUNCTION generate_order_code();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Table: staff_names (tên nhân viên, không phải account)
-- =============================================
CREATE TABLE staff_names (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  avatar_color TEXT DEFAULT '#94A3B8',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Table: order_assignments (giao việc)
-- =============================================
CREATE TABLE order_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  staff_name_id UUID NOT NULL REFERENCES staff_names(id) ON DELETE CASCADE,
  UNIQUE(order_id, staff_name_id)
);

-- =============================================
-- Table: order_updates (mốc tiến độ)
-- =============================================
CREATE TABLE order_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  milestone_name TEXT NOT NULL,
  note TEXT,
  status_after order_status NOT NULL DEFAULT 'crafting',
  created_by_type update_creator_type NOT NULL,
  created_by_admin_id UUID REFERENCES auth.users(id),
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-set order status to 'in_progress' on first update
CREATE OR REPLACE FUNCTION auto_set_order_in_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders
  SET status = NEW.status_after,
      updated_at = NOW()
  WHERE id = NEW.order_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_order_status
  AFTER INSERT ON order_updates
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_order_in_progress();

-- =============================================
-- Table: order_update_images (ảnh đính kèm)
-- =============================================
CREATE TABLE order_update_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  update_id UUID NOT NULL REFERENCES order_updates(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Table: app_settings (key-value cấu hình)
-- =============================================
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Table: pin_attempts (chống brute-force)
-- =============================================
CREATE TABLE pin_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address TEXT NOT NULL,
  success BOOLEAN DEFAULT FALSE,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Table: sync_field_config (cấu hình đồng bộ Sheet)
-- =============================================
CREATE TABLE sync_field_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_group TEXT NOT NULL CHECK (data_group IN ('orders', 'customers', 'updates')),
  field_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  sheet_column TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  sync_to_sheet BOOLEAN DEFAULT TRUE,
  sync_from_sheet BOOLEAN DEFAULT FALSE,
  is_readonly BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Table: sync_logs (lịch sử đồng bộ)
-- =============================================
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  synced_by UUID REFERENCES auth.users(id),
  direction sync_direction NOT NULL,
  sheet_id TEXT,
  rows_added INTEGER DEFAULT 0,
  rows_updated INTEGER DEFAULT 0,
  rows_skipped INTEGER DEFAULT 0,
  rows_conflict INTEGER DEFAULT 0,
  date_range_start DATE,
  date_range_end DATE,
  field_config_snapshot JSONB DEFAULT '[]',
  status export_status NOT NULL DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_due_date ON orders(due_date);
CREATE INDEX idx_order_updates_order ON order_updates(order_id);
CREATE INDEX idx_order_update_images_update ON order_update_images(update_id);
CREATE INDEX idx_order_assignments_order ON order_assignments(order_id);
CREATE INDEX idx_pin_attempts_ip ON pin_attempts(ip_address, attempted_at);
