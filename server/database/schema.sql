-- PinkPitch – Database Schema (PostgreSQL 12+)
-- รันซ้ำได้อย่างปลอดภัย (CREATE ... IF NOT EXISTS) และไม่ลบข้อมูลเดิม
-- รัน:  npm run db:schema   (หรือ psql -d pinkpitch -f database/schema.sql)

-- อัปเดต updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------
-- users: บัญชีสมาชิก
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  full_name     VARCHAR(120) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url    TEXT         DEFAULT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
-- รองรับฐานข้อมูลเดิมที่สร้างไว้ก่อนมีฟิลด์ avatar_url
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;
-- Email ต้องไม่ซ้ำ (ไม่สนตัวพิมพ์เล็ก/ใหญ่) ป้องกันที่ระดับฐานข้อมูล
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_key ON users (LOWER(email));

-- ---------------------------------------------------------------
-- products: สินค้าเสื้อฟุตบอล
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200)  NOT NULL,
  team_name   VARCHAR(120)  NOT NULL,
  season      VARCHAR(20)   NOT NULL,
  category    VARCHAR(80)   NOT NULL,
  description TEXT          NOT NULL DEFAULT '',
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  sizes       JSONB         NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(sizes) = 'array'),
  color       VARCHAR(80)   NOT NULL DEFAULT '',
  stock       INTEGER       NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url   TEXT,
  is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
  -- ฟิลด์เสริมที่ Frontend ใช้: สินค้าแนะนำ และสีสำหรับสร้างภาพเสื้อสำรองเมื่อไม่มีรูปจริง
  featured    BOOLEAN       NOT NULL DEFAULT FALSE,
  kit         JSONB,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT products_name_season_key UNIQUE (name, season)
);
CREATE INDEX IF NOT EXISTS products_category_idx ON products (category);
CREATE INDEX IF NOT EXISTS products_team_idx ON products (team_name);
CREATE INDEX IF NOT EXISTS products_active_idx ON products (is_active);

-- ---------------------------------------------------------------
-- transactions: รายการซื้อแต่ละครั้ง
-- status: pending = สร้างรายการแล้วแต่ยังไม่มีการยืนยันการชำระเงิน (ระบบนี้ไม่มี Payment Gateway)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER       NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
  status       VARCHAR(20)   NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'paid', 'shipped', 'completed', 'cancelled')),
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS transactions_user_idx ON transactions (user_id, created_at DESC);

-- ---------------------------------------------------------------
-- transaction_items: รายละเอียดสินค้าในแต่ละรายการซื้อ
-- เก็บชื่อ ราคา และข้อมูลแสดงผล ณ เวลาที่ซื้อ (snapshot) เพื่อให้ประวัติไม่เปลี่ยนเมื่อสินค้าถูกแก้ไข
-- product_id เป็น ON DELETE SET NULL เพื่อไม่ให้ประวัติการซื้อเสียหายหากสินค้าถูกลบ
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transaction_items (
  id             SERIAL PRIMARY KEY,
  transaction_id INTEGER       NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id     INTEGER       REFERENCES products(id) ON DELETE SET NULL,
  product_name   VARCHAR(200)  NOT NULL,
  team_name      VARCHAR(120)  NOT NULL DEFAULT '',
  season         VARCHAR(20)   NOT NULL DEFAULT '',
  image_url      TEXT,
  kit            JSONB,
  size           VARCHAR(10)   NOT NULL,
  quantity       INTEGER       NOT NULL CHECK (quantity > 0),
  unit_price     NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  subtotal       NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0)
);
CREATE INDEX IF NOT EXISTS transaction_items_txn_idx ON transaction_items (transaction_id);
CREATE INDEX IF NOT EXISTS transaction_items_product_idx ON transaction_items (product_id);

-- Triggers สำหรับ updated_at
DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS products_set_updated_at ON products;
CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS transactions_set_updated_at ON transactions;
CREATE TRIGGER transactions_set_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
