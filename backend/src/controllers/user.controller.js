import * as userService from '../services/user.service.js';
import { sendSuccess } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * User Controller — SYSTEM_ADMIN only.
 * All routes are guarded by authenticate + authorize('SYSTEM_ADMIN') in the router.
 */

/**
 * GET /api/v1/users
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { users, meta } = await userService.getAllUsers(req.query);
  return sendSuccess(res, { data: users, meta, message: 'Users retrieved successfully.' });
});

/**
 * GET /api/v1/users/:id
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return sendSuccess(res, { data: user });
});

/**
 * POST /api/v1/users
 */
export const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  return sendSuccess(res, { data: user, message: 'User created successfully.', status: 201 });
});

/**
 * DELETE /api/v1/users/:id
 */
export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  return sendSuccess(res, { message: 'User deleted successfully.' });
});
