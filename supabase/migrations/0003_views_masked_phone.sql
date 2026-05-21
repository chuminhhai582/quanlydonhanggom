-- =============================================
-- GỐM TRACKER — Migration 0003: Views Masked Phone
-- =============================================

-- View cho Viewer: SĐT bị che
CREATE OR REPLACE VIEW customers_public AS
SELECT
  id,
  name,
  CASE
    WHEN phone IS NOT NULL AND length(phone) >= 4
    THEN substring(phone from 1 for 4) || ' *** ***'
    ELSE NULL
  END as phone,
  created_at
FROM customers;

-- View cho Admin: SĐT đầy đủ
CREATE OR REPLACE VIEW customers_admin AS
SELECT * FROM customers;

-- View đơn hàng + khách (cho Viewer)
CREATE OR REPLACE VIEW orders_with_customer_public AS
SELECT
  o.*,
  cp.name as customer_name,
  cp.phone as customer_phone
FROM orders o
JOIN customers_public cp ON o.customer_id = cp.id;

-- View đơn hàng + khách (cho Admin)
CREATE OR REPLACE VIEW orders_with_customer_admin AS
SELECT
  o.*,
  ca.name as customer_name,
  ca.phone as customer_phone,
  ca.email as customer_email,
  ca.address as customer_address
FROM orders o
JOIN customers_admin ca ON o.customer_id = ca.id;

-- GRANT SELECT cho views
GRANT SELECT ON customers_public TO authenticated, anon;
GRANT SELECT ON customers_admin TO authenticated;
GRANT SELECT ON orders_with_customer_public TO authenticated, anon;
GRANT SELECT ON orders_with_customer_admin TO authenticated;
