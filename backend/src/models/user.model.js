import { query } from '../database/index.js';

/**
 * User Model — raw SQL query functions.
 *
 * Column reference:
 *   password_hash  VARCHAR(255)  — bcrypt hash; never returned in SELECT *
 *
 * Schema: src/database/migrations/001_initial.sql
 */

// Safe columns to return in SELECT (excludes password_hash)
const SAFE_COLUMNS =
  'id, name, email, address, role, created_at, updated_at';

/**
 * Find a user by email (includes password_hash for auth comparison).
 */
export const findByEmail = async (email) => {
  const { rows } = await query(
    'SELECT * FROM users WHERE email = $1 LIMIT 1',
    [email]
  );
  return rows[0] || null;
};

/**
 * Find a user by ID — excludes password_hash.
 */
export const findById = async (id) => {
  const { rows } = await query(
    `SELECT ${SAFE_COLUMNS} FROM users WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Find a user by ID with password_hash (internal auth use only).
 */
export const findByIdWithPassword = async (id) => {
  const { rows } = await query(
    'SELECT * FROM users WHERE id = $1 LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

/**
 * Create a new user.
 * @param {{ name, email, password_hash, address, role }} params
 */
export const createUser = async ({
  name,
  email,
  password_hash,
  address,
  role = 'NORMAL_USER',
}) => {
  const { rows } = await query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${SAFE_COLUMNS}`,
    [name, email, password_hash, address, role]
  );
  return rows[0];
};

/**
 * Paginated, filterable user list (SYSTEM_ADMIN use).
 *
 * @param {Object} opts
 * @param {string} opts.whereClause   - e.g. "WHERE role = $1 AND name ILIKE $2"
 * @param {Array}  opts.params        - Positional params for whereClause
 * @param {string} opts.orderClause   - e.g. "ORDER BY name ASC"
 * @param {number} opts.limit
 * @param {number} opts.offset
 */
export const findAll = async ({
  whereClause = '',
  params = [],
  orderClause = 'ORDER BY created_at DESC',
  limit = 10,
  offset = 0,
} = {}) => {
  const p = [...params, limit, offset];
  const { rows } = await query(
    `SELECT ${SAFE_COLUMNS}
     FROM users
     ${whereClause}
     ${orderClause}
     LIMIT $${p.length - 1} OFFSET $${p.length}`,
    p
  );
  return rows;
};

/**
 * Count users with optional WHERE filter.
 */
export const countAll = async ({ whereClause = '', params = [] } = {}) => {
  const { rows } = await query(
    `SELECT COUNT(*)::INTEGER AS total FROM users ${whereClause}`,
    params
  );
  return rows[0].total;
};

/**
 * Update a user's password_hash.
 */
export const updatePasswordHash = async (id, passwordHash) => {
  const { rows } = await query(
    `UPDATE users
     SET password_hash = $1
     WHERE id = $2
     RETURNING id, email, updated_at`,
    [passwordHash, id]
  );
  return rows[0];
};

/**
 * Update a user's profile (name and/or address).
 */
export const updateProfile = async (id, { name, address }) => {
  const { rows } = await query(
    `UPDATE users
     SET name = COALESCE($1, name),
         address = COALESCE($2, address),
         updated_at = NOW()
     WHERE id = $3
     RETURNING ${SAFE_COLUMNS}`,
    [name, address, id]
  );
  return rows[0] || null;
};

/**
 * Delete a user by ID. Returns the deleted record id, or null if not found.
 */
export const deleteById = async (id) => {
  const { rows } = await query(
    'DELETE FROM users WHERE id = $1 RETURNING id',
    [id]
  );
  return rows[0] || null;
};
