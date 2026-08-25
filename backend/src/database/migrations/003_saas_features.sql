-- ================================================================
-- Migration 003: SaaS & Feature Extensions
-- Adds optional comment to ratings and category to stores
-- ================================================================

-- 1. Add optional written commentary to ratings
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS comment VARCHAR(500);

-- 2. Add business category to stores with sensible default
ALTER TABLE stores ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'General';

-- 3. Create index on stores category for fast filtering
CREATE INDEX IF NOT EXISTS idx_stores_category ON stores (category);
