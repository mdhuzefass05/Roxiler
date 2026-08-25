import AppError from '../utils/AppError.js';

/**
 * Auth Service — business logic for authentication.
 *
 * All methods are stubbed and throw AppError(501).
 * Implement in Phase 2 (Authentication).
 *
 * This service will:
 *   - Hash passwords with bcrypt
 *   - Validate credentials against the DB
 *   - Issue JWT tokens
 *   - Handle password changes
 */

/**
 * Register a new NORMAL_USER.
 * @param {{ name, email, password, address }} data
 * @returns {Promise<{ user: Object, token: string }>}
 */
export const register = async (_data) => {
  throw new AppError('Auth service: register — not implemented.', 501);
};

/**
 * Authenticate a user and return a JWT.
 * @param {{ email, password }} credentials
 * @returns {Promise<{ user: Object, token: string }>}
 */
export const login = async (_credentials) => {
  throw new AppError('Auth service: login — not implemented.', 501);
};

/**
 * Return the profile of the currently authenticated user.
 * @param {number} userId
 * @returns {Promise<Object>} User record (without password)
 */
export const getMe = async (_userId) => {
  throw new AppError('Auth service: getMe — not implemented.', 501);
};

/**
 * Change the authenticated user's password.
 * @param {number} userId
 * @param {{ currentPassword, newPassword }} data
 * @returns {Promise<void>}
 */
export const changePassword = async (_userId, _data) => {
  throw new AppError('Auth service: changePassword — not implemented.', 501);
};
