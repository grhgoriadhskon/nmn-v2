-- NMN v2 database schema
-- All tables are created here once. Changes go in migrations/.

CREATE TABLE IF NOT EXISTS users (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  email             TEXT    NOT NULL UNIQUE,
  password_hash     TEXT    NOT NULL,
  name              TEXT    NOT NULL,
  phone             TEXT,
  role              TEXT    NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'pro', 'admin')),
  email_verified    INTEGER NOT NULL DEFAULT 0,
  verify_token      TEXT,
  reset_token       TEXT,
  reset_token_exp   TEXT,
  created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS professionals (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio          TEXT,
  avatar_url   TEXT,
  address      TEXT,
  city         TEXT,
  lat          REAL,
  lng          REAL,
  is_active    INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS working_hours (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  pro_id     INTEGER NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  day        INTEGER NOT NULL CHECK (day BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  start_time TEXT    NOT NULL, -- HH:MM
  end_time   TEXT    NOT NULL, -- HH:MM
  UNIQUE (pro_id, day)
);

CREATE TABLE IF NOT EXISTS services (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  pro_id       INTEGER NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  name         TEXT    NOT NULL,
  description  TEXT,
  duration_min INTEGER NOT NULL, -- minutes
  price        REAL    NOT NULL, -- euros
  is_active    INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bookings (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  reference    TEXT    NOT NULL UNIQUE,
  customer_id  INTEGER NOT NULL REFERENCES users(id),
  pro_id       INTEGER NOT NULL REFERENCES professionals(id),
  service_id   INTEGER NOT NULL REFERENCES services(id),
  start_at     TEXT    NOT NULL, -- ISO datetime UTC
  end_at       TEXT    NOT NULL, -- ISO datetime UTC (start + duration)
  status       TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  notes        TEXT,
  cancelled_by TEXT,
  cancel_reason TEXT,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reviews (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id  INTEGER NOT NULL UNIQUE REFERENCES bookings(id),
  customer_id INTEGER NOT NULL REFERENCES users(id),
  pro_id      INTEGER NOT NULL REFERENCES professionals(id),
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT    NOT NULL,
  title      TEXT    NOT NULL,
  body       TEXT    NOT NULL,
  data       TEXT,            -- JSON blob for extra context
  is_read    INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bookings_pro_start    ON bookings(pro_id, start_at);
CREATE INDEX IF NOT EXISTS idx_bookings_customer     ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user    ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_services_pro          ON services(pro_id);
