import * as authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Auth Controller
 *
 * Thin layer — delegates all logic to authService.
 * asyncHandler forwards any thrown errors to the global error middleware.
 */

/**
 * POST /api/v1/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return sendSuccess(res, {
    data: result,
    message: 'Account created successfully.',
    status: 201,
  });
});

/**
 * POST /api/v1/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return sendSuccess(res, {
    data: result,
    message: 'Logged in successfully.',
  });
});

/**
 * GET /api/v1/auth/me
 * Requires: authenticate middleware
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  return sendSuccess(res, { data: user });
});

/**
 * PATCH /api/v1/auth/profile
 * Requires: authenticate middleware
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  return sendSuccess(res, {
    data: user,
    message: 'Profile updated successfully.',
  });
});

/**
 * PATCH /api/v1/auth/change-password
 * Requires: authenticate middleware
 */
export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body);
  return sendSuccess(res, { message: 'Password updated successfully.' });
});

/**
 * POST /api/v1/auth/logout
 * Requires: authenticate middleware
 */
export const logout = asyncHandler(async (_req, res) => {
  return sendSuccess(res, { message: 'Logged out successfully.' });
});
