import * as storeService from '../services/store.service.js';
import { sendSuccess } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Store Controller
 */

/**
 * GET /api/v1/stores
 * Available to all authenticated users.
 * Supports filtering by name, email, address + sorting + pagination.
 */
export const getAllStores = asyncHandler(async (req, res) => {
  const { stores, pagination } = await storeService.getAllStores(req.query, req.user?.id);
  return sendSuccess(res, {
    data: { stores, pagination },
    meta: pagination,
    message: 'Stores retrieved successfully.',
  });
});

/**
 * GET /api/v1/stores/my-store
 * STORE_OWNER only — returns their own store with ratings breakdown.
 */
export const getMyStore = asyncHandler(async (req, res) => {
  const store = await storeService.getMyStore(req.user.id);
  return sendSuccess(res, {
    data: store,
    message: 'Store profile retrieved successfully.',
  });
});

/**
 * GET /api/v1/stores/my-store/ratings
 * STORE_OWNER only — returns paginated customer ratings and reviewer profiles.
 */
export const getMyStoreRatings = asyncHandler(async (req, res) => {
  const result = await storeService.getMyStoreRatings(req.user.id, req.query);
  return sendSuccess(res, {
    data: result,
    meta: result.pagination,
    message: 'Store customer ratings retrieved successfully.',
  });
});

/**
 * GET /api/v1/stores/my-store/stats
 * STORE_OWNER only — returns average rating, total count, and 1-5 star distribution.
 */
export const getMyStoreStats = asyncHandler(async (req, res) => {
  const stats = await storeService.getMyStoreStats(req.user.id);
  return sendSuccess(res, {
    data: stats,
    message: 'Store rating statistics retrieved successfully.',
  });
});

/**
 * GET /api/v1/stores/:id
 */
export const getStoreById = asyncHandler(async (req, res) => {
  const store = await storeService.getStoreById(req.params.id);
  return sendSuccess(res, {
    data: store,
    message: 'Store details retrieved successfully.',
  });
});

/**
 * POST /api/v1/stores
 * SYSTEM_ADMIN only.
 */
export const createStore = asyncHandler(async (req, res) => {
  const store = await storeService.createStore(req.body);
  return sendSuccess(res, {
    data: store,
    message: 'Store created successfully.',
    status: 201,
  });
});
