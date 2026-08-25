-- ============================================================
-- Migration 001: Initial Schema
-- Store Rating Application
-- ============================================================
-- Run with: psql -U <user> -d <db_name> -f 001_initial.sql
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── ENUM: User Roles ────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── Table: users ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  UNIQUE NOT NULL,
  password    VARCHAR(255)  NOT NULL,
  address     TEXT,
  role        user_role     NOT NULL DEFAULT 'NORMAL_USER',
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);

-- ── Table: stores ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stores (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  UNIQUE NOT NULL,
  address     TEXT          NOT NULL,
  owner_id    INTEGER       REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_name     ON stores(name);

-- ── Table: ratings ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ratings (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER       NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  store_id    INTEGER       NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  rating      SMALLINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- One rating per user per store
  CONSTRAINT uq_user_store_rating UNIQUE (user_id, store_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_store_id ON ratings(store_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id  ON ratings(user_id);

-- ── Trigger: auto-update updated_at ──────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_ratings_updated_at
    BEFORE UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Done ─────────────────────────────────────────────────────
-- To verify:
--   \dt
--   \d users
--   \d stores
--   \d ratings
