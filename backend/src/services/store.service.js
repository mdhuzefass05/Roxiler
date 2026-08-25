import AppError from '../utils/AppError.js';

/**
 * Store Service — business logic for store management.
 *
 * All methods are stubbed and throw AppError(501).
 * Implement in Phase 3 (Store Management).
 *
 * This service will:
 *   - List stores with average ratings, filtering, sorting, pagination
 *   - Look up individual stores
 *   - Create stores (admin only)
 *   - Return the store owned by the authenticated STORE_OWNER
 */

/**
 * Get all stores with average ratings.
 * Supports filtering by name/address, sorting, and pagination.
 * @param {Object} queryParams - { name, address, page, limit, sort, order }
 * @returns {Promise<{ stores: Array, meta: Object }>}
 */
export const getAllStores = async (_queryParams) => {
  throw new AppError('Store service: getAllStores — not implemented.', 501);
};

/**
 * Get a single store by ID, including its average rating and total ratings count.
 * @param {number} id
 * @returns {Promise<Object>}
 */
export const getStoreById = async (_id) => {
  throw new AppError('Store service: getStoreById — not implemented.', 501);
};

/**
 * Create a new store. Admin-only action.
 * @param {{ name, email, address, owner_id }} data
 * @returns {Promise<Object>} Created store
 */
export const createStore = async (_data) => {
  throw new AppError('Store service: createStore — not implemented.', 501);
};

/**
 * Get the store owned by the authenticated STORE_OWNER.
 * @param {number} ownerId - req.user.id
 * @returns {Promise<Object>} Store with ratings breakdown
 */
export const getMyStore = async (_ownerId) => {
  throw new AppError('Store service: getMyStore — not implemented.', 501);
};
