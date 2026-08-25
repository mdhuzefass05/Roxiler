-- ================================================================
-- Migration 002: Performance & Scalability Indexes
-- ================================================================
-- Purpose:
--   Accelerate search, sorting, filtering, and aggregate rating queries
--   across Users, Stores, and Ratings tables.
-- ================================================================

-- ── Users Indexes ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_name ON users (name);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_role_created ON users (role, created_at DESC);

-- ── Stores Indexes ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_stores_email ON stores (email);
CREATE INDEX IF NOT EXISTS idx_stores_created_at ON stores (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stores_owner_created ON stores (owner_id, created_at DESC);

-- ── Ratings Indexes ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON ratings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ratings_store_created ON ratings (store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ratings_store_rating_val ON ratings (store_id, rating_value);
