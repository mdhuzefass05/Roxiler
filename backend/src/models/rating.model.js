import { query } from '../database/index.js';

/**
 * Rating Model — raw SQL query functions.
 *
 * Column reference:
 *   rating_value     SMALLINT     CHECK (rating_value BETWEEN 1 AND 5)
 *   comment          VARCHAR(500)
 *   owner_reply      VARCHAR(500)
 *   owner_replied_at TIMESTAMPTZ
 *
 * Schema: src/database/migrations/001_initial.sql, 003_saas_features.sql, 004_owner_replies.sql
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
 * Find a rating by its ID.
 */
export const findById = async (ratingId) => {
  const { rows } = await query(
    `SELECT r.*, s.owner_id AS store_owner_id
     FROM ratings r
     JOIN stores s ON s.id = r.store_id
     WHERE r.id = $1 LIMIT 1`,
    [ratingId]
  );
  return rows[0] || null;
};

/**
 * Get all ratings for a store, joined with the rater's full profile.
 */
export const findByStoreId = async (storeId) => {
  const { rows } = await query(
    `SELECT
       r.id,
       r.user_id,
       r.store_id,
       r.rating_value,
       r.comment,
       r.owner_reply,
       r.owner_replied_at,
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
       r.comment,
       r.owner_reply,
       r.owner_replied_at,
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
       r.id, r.user_id, r.store_id, r.rating_value, r.comment,
       r.owner_reply, r.owner_replied_at, r.created_at, r.updated_at,
       s.name AS store_name, s.address AS store_address, s.category AS store_category
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
 */
export const createRating = async ({ userId, storeId, rating_value, comment = null }) => {
  const { rows } = await query(
    `INSERT INTO ratings (user_id, store_id, rating_value, comment)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, storeId, rating_value, comment]
  );
  return rows[0];
};

/**
 * Update an existing rating.
 */
export const updateRating = async (userId, storeId, rating_value, comment) => {
  const { rows } = await query(
    `UPDATE ratings
     SET rating_value = $1,
         comment = COALESCE($4, comment),
         updated_at = NOW()
     WHERE user_id = $2 AND store_id = $3
     RETURNING *`,
    [rating_value, userId, storeId, comment !== undefined ? comment : null]
  );
  return rows[0] || null;
};

/**
 * Add or update a Store Owner's official reply to a customer review.
 */
export const addOwnerReply = async (ratingId, replyText) => {
  const { rows } = await query(
    `UPDATE ratings
     SET owner_reply = $1,
         owner_replied_at = NOW(),
         updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [replyText, ratingId]
  );
  return rows[0] || null;
};
