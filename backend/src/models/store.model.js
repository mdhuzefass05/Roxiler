import { query } from '../database/index.js';

/**
 * Store Model — raw SQL query functions.
 *
 * For listings with average_rating + total_ratings, use the
 * `store_ratings_summary` VIEW (see migrations/001_initial.sql).
 *
 * Schema: src/database/migrations/001_initial.sql
 */

/**
 * Get all stores from the summary view.
 * Supports dynamic WHERE, ORDER, and pagination.
 *
 * @param {Object} opts
 * @param {string} opts.whereClause  - e.g. "WHERE store_name ILIKE $1"
 * @param {Array}  opts.params       - Positional params for whereClause
 * @param {string} opts.orderClause  - e.g. "ORDER BY average_rating DESC"
 * @param {number} opts.limit
 * @param {number} opts.offset
 */
export const findAll = async ({
  whereClause = '',
  params = [],
  orderClause = 'ORDER BY store_name ASC',
  limit = 10,
  offset = 0,
} = {}) => {
  const p = [...params, limit, offset];
  const { rows } = await query(
    `SELECT *
     FROM store_ratings_summary
     ${whereClause}
     ${orderClause}
     LIMIT $${p.length - 1} OFFSET $${p.length}`,
    p
  );
  return rows;
};

/**
 * Get stores with average rating + authenticated user's own submitted rating.
 */
export const findAllWithUserRating = async ({
  userId = null,
  whereClause = '',
  params = [],
  orderClause = 'ORDER BY store_name ASC',
  limit = 10,
  offset = 0,
} = {}) => {
  const userParamIdx = params.length + 1;
  const queryParams = [...params, userId, limit, offset];
  const limitIdx = queryParams.length - 1;
  const offsetIdx = queryParams.length;

  const { rows } = await query(
    `SELECT
       s.id                                                    AS store_id,
       s.name                                                  AS store_name,
       s.email                                                 AS store_email,
       s.address                                               AS store_address,
       s.owner_id,
       s.created_at,
       s.updated_at,
       COUNT(r.id)::INTEGER                                    AS total_ratings,
       COALESCE(ROUND(AVG(r.rating_value)::NUMERIC, 2), 0.00) AS average_rating,
       ur.rating_value                                         AS user_rating
     FROM stores s
     LEFT JOIN ratings r  ON r.store_id  = s.id
     LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = $${userParamIdx}
     ${whereClause}
     GROUP BY
       s.id, s.name, s.email, s.address, s.owner_id,
       s.created_at, s.updated_at,
       ur.rating_value
     ${orderClause}
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    queryParams
  );
  return rows;
};

/**
 * Count stores (with optional WHERE on the summary view).
 */
export const countAll = async ({ whereClause = '', params = [] } = {}) => {
  const { rows } = await query(
    `SELECT COUNT(*)::INTEGER AS total FROM store_ratings_summary ${whereClause}`,
    params
  );
  return rows[0].total;
};

/**
 * Find a single store by ID (from summary view).
 */
export const findById = async (id) => {
  const { rows } = await query(
    'SELECT * FROM store_ratings_summary WHERE store_id = $1',
    [id]
  );
  return rows[0] || null;
};

/**
 * Find the store owned by a specific user (STORE_OWNER dashboard).
 */
export const findByOwnerId = async (ownerId) => {
  const { rows } = await query(
    'SELECT * FROM store_ratings_summary WHERE owner_id = $1',
    [ownerId]
  );
  return rows[0] || null;
};

/**
 * Create a new store.
 * @param {{ name, email, address, owner_id }} params
 */
export const createStore = async ({ name, email, address, owner_id }) => {
  const { rows } = await query(
    `INSERT INTO stores (name, email, address, owner_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, email, address, owner_id || null]
  );
  return rows[0];
};
