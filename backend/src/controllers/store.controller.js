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
  const { stores, pagination } = await storeService.getAllStores(req.query);
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
