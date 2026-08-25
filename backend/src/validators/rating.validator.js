import { body, param } from 'express-validator';

/**
 * Rating validators — express-validator chains.
 */

/**
 * Validates :storeId route parameter.
 */
export const storeIdParam = [
  param('storeId')
    .isInt({ min: 1 }).withMessage('Store ID must be a positive integer.')
    .toInt(),
];

/**
 * Validation for submitting a rating.
 * POST /api/v1/ratings
 *
 * Accepts { storeId / store_id, rating / rating_value, comment }
 */
export const submitRating = [
  body()
    .custom((value) => {
      const storeId = value.store_id || value.storeId;
      if (!storeId || isNaN(parseInt(storeId, 10)) || parseInt(storeId, 10) < 1) {
        throw new Error('Valid Store ID is required (must be a positive integer).');
      }

      const rating = value.rating_value !== undefined ? value.rating_value : value.rating;
      if (rating === undefined || rating === null || !Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
        throw new Error('Rating must be an integer between 1 and 5.');
      }

      if (value.comment !== undefined && value.comment !== null) {
        if (typeof value.comment !== 'string' || value.comment.length > 500) {
          throw new Error('Comment must be a string of at most 500 characters.');
        }
      }

      return true;
    }),
];

/**
 * Validation for updating an existing rating.
 * PATCH / PUT /api/v1/ratings/:storeId
 *
 * Accepts { rating / rating_value, comment }
 */
export const updateRating = [
  ...storeIdParam,

  body()
    .custom((value) => {
      const rating = value.rating_value !== undefined ? value.rating_value : value.rating;
      if (rating === undefined || rating === null || !Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
        throw new Error('Rating must be an integer between 1 and 5.');
      }

      if (value.comment !== undefined && value.comment !== null) {
        if (typeof value.comment !== 'string' || value.comment.length > 500) {
          throw new Error('Comment must be a string of at most 500 characters.');
        }
      }

      return true;
    }),
];
