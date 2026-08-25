import * as ratingModel from '../models/rating.model.js';
import * as storeModel from '../models/store.model.js';
import AppError from '../utils/AppError.js';

/**
 * Rating Service — business logic for rating operations.
 */

/**
 * Submit a new rating for a store.
 * NORMAL_USER only.
 * Throws 409 if a rating already exists for this user/store pair.
 *
 * @param {number} userId
 * @param {{ store_id: number, rating_value: number }} data
 * @returns {Promise<Object>} Created rating
 */
export const submitRating = async (userId, data) => {
  const storeId = data.store_id || data.storeId;
  const ratingValue = data.rating_value !== undefined ? data.rating_value : data.rating;

  // 1. Verify store exists
  const store = await storeModel.findById(storeId);
  if (!store) {
    throw new AppError('Store not found.', 404);
  }

  // 2. Check for duplicate rating
  const existing = await ratingModel.findByUserAndStore(userId, storeId);
  if (existing) {
    throw new AppError(
      'You have already submitted a rating for this store. Please modify your existing rating instead.',
      409
    );
  }

  // 3. Insert rating (PostgreSQL trigger also prevents STORE_OWNER/SYSTEM_ADMIN ratings)
  const created = await ratingModel.createRating({
    userId,
    storeId,
    rating_value: ratingValue,
  });

  return created;
};

/**
 * Update an existing rating for a store.
 * NORMAL_USER only.
 * Throws 404 if no previous rating exists.
 *
 * @param {number} userId
 * @param {number} storeId
 * @param {number} ratingValue
 * @returns {Promise<Object>} Updated rating
 */
export const updateRating = async (userId, storeId, ratingValue) => {
  // 1. Verify store exists
  const store = await storeModel.findById(storeId);
  if (!store) {
    throw new AppError('Store not found.', 404);
  }

  // 2. Verify previous rating exists
  const existing = await ratingModel.findByUserAndStore(userId, storeId);
  if (!existing) {
    throw new AppError('No existing rating found for this store to update. Please submit a rating first.', 404);
  }

  // 3. Update rating in database
  const updated = await ratingModel.updateRating(userId, storeId, ratingValue);
  return updated;
};

/**
 * Get all ratings for a specific store.
 *
 * @param {number} storeId
 * @returns {Promise<Array>}
 */
export const getRatingsByStore = async (storeId) => {
  const store = await storeModel.findById(storeId);
  if (!store) {
    throw new AppError('Store not found.', 404);
  }
  return ratingModel.findByStoreId(storeId);
};
