import { query } from '../config/db.js';

/**
 * Rating Model — raw SQL query functions.
 *
 * Table schema (to be created in a migration):
 *   CREATE TABLE ratings (
 *     id         SERIAL PRIMARY KEY,
 *     user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 *     store_id   INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
 *     rating     INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
 *     created_at TIMESTAMPTZ DEFAULT NOW(),
 *     updated_at TIMESTAMPTZ DEFAULT NOW(),
 *     UNIQUE (user_id, store_id)   -- one rating per user per store
 *   );
 */

/**
 * Find an existing rating by a user for a specific store.
 * @param {number} userId
 * @param {number} storeId
 * @returns {Promise<Object|null>}
 */
export const findByUserAndStore = async (userId, storeId) => {
  const { rows } = await query(
    'SELECT * FROM ratings WHERE user_id = $1 AND store_id = $2 LIMIT 1',
    [userId, storeId]
  );
  return rows[0] || null;
};

/**
 * Get all ratings for a specific store.
 * @param {number} storeId
 * @returns {Promise<Array>}
 */
export const findByStoreId = async (storeId) => {
  const { rows } = await query(
    `SELECT r.*, u.name AS user_name
     FROM ratings r
     JOIN users u ON u.id = r.user_id
     WHERE r.store_id = $1
     ORDER BY r.created_at DESC`,
    [storeId]
  );
  return rows;
};

/**
 * Create a new rating.
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export const createRating = async ({ userId, storeId, rating }) => {
  const { rows } = await query(
    `INSERT INTO ratings (user_id, store_id, rating)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, storeId, rating]
  );
  return rows[0];
};

/**
 * Update an existing rating.
 * @param {number} userId
 * @param {number} storeId
 * @param {number} rating
 * @returns {Promise<Object>}
 */
export const updateRating = async (userId, storeId, rating) => {
  const { rows } = await query(
    `UPDATE ratings
     SET rating = $1, updated_at = NOW()
     WHERE user_id = $2 AND store_id = $3
     RETURNING *`,
    [rating, userId, storeId]
  );
  return rows[0];
};
