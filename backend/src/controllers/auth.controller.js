import { sendError } from '../utils/response.js';

/**
 * Auth Controller
 * All handlers are stubbed and return 501 Not Implemented.
 * Implement in Phase 2 (Authentication).
 */

/**
 * POST /api/auth/register
 * Register a new NORMAL_USER.
 */
export const register = (_req, res) => {
  return sendError(res, { message: 'register — not implemented yet.', status: 501 });
};

/**
 * POST /api/auth/login
 * Authenticate any user (all roles) and return a JWT.
 */
export const login = (_req, res) => {
  return sendError(res, { message: 'login — not implemented yet.', status: 501 });
};

/**
 * GET /api/auth/me
 * Return the currently authenticated user's profile.
 * Requires: authenticate middleware
 */
export const getMe = (_req, res) => {
  return sendError(res, { message: 'getMe — not implemented yet.', status: 501 });
};

/**
 * PATCH /api/auth/change-password
 * Change the authenticated user's password.
 * Requires: authenticate middleware
 */
export const changePassword = (_req, res) => {
  return sendError(res, { message: 'changePassword — not implemented yet.', status: 501 });
};
