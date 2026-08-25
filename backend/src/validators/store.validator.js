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

  body('category')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 50 }).withMessage('Category must not exceed 50 characters.'),
];

/**
 * Validation for updating a store.
 * PUT /api/v1/stores/:id
 */
export const updateStore = [
  param('id')
    .isInt({ min: 1 }).withMessage('Store ID must be a positive integer.')
    .toInt(),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 20, max: 60 }).withMessage('Store name must be between 20 and 60 characters.'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 400 }).withMessage('Store address must not exceed 400 characters.'),

  body('owner_id')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === '') return true;
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1) throw new Error('Owner ID must be a positive integer or null.');
      return true;
    }),

  body('category')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 50 }).withMessage('Category must not exceed 50 characters.'),
];

/**
 * Validation for store list query params.
 * GET /api/v1/stores?name=&email=&address=&category=&page=&limit=&sort=&order=
 */
export const listStores = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100.').toInt(),
  query('name').optional().isString().trim(),
  query('email').optional().isString().trim(),
  query('address').optional().isString().trim(),
  query('category').optional().isString().trim(),
  query('sort')
    .optional()
    .isIn(['store_name', 'name', 'store_email', 'email', 'store_address', 'address', 'average_rating', 'rating', 'created_at', 'category'])
    .withMessage('Invalid sort column.'),
  query('order')
    .optional()
    .isIn(['asc', 'desc', 'ASC', 'DESC']).withMessage('Order must be asc or desc.'),
];
