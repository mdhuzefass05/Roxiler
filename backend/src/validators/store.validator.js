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
 *
 * Rules:
 *   - name:     20–60 characters
 *   - address:  max 400 characters
 *   - email:    valid email format
 *   - owner_id: optional positive integer
 */
export const createStore = [
  body('name')
    .trim()
    .notEmpty().withMessage('Store name is required.')
    .isLength({ min: 20, max: 60 }).withMessage('Store name must be between 20 and 60 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Store email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('address')
    .trim()
    .notEmpty().withMessage('Store address is required.')
    .isLength({ max: 400 }).withMessage('Store address must not exceed 400 characters.'),

  body('owner_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 }).withMessage('Owner ID must be a positive integer.')
    .toInt(),
];

/**
 * Validation for store list query params.
 * GET /api/v1/stores?name=&email=&address=&page=&limit=&sort=&order=
 */
export const listStores = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100.').toInt(),
  query('name').optional().isString().trim(),
  query('email').optional().isString().trim(),
  query('address').optional().isString().trim(),
  query('sort')
    .optional()
    .isIn(['store_name', 'name', 'store_email', 'email', 'store_address', 'address', 'average_rating', 'rating', 'created_at'])
    .withMessage('Invalid sort column.'),
  query('order')
    .optional()
    .isIn(['asc', 'desc', 'ASC', 'DESC']).withMessage('Order must be asc or desc.'),
];
