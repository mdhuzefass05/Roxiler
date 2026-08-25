-- ================================================================
-- Migration 001: Initial Schema — Store Rating Application
-- ================================================================
-- Idempotent: safe to run multiple times (uses IF NOT EXISTS / OR REPLACE)
-- Run: npm run migrate
-- ================================================================

-- ── Extensions ───────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── ENUM: User Roles ─────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ================================================================
-- TABLE: users
-- ================================================================
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL          PRIMARY KEY,
  name          VARCHAR(100)    NOT NULL,
  email         VARCHAR(150)    NOT NULL,
  password_hash VARCHAR(255)    NOT NULL,
  address       TEXT,
  role          user_role       NOT NULL DEFAULT 'NORMAL_USER',
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT uq_users_email         UNIQUE (email),
  CONSTRAINT chk_users_name_length  CHECK (char_length(trim(name)) >= 2),
  CONSTRAINT chk_users_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

COMMENT ON TABLE  users                IS 'Application users — all roles';
COMMENT ON COLUMN users.password_hash  IS 'bcrypt hash of the user password';
COMMENT ON COLUMN users.role           IS 'SYSTEM_ADMIN | NORMAL_USER | STORE_OWNER';

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users (role);

-- ================================================================
-- TABLE: stores
-- ================================================================
CREATE TABLE IF NOT EXISTS stores (
  id          SERIAL        PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL,
  address     TEXT          NOT NULL,
  owner_id    INTEGER,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT uq_stores_email  UNIQUE (email),
  CONSTRAINT fk_stores_owner  FOREIGN KEY (owner_id)
    REFERENCES users (id)
    ON DELETE SET NULL       -- store persists even if owner is deleted
    ON UPDATE CASCADE,
  CONSTRAINT chk_stores_name_length CHECK (char_length(trim(name)) >= 2)
);

COMMENT ON TABLE  stores          IS 'Stores that can receive ratings';
COMMENT ON COLUMN stores.owner_id IS 'FK → users.id; NULL if owner not assigned';

CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores (owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_name     ON stores (name);
-- Partial index for text-pattern LIKE searches on address
CREATE INDEX IF NOT EXISTS idx_stores_address  ON stores USING gin (to_tsvector('english', address));

-- ================================================================
-- TABLE: ratings
-- ================================================================
CREATE TABLE IF NOT EXISTS ratings (
  id           SERIAL      PRIMARY KEY,
  user_id      INTEGER     NOT NULL,
  store_id     INTEGER     NOT NULL,
  rating_value SMALLINT    NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Referential integrity
  CONSTRAINT fk_ratings_user  FOREIGN KEY (user_id)
    REFERENCES users  (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ratings_store FOREIGN KEY (store_id)
    REFERENCES stores (id) ON DELETE CASCADE ON UPDATE CASCADE,

  -- One rating per user per store — enforced at DB level
  CONSTRAINT uq_user_store_rating UNIQUE (user_id, store_id),

  -- DB-level rating value validation
  CONSTRAINT chk_rating_value CHECK (rating_value BETWEEN 1 AND 5)
);

COMMENT ON TABLE  ratings              IS 'Ratings submitted by NORMAL_USER accounts';
COMMENT ON COLUMN ratings.rating_value IS '1 (worst) to 5 (best)';

-- Cover index for aggregate queries (AVG / COUNT GROUP BY store_id)
CREATE INDEX IF NOT EXISTS idx_ratings_store_id       ON ratings (store_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id        ON ratings (user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_store_rating   ON ratings (store_id, rating_value);

-- ================================================================
-- FUNCTION + TRIGGERS: auto-update updated_at
-- ================================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- users
DO $$ BEGIN
  CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- stores
DO $$ BEGIN
  CREATE TRIGGER trg_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ratings
DO $$ BEGIN
  CREATE TRIGGER trg_ratings_updated_at
    BEFORE UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ================================================================
-- FUNCTION + TRIGGER: Prevent STORE_OWNER from submitting ratings
-- ================================================================
-- Enforced at the database level — independent of application logic.
-- Even a direct psql INSERT is blocked.
-- ================================================================
CREATE OR REPLACE FUNCTION fn_prevent_store_owner_rating()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  v_role user_role;
BEGIN
  SELECT role INTO v_role FROM users WHERE id = NEW.user_id;

  IF v_role = 'STORE_OWNER' THEN
    RAISE EXCEPTION
      'STORE_OWNER accounts are not permitted to submit ratings.'
      USING ERRCODE = 'check_violation';
  END IF;

  IF v_role = 'SYSTEM_ADMIN' THEN
    RAISE EXCEPTION
      'SYSTEM_ADMIN accounts are not permitted to submit ratings.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER trg_ratings_role_guard
    BEFORE INSERT ON ratings
    FOR EACH ROW EXECUTE FUNCTION fn_prevent_store_owner_rating();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ================================================================
-- VIEW: store_ratings_summary
-- ================================================================
-- Efficient aggregate view — services query this instead of writing
-- inline JOINs + AVG for every store-listing endpoint.
-- ================================================================
CREATE OR REPLACE VIEW store_ratings_summary AS
SELECT
  s.id                                                            AS store_id,
  s.name                                                          AS store_name,
  s.email                                                         AS store_email,
  s.address                                                       AS store_address,
  s.owner_id,
  s.created_at,
  s.updated_at,
  u.name                                                          AS owner_name,
  u.email                                                         AS owner_email,
  COUNT(r.id)::INTEGER                                            AS total_ratings,
  COALESCE(ROUND(AVG(r.rating_value)::NUMERIC, 2), 0.00)         AS average_rating
FROM stores s
LEFT JOIN ratings r ON r.store_id = s.id
LEFT JOIN users   u ON u.id       = s.owner_id
GROUP BY
  s.id, s.name, s.email, s.address, s.owner_id,
  s.created_at, s.updated_at,
  u.name, u.email;

COMMENT ON VIEW store_ratings_summary IS
  'Aggregate view: store info + owner info + average_rating + total_ratings';

-- ================================================================
-- Done.
-- Verify with:
--   \dt
--   \d users
--   \d stores
--   \d ratings
--   SELECT * FROM store_ratings_summary;
-- ================================================================
