-- =============================================
-- GỐM TRACKER — Migration 0002: RLS Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_update_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pin_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_field_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
  SELECT auth.role() = 'authenticated'
    AND auth.email() IN (
      SELECT jsonb_array_elements_text(value)
      FROM app_settings
      WHERE key = 'allowed_admin_emails'
    );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_viewer() RETURNS boolean AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb->>'viewer')::boolean,
    false
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================
-- customers: Admin full access, Viewer no direct access
-- =============================================
CREATE POLICY "admin_all_customers" ON customers
  FOR ALL USING (is_admin());

-- =============================================
-- products: Admin full, Viewer/authenticated SELECT
-- =============================================
CREATE POLICY "admin_all_products" ON products
  FOR ALL USING (is_admin());

CREATE POLICY "viewer_select_products" ON products
  FOR SELECT USING (is_viewer() OR auth.role() = 'authenticated');

-- =============================================
-- orders: Admin full, Viewer SELECT
-- =============================================
CREATE POLICY "admin_all_orders" ON orders
  FOR ALL USING (is_admin());

CREATE POLICY "viewer_select_orders" ON orders
  FOR SELECT USING (is_viewer());

-- =============================================
-- staff_names: Admin full, Viewer SELECT
-- =============================================
CREATE POLICY "admin_all_staff" ON staff_names
  FOR ALL USING (is_admin());

CREATE POLICY "viewer_select_staff" ON staff_names
  FOR SELECT USING (is_viewer());

-- =============================================
-- order_assignments: Admin full, Viewer SELECT
-- =============================================
CREATE POLICY "admin_all_assignments" ON order_assignments
  FOR ALL USING (is_admin());

CREATE POLICY "viewer_select_assignments" ON order_assignments
  FOR SELECT USING (is_viewer());

-- =============================================
-- order_updates: Admin full, Viewer SELECT + INSERT
-- =============================================
CREATE POLICY "admin_all_updates" ON order_updates
  FOR ALL USING (is_admin());

CREATE POLICY "viewer_select_updates" ON order_updates
  FOR SELECT USING (is_viewer());

CREATE POLICY "viewer_insert_updates" ON order_updates
  FOR INSERT WITH CHECK (is_viewer());

-- =============================================
-- order_update_images: Admin full, Viewer SELECT + INSERT
-- =============================================
CREATE POLICY "admin_all_images" ON order_update_images
  FOR ALL USING (is_admin());

CREATE POLICY "viewer_select_images" ON order_update_images
  FOR SELECT USING (is_viewer());

CREATE POLICY "viewer_insert_images" ON order_update_images
  FOR INSERT WITH CHECK (is_viewer());

-- =============================================
-- app_settings: Admin only
-- =============================================
CREATE POLICY "admin_all_settings" ON app_settings
  FOR ALL USING (is_admin());

-- =============================================
-- pin_attempts: INSERT via API, SELECT for admin
-- =============================================
CREATE POLICY "anyone_insert_attempts" ON pin_attempts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "admin_select_attempts" ON pin_attempts
  FOR SELECT USING (is_admin());

-- =============================================
-- sync_field_config: Admin only
-- =============================================
CREATE POLICY "admin_all_sync_config" ON sync_field_config
  FOR ALL USING (is_admin());

-- =============================================
-- sync_logs: Admin only
-- =============================================
CREATE POLICY "admin_all_sync_logs" ON sync_logs
  FOR ALL USING (is_admin());
