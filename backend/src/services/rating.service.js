import AppError from '../utils/AppError.js';

/**
 * Rating Service — business logic for ratings.
 *
 * All methods are stubbed and throw AppError(501).
 * Implement in Phase 4 (Ratings).
 *
 * This service will:
 *   - Submit a new rating (one per user per store, enforced at DB level)
 *   - Update an existing rating
 *   - Return all ratings for a specific store
 */

/**
 * Submit a new rating for a store.
 * If the user has already rated this store, throws a 409 conflict.
 * @param {number} userId
 * @param {{ store_id: number, rating: number }} data
 * @returns {Promise<Object>} Created rating
 */
export const submitRating = async (_userId, _data) => {
  throw new AppError('Rating service: submitRating — not implemented.', 501);
};

/**
 * Update an existing rating.
 * Throws 404 if no existing rating is found for this user/store pair.
 * @param {number} userId
 * @param {number} storeId
 * @param {number} rating
 * @returns {Promise<Object>} Updated rating
 */
export const updateRating = async (_userId, _storeId, _rating) => {
  throw new AppError('Rating service: updateRating — not implemented.', 501);
};

/**
 * Get all ratings for a specific store.
 * @param {number} storeId
 * @returns {Promise<Array>}
 */
export const getRatingsByStore = async (_storeId) => {
  throw new AppError('Rating service: getRatingsByStore — not implemented.', 501);
};
