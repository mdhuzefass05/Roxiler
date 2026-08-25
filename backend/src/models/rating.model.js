import { query } from '../database/index.js';

/**
 * Rating Model — raw SQL query functions.
 *
 * Column reference:
 *   rating_value  SMALLINT  CHECK (rating_value BETWEEN 1 AND 5)
 *
 * Schema: src/database/migrations/001_initial.sql
 */

/**
 * Find a rating by user + store (to check if one already exists).
 */
export const findByUserAndStore = async (userId, storeId) => {
  const { rows } = await query(
    'SELECT * FROM ratings WHERE user_id = $1 AND store_id = $2 LIMIT 1',
    [userId, storeId]
  );
  return rows[0] || null;
};

/**
 * Get all ratings for a store, joined with the rater's full profile (name, email, address).
 */
export const findByStoreId = async (storeId) => {
  const { rows } = await query(
    `SELECT
       r.id,
       r.user_id,
       r.store_id,
       r.rating_value,
       r.created_at,
       r.updated_at,
       u.name    AS user_name,
       u.email   AS user_email,
       u.address AS user_address
     FROM ratings r
     JOIN users u ON u.id = r.user_id
     WHERE r.store_id = $1
     ORDER BY r.created_at DESC`,
    [storeId]
  );
  return rows;
};

/**
 * Get 1-to-5 star rating breakdown for a store.
 */
export const getRatingDistribution = async (storeId) => {
  const { rows } = await query(
    `SELECT
       rating_value,
       COUNT(*)::INTEGER AS count
     FROM ratings
     WHERE store_id = $1
     GROUP BY rating_value
     ORDER BY rating_value DESC`,
    [storeId]
  );
  return rows;
};

/**
 * Find ratings for a store with server-side filtering, sorting, and pagination.
 */
export const findStoreRatingsPaginated = async ({
  storeId,
  whereClause = '',
  params = [],
  orderClause = 'ORDER BY r.created_at DESC',
  limit = 10,
  offset = 0,
}) => {
  const p = [storeId, ...params, limit, offset];
  const limitIdx = p.length - 1;
  const offsetIdx = p.length;

  const { rows } = await query(
    `SELECT
       r.id,
       r.user_id,
       r.store_id,
       r.rating_value,
       r.created_at,
       r.updated_at,
       u.name    AS user_name,
       u.email   AS user_email,
       u.address AS user_address
     FROM ratings r
     JOIN users u ON u.id = r.user_id
     WHERE r.store_id = $1
     ${whereClause}
     ${orderClause}
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    p
  );
  return rows;
};

/**
 * Count total ratings for a store (with optional WHERE filter).
 */
export const countStoreRatings = async ({ storeId, whereClause = '', params = [] } = {}) => {
  const p = [storeId, ...params];
  const { rows } = await query(
    `SELECT COUNT(*)::INTEGER AS total
     FROM ratings r
     JOIN users u ON u.id = r.user_id
     WHERE r.store_id = $1
     ${whereClause}`,
    p
  );
  return rows[0]?.total || 0;
};

/**
 * Get all ratings submitted by a specific user, joined with store name.
 */
export const findByUserId = async (userId) => {
  const { rows } = await query(
    `SELECT
       r.id, r.user_id, r.store_id, r.rating_value, r.created_at, r.updated_at,
       s.name AS store_name
     FROM ratings r
     JOIN stores s ON s.id = r.store_id
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC`,
    [userId]
  );
  return rows;
};

/**
 * Create a new rating.
 * Note: The DB trigger fn_prevent_store_owner_rating() will reject
 * any attempt from a STORE_OWNER or SYSTEM_ADMIN.
 *
 * @param {{ userId, storeId, rating_value }} params
 */
export const createRating = async ({ userId, storeId, rating_value }) => {
  const { rows } = await query(
    `INSERT INTO ratings (user_id, store_id, rating_value)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, storeId, rating_value]
  );
  return rows[0];
};

/**
 * Update an existing rating.
 * Returns null if no matching rating is found.
 *
 * @param {number} userId
 * @param {number} storeId
 * @param {number} rating_value
 */
export const updateRating = async (userId, storeId, rating_value) => {
  const { rows } = await query(
    `UPDATE ratings
     SET rating_value = $1, updated_at = NOW()
     WHERE user_id = $2 AND store_id = $3
     RETURNING *`,
    [rating_value, userId, storeId]
  );
  return rows[0] || null;
};
