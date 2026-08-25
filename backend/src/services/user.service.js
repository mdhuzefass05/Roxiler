import AppError from '../utils/AppError.js';

/**
 * User Service — business logic for user management.
 *
 * All methods are stubbed and throw AppError(501).
 * Implement in Phase 2 (User Management — SYSTEM_ADMIN only).
 *
 * This service will:
 *   - List, filter, sort, and paginate users
 *   - Look up individual users
 *   - Create users with any role (admin action)
 *   - Delete users
 */

/**
 * Get all users with optional filtering, sorting, and pagination.
 * @param {Object} queryParams - { name, email, role, page, limit, sort, order }
 * @returns {Promise<{ users: Array, meta: Object }>}
 */
export const getAllUsers = async (_queryParams) => {
  throw new AppError('User service: getAllUsers — not implemented.', 501);
};

/**
 * Get a single user by ID.
 * @param {number} id
 * @returns {Promise<Object>} User (without password)
 */
export const getUserById = async (_id) => {
  throw new AppError('User service: getUserById — not implemented.', 501);
};

/**
 * Create a new user with any role. Admin-only action.
 * @param {{ name, email, password, address, role }} data
 * @returns {Promise<Object>} Created user
 */
export const createUser = async (_data) => {
  throw new AppError('User service: createUser — not implemented.', 501);
};

/**
 * Delete a user by ID.
 * @param {number} id
 * @returns {Promise<void>}
 */
export const deleteUser = async (_id) => {
  throw new AppError('User service: deleteUser — not implemented.', 501);
};
