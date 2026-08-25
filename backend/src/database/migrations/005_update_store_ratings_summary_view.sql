-- ================================================================
-- Migration 005: Update store_ratings_summary view to include category
-- Ensures category filtering on store_ratings_summary works seamlessly
-- ================================================================

DROP VIEW IF EXISTS store_ratings_summary CASCADE;
CREATE OR REPLACE VIEW store_ratings_summary AS
SELECT
  s.id                                                            AS store_id,
  s.name                                                          AS store_name,
  s.email                                                         AS store_email,
  s.address                                                       AS store_address,
  COALESCE(s.category, 'General')                                 AS category,
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
  s.id, s.name, s.email, s.address, s.category, s.owner_id,
  s.created_at, s.updated_at,
  u.name, u.email;

COMMENT ON VIEW store_ratings_summary IS
  'Aggregate view: store info + category + owner info + average_rating + total_ratings';
