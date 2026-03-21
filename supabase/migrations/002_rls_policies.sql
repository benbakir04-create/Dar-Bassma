-- ============================================================
-- Migration 002: Row Level Security Policies
-- ============================================================

-- تفعيل RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users  ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- ---- دالة مساعدة: الحصول على دور المستخدم الحالي ----
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_linked_id()
RETURNS UUID AS $$
  SELECT linked_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ---- سياسات جدول orders ----

-- المدرسة ترى طلباتها فقط
CREATE POLICY "school_select_own_orders" ON orders
  FOR SELECT USING (
    get_user_role() = 'school' AND school_id = get_user_linked_id()
  );

-- الإدارة ترى كل الطلبات
CREATE POLICY "admin_all_orders" ON orders
  FOR ALL USING (get_user_role() = 'admin');

-- المخزن يرى الطلبات المعتمدة فما بعد
CREATE POLICY "warehouse_view_orders" ON orders
  FOR SELECT USING (
    get_user_role() = 'warehouse' AND
    status IN ('approved','preparing','ready','out_for_delivery','delivered')
  );

-- المندوب يرى شحناته فقط
CREATE POLICY "driver_own_shipments" ON orders
  FOR SELECT USING (
    get_user_role() = 'delivery' AND driver_id = auth.uid()
  );

-- المدرسة تُنشئ طلبات
CREATE POLICY "school_insert_orders" ON orders
  FOR INSERT WITH CHECK (
    get_user_role() = 'school' AND school_id = get_user_linked_id()
  );

-- ---- سياسات جدول users ----

-- كل مستخدم يرى ملفه الشخصي فقط
CREATE POLICY "users_own_profile" ON users
  FOR SELECT USING (id = auth.uid());

-- الإدارة ترى كل المستخدمين
CREATE POLICY "admin_all_users" ON users
  FOR ALL USING (get_user_role() = 'admin');

-- ---- سياسات order_items ----

CREATE POLICY "admin_all_order_items" ON order_items
  FOR ALL USING (get_user_role() = 'admin');

CREATE POLICY "school_own_order_items" ON order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE school_id = get_user_linked_id()
    )
  );

-- ---- سياسات schools (الإدارة فقط تُعدِّل) ----

CREATE POLICY "admin_all_schools" ON schools
  FOR ALL USING (get_user_role() = 'admin');

-- المدرسة ترى بياناتها فقط
CREATE POLICY "school_own_data" ON schools
  FOR SELECT USING (id = get_user_linked_id());
