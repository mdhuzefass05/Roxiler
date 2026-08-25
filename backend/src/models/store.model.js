import { query } from '../database/index.js';

/**
 * Store Model — raw SQL query functions.
 * Schema defined in: src/database/migrations/001_initial.sql
 */

export const findAll = async ({
  whereClause = '',
  params = [],
  orderClause = 'ORDER BY s.name ASC',
  limit = 10,
  offset = 0,
} = {}) => {
  const limitOffset = `LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  const { rows } = await query(
    `SELECT
       s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
       COALESCE(ROUND(AVG(r.rating)::NUMERIC, 2), 0) AS average_rating,
       COUNT(r.id)::INTEGER                           AS total_ratings
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     ${whereClause}
     GROUP BY s.id
     ${orderClause}
     ${limitOffset}`,
    [...params, limit, offset]
  );
  return rows;
};

export const countAll = async ({ whereClause = '', params = [] } = {}) => {
  const { rows } = await query(
    `SELECT COUNT(DISTINCT s.id)::INTEGER AS total
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     ${whereClause}`,
    params
  );
  return rows[0].total;
};

export const findById = async (id) => {
  const { rows } = await query(
    `SELECT
       s.*,
       COALESCE(ROUND(AVG(r.rating)::NUMERIC, 2), 0) AS average_rating,
       COUNT(r.id)::INTEGER                           AS total_ratings
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.id = $1
     GROUP BY s.id`,
    [id]
  );
  return rows[0] || null;
};

export const findByOwnerId = async (ownerId) => {
  const { rows } = await query(
    `SELECT
       s.*,
       COALESCE(ROUND(AVG(r.rating)::NUMERIC, 2), 0) AS average_rating,
       COUNT(r.id)::INTEGER                           AS total_ratings
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.owner_id = $1
     GROUP BY s.id`,
    [ownerId]
  );
  return rows[0] || null;
};

export const createStore = async ({ name, email, address, ownerId }) => {
  const { rows } = await query(
    `INSERT INTO stores (name, email, address, owner_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, email, address, ownerId || null]
  );
  return rows[0];
};
