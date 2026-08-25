import { query } from '../config/db.js';

/**
 * Store Model — raw SQL query functions.
 *
 * Table schema (to be created in a migration):
 *   CREATE TABLE stores (
 *     id         SERIAL PRIMARY KEY,
 *     name       VARCHAR(100) NOT NULL,
 *     email      VARCHAR(150) UNIQUE NOT NULL,
 *     address    TEXT NOT NULL,
 *     owner_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
 *     created_at TIMESTAMPTZ DEFAULT NOW(),
 *     updated_at TIMESTAMPTZ DEFAULT NOW()
 *   );
 */

/**
 * Get all stores with their average ratings.
 * @returns {Promise<Array>}
 */
export const findAll = async () => {
  const { rows } = await query(
    `SELECT
       s.id,
       s.name,
       s.email,
       s.address,
       s.owner_id,
       s.created_at,
       COALESCE(ROUND(AVG(r.rating)::NUMERIC, 2), 0) AS average_rating,
       COUNT(r.id)::INTEGER AS total_ratings
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     GROUP BY s.id
     ORDER BY s.name ASC`
  );
  return rows;
};

/**
 * Find a store by ID.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export const findById = async (id) => {
  const { rows } = await query(
    `SELECT
       s.*,
       COALESCE(ROUND(AVG(r.rating)::NUMERIC, 2), 0) AS average_rating,
       COUNT(r.id)::INTEGER AS total_ratings
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.id = $1
     GROUP BY s.id`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Find a store by its owner user ID.
 * @param {number} ownerId
 * @returns {Promise<Object|null>}
 */
export const findByOwnerId = async (ownerId) => {
  const { rows } = await query(
    `SELECT
       s.*,
       COALESCE(ROUND(AVG(r.rating)::NUMERIC, 2), 0) AS average_rating,
       COUNT(r.id)::INTEGER AS total_ratings
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.owner_id = $1
     GROUP BY s.id`,
    [ownerId]
  );
  return rows[0] || null;
};

/**
 * Create a new store.
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export const createStore = async ({ name, email, address, ownerId }) => {
  const { rows } = await query(
    `INSERT INTO stores (name, email, address, owner_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, email, address, ownerId]
  );
  return rows[0];
};
