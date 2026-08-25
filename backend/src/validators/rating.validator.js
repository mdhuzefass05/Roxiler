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
 */
export const submitRating = [
  body('store_id')
    .notEmpty().withMessage('Store ID is required.')
    .isInt({ min: 1 }).withMessage('Store ID must be a positive integer.')
    .toInt(),

  body('rating')
    .notEmpty().withMessage('Rating is required.')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5.')
    .toInt(),
];

/**
 * Validation for updating an existing rating.
 * PATCH /api/v1/ratings/:storeId
 */
export const updateRating = [
  ...storeIdParam,

  body('rating')
    .notEmpty().withMessage('Rating is required.')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5.')
    .toInt(),
];
