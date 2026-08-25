import { body, param, query } from 'express-validator';

/**
 * Store validators — express-validator chains.
 */

/**
 * Validates :id route parameter.
 */
export const idParam = [
  param('id')
    .isInt({ min: 1 }).withMessage('Store ID must be a positive integer.')
    .toInt(),
];

/**
 * Validation for creating a new store.
 * POST /api/v1/stores
 */
export const createStore = [
  body('name')
    .trim()
    .notEmpty().withMessage('Store name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Store name must be between 2 and 100 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Store email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('address')
    .trim()
    .notEmpty().withMessage('Store address is required.')
    .isLength({ max: 400 }).withMessage('Address must not exceed 400 characters.'),

  body('owner_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Owner ID must be a positive integer.')
    .toInt(),
];

/**
 * Validation for store list query params.
 * GET /api/v1/stores?name=&address=&page=&limit=&sort=&order=
 */
export const listStores = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100.').toInt(),
  query('order')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Order must be asc or desc.'),
];
