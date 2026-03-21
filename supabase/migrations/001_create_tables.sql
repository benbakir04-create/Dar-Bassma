-- ============================================================
-- Migration 001: إنشاء جميع الجداول
-- شغّل هذا في Supabase SQL Editor
-- ============================================================

-- ---- Settings ----
CREATE TABLE IF NOT EXISTS settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  description TEXT
);

-- ---- Subjects ----
CREATE TABLE IF NOT EXISTS subjects (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  name_en        TEXT,
  icon           TEXT,
  color_hex      TEXT DEFAULT '#EBF3FF',
  text_color_hex TEXT DEFAULT '#1A4A8A',
  sort_order     INT  DEFAULT 0,
  active         BOOLEAN DEFAULT TRUE
);

-- ---- Levels ----
CREATE TABLE IF NOT EXISTS levels (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  short_name   TEXT,
  grade_number INT,
  stage        TEXT,
  sort_order   INT DEFAULT 0,
  active       BOOLEAN DEFAULT TRUE
);

-- ---- Books ----
CREATE TABLE IF NOT EXISTS books (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title          TEXT NOT NULL,
  author         TEXT,
  subject_id     TEXT REFERENCES subjects(id),
  level_id       TEXT REFERENCES levels(id),
  isbn           TEXT,
  serial_no      TEXT UNIQUE,
  price          DECIMAL(10,2) NOT NULL DEFAULT 0,
  description    TEXT,
  cover_emoji    TEXT DEFAULT '📖',
  cover_color    TEXT DEFAULT '#EBF3FF',
  category       TEXT DEFAULT 'كتاب مقرر',
  edition        TEXT,
  publisher_year INT,
  active         BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Packages ----
CREATE TABLE IF NOT EXISTS packages (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  level_id     TEXT REFERENCES levels(id),
  description  TEXT,
  discount_pct DECIMAL(5,2) DEFAULT 0,
  cover_emoji  TEXT DEFAULT '🎒',
  active       BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Package Items ----
CREATE TABLE IF NOT EXISTS package_items (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  book_id    UUID REFERENCES books(id),
  quantity   INT NOT NULL DEFAULT 1
);

-- ---- Schools ----
CREATE TABLE IF NOT EXISTS schools (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT NOT NULL,
  stage           TEXT,
  city            TEXT,
  address         TEXT,
  contact_person  TEXT,
  phone           TEXT,
  email           TEXT,
  registration_no TEXT,
  credit_limit    DECIMAL(10,2) DEFAULT 0,
  balance_due     DECIMAL(10,2) DEFAULT 0,
  notes           TEXT,
  active          BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Users (Profile) ----
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('admin','school','warehouse','delivery')),
  linked_id   UUID,
  name        TEXT NOT NULL,
  phone       TEXT,
  active      BOOLEAN DEFAULT TRUE,
  approved    BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  last_login  TIMESTAMPTZ
);

-- ---- Order Status Enum ----
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending','approved','rejected',
    'preparing','ready',
    'out_for_delivery','delivered','cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---- Orders ----
CREATE TABLE IF NOT EXISTS orders (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id         UUID REFERENCES schools(id),
  created_by        UUID REFERENCES users(id),
  order_date        TIMESTAMPTZ DEFAULT NOW(),
  status            order_status DEFAULT 'pending',
  delivery_type     TEXT CHECK (delivery_type IN ('delivery','pickup')),
  driver_id         UUID REFERENCES users(id),
  warehouse_user_id UUID REFERENCES users(id),
  notes             TEXT,
  admin_notes       TEXT,
  subtotal          DECIMAL(10,2) DEFAULT 0,
  tax_amount        DECIMAL(10,2) DEFAULT 0,
  total_amount      DECIMAL(10,2) DEFAULT 0,
  proforma_url      TEXT,
  invoice_url       TEXT,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Order Items ----
CREATE TABLE IF NOT EXISTS order_items (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id     UUID REFERENCES orders(id) ON DELETE CASCADE,
  book_id      UUID REFERENCES books(id),
  quantity     INT NOT NULL,
  unit_price   DECIMAL(10,2) NOT NULL,
  discount_pct DECIMAL(5,2) DEFAULT 0,
  line_total   DECIMAL(10,2) NOT NULL
);

-- ---- Order Status Log ----
CREATE TABLE IF NOT EXISTS order_status_log (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id    UUID REFERENCES orders(id),
  from_status order_status,
  to_status   order_status NOT NULL,
  changed_by  UUID REFERENCES users(id),
  timestamp   TIMESTAMPTZ DEFAULT NOW(),
  note        TEXT
);

-- ---- Inventory ----
CREATE TABLE IF NOT EXISTS inventory (
  book_id              UUID PRIMARY KEY REFERENCES books(id),
  quantity_available   INT DEFAULT 0,
  quantity_reserved    INT DEFAULT 0,
  quantity_delivered   INT DEFAULT 0,
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Inventory Change Type Enum ----
DO $$ BEGIN
  CREATE TYPE inventory_change_type AS ENUM (
    'stock_in','reserve','unreserve','delivered','adjustment','damaged'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---- Inventory Log ----
CREATE TABLE IF NOT EXISTS inventory_log (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id         UUID REFERENCES books(id),
  change_type     inventory_change_type NOT NULL,
  quantity_change INT NOT NULL,
  order_id        UUID REFERENCES orders(id),
  performed_by    UUID REFERENCES users(id),
  timestamp       TIMESTAMPTZ DEFAULT NOW(),
  note            TEXT
);

-- ---- Trigger: تحديث updated_at تلقائياً ----
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
