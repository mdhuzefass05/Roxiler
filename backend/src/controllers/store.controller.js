import { sendError } from '../utils/response.js';

/**
 * Store Controller
 * All handlers are stubbed and return 501 Not Implemented.
 * Implement in Phase 3 (Store Management).
 */

/**
 * GET /api/stores
 * Get all stores (with avg ratings). Available to all authenticated users.
 */
export const getAllStores = (_req, res) => {
  return sendError(res, { message: 'getAllStores — not implemented yet.', status: 501 });
};

/**
 * GET /api/stores/:id
 * Get a single store by ID.
 */
export const getStoreById = (_req, res) => {
  return sendError(res, { message: 'getStoreById — not implemented yet.', status: 501 });
};

/**
 * POST /api/stores
 * Create a new store. Requires: SYSTEM_ADMIN role.
 */
export const createStore = (_req, res) => {
  return sendError(res, { message: 'createStore — not implemented yet.', status: 501 });
};

/**
 * GET /api/stores/my-store
 * Get the store owned by the logged-in STORE_OWNER with rating breakdown.
 */
export const getMyStore = (_req, res) => {
  return sendError(res, { message: 'getMyStore — not implemented yet.', status: 501 });
};
