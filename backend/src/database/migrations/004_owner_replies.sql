-- ================================================================
-- Migration 004: Store Owner Review Responses & Customer Sentiment
-- ================================================================

ALTER TABLE ratings
  ADD COLUMN IF NOT EXISTS owner_reply VARCHAR(500),
  ADD COLUMN IF NOT EXISTS owner_replied_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_ratings_owner_reply
  ON ratings(store_id)
  WHERE owner_reply IS NOT NULL;
