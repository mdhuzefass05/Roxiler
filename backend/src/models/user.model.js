import { query } from '../database/index.js';

/**
 * User Model — raw SQL query functions.
 *
 * This module only performs DB operations. All business logic lives in the service.
 *
 * Schema defined in: src/database/migrations/001_initial.sql
 */

export const findByEmail = async (email) => {
  const { rows } = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  return rows[0] || null;
};

export const findById = async (id) => {
  const { rows } = await query(
    'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = $1 LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

/**
 * @param {{ name, email, password, address, role }} params
 */
export const createUser = async ({ name, email, password, address, role = 'NORMAL_USER' }) => {
  const { rows } = await query(
    `INSERT INTO users (name, email, password, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, address, role, created_at`,
    [name, email, password, address, role]
  );
  return rows[0];
};

/**
 * Get all users with optional WHERE clause and pagination.
 * @param {string} whereClause - e.g. "WHERE role = $1"
 * @param {Array}  params      - Positional params for whereClause
 * @param {string} orderClause - e.g. "ORDER BY name ASC"
 * @param {number} limit
 * @param {number} offset
 */
export const findAll = async ({
  whereClause = '',
  params = [],
  orderClause = 'ORDER BY created_at DESC',
  limit = 10,
  offset = 0,
} = {}) => {
  const limitOffset = `LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  const { rows } = await query(
    `SELECT id, name, email, address, role, created_at, updated_at
     FROM users
     ${whereClause}
     ${orderClause}
     ${limitOffset}`,
    [...params, limit, offset]
  );
  return rows;
};

export const countAll = async ({ whereClause = '', params = [] } = {}) => {
  const { rows } = await query(
    `SELECT COUNT(*)::INTEGER AS total FROM users ${whereClause}`,
    params
  );
  return rows[0].total;
};

export const updatePassword = async (id, hashedPassword) => {
  const { rows } = await query(
    'UPDATE users SET password = $1 WHERE id = $2 RETURNING id, email, updated_at',
    [hashedPassword, id]
  );
  return rows[0];
};

export const deleteById = async (id) => {
  const { rows } = await query(
    'DELETE FROM users WHERE id = $1 RETURNING id',
    [id]
  );
  return rows[0] || null;
};
