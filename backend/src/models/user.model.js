import { query } from '../config/db.js';

/**
 * User Model — raw SQL query functions.
 *
 * Roles: SYSTEM_ADMIN | NORMAL_USER | STORE_OWNER
 *
 * Table schema (to be created in a migration):
 *   CREATE TABLE users (
 *     id         SERIAL PRIMARY KEY,
 *     name       VARCHAR(100) NOT NULL,
 *     email      VARCHAR(150) UNIQUE NOT NULL,
 *     password   VARCHAR(255) NOT NULL,
 *     address    TEXT,
 *     role       VARCHAR(20) NOT NULL DEFAULT 'NORMAL_USER',
 *     created_at TIMESTAMPTZ DEFAULT NOW(),
 *     updated_at TIMESTAMPTZ DEFAULT NOW()
 *   );
 */

/**
 * Find a user by their email address.
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
export const findByEmail = async (email) => {
  const { rows } = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  return rows[0] || null;
};

/**
 * Find a user by their ID.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export const findById = async (id) => {
  const { rows } = await query(
    'SELECT id, name, email, address, role, created_at FROM users WHERE id = $1 LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

/**
 * Create a new user.
 * @param {Object} params
 * @param {string} params.name
 * @param {string} params.email
 * @param {string} params.password - Pre-hashed password
 * @param {string} params.address
 * @param {string} params.role
 * @returns {Promise<Object>} Created user (without password)
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
 * Get all users (admin only).
 * @returns {Promise<Array>}
 */
export const findAll = async () => {
  const { rows } = await query(
    'SELECT id, name, email, address, role, created_at FROM users ORDER BY created_at DESC'
  );
  return rows;
};

/**
 * Update a user's password.
 * @param {number} id
 * @param {string} hashedPassword
 * @returns {Promise<Object>}
 */
export const updatePassword = async (id, hashedPassword) => {
  const { rows } = await query(
    `UPDATE users SET password = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, email, updated_at`,
    [hashedPassword, id]
  );
  return rows[0];
};
