import { sendError } from '../utils/response.js';

/**
 * User Controller
 * All handlers are stubbed and return 501 Not Implemented.
 * Implement in Phase 2 (User Management).
 */

/**
 * GET /api/users
 * List all users. Requires: SYSTEM_ADMIN role.
 */
export const getAllUsers = (_req, res) => {
  return sendError(res, { message: 'getAllUsers — not implemented yet.', status: 501 });
};

/**
 * GET /api/users/:id
 * Get a single user by ID. Requires: SYSTEM_ADMIN role.
 */
export const getUserById = (_req, res) => {
  return sendError(res, { message: 'getUserById — not implemented yet.', status: 501 });
};

/**
 * DELETE /api/users/:id
 * Delete a user. Requires: SYSTEM_ADMIN role.
 */
export const deleteUser = (_req, res) => {
  return sendError(res, { message: 'deleteUser — not implemented yet.', status: 501 });
};
