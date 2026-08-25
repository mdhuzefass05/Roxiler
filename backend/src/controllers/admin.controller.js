import * as adminService from '../services/admin.service.js';
import { sendSuccess } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Admin Controller — handles platform dashboard metrics.
 */

/**
 * GET /api/v1/admin/stats
 * SYSTEM_ADMIN only.
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  return sendSuccess(res, {
    data: stats,
    message: 'Platform statistics retrieved successfully.',
  });
});
