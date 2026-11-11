-- Brutzel demo schema. Safe to re-run: every statement is idempotent.

CREATE TABLE IF NOT EXISTS menu_items (
  id           serial PRIMARY KEY,
  slug         text UNIQUE NOT NULL,
  category     text NOT NULL CHECK (category IN ('burger', 'chicken', 'sides', 'shakes', 'drinks')),
  name_de      text NOT NULL,
  name_en      text NOT NULL,
  desc_de      text NOT NULL DEFAULT '',
  desc_en      text NOT NULL DEFAULT '',
  price_cents  integer NOT NULL CHECK (price_cents >= 0),
  image        text,
  tag          text CHECK (tag IN ('new', 'hot', 'veggie')),
  available    boolean NOT NULL DEFAULT true,
  sort         integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS extras (
  id           serial PRIMARY KEY,
  slug         text UNIQUE NOT NULL,
  name_de      text NOT NULL,
  name_en      text NOT NULL,
  price_cents  integer NOT NULL CHECK (price_cents >= 0),
  available    boolean NOT NULL DEFAULT true,
  sort         integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id              serial PRIMARY KEY,
  code            text UNIQUE NOT NULL,
  mode            text NOT NULL CHECK (mode IN ('pickup', 'delivery')),
  customer_name   text NOT NULL,
  phone           text NOT NULL,
  address         text,
  postcode        text,
  note            text,
  status          text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'preparing', 'ready', 'out', 'done', 'cancelled')),
  subtotal_cents  integer NOT NULL,
  delivery_cents  integer NOT NULL DEFAULT 0,
  total_cents     integer NOT NULL,
  ip_hash         text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_created_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);
CREATE INDEX IF NOT EXISTS orders_ip_idx ON orders (ip_hash, created_at);

CREATE TABLE IF NOT EXISTS order_lines (
  id           serial PRIMARY KEY,
  order_id     integer NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  item_id      integer REFERENCES menu_items (id) ON DELETE SET NULL,
  name_de      text NOT NULL,
  name_en      text NOT NULL,
  qty          integer NOT NULL CHECK (qty BETWEEN 1 AND 20),
  unit_cents   integer NOT NULL,
  combo        boolean NOT NULL DEFAULT false,
  combo_drink  text,
  extras       jsonb NOT NULL DEFAULT '[]',
  line_cents   integer NOT NULL
);
CREATE INDEX IF NOT EXISTS order_lines_order_idx ON order_lines (order_id);

CREATE TABLE IF NOT EXISTS settings (
  key    text PRIMARY KEY,
  value  jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id       serial PRIMARY KEY,
  ip_hash  text NOT NULL,
  at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS login_attempts_idx ON login_attempts (ip_hash, at);
