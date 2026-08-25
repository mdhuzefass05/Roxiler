import { body, param, query } from 'express-validator';

/**
 * User validators — express-validator chains.
 */

/**
 * Validates :id route parameter is a positive integer.
 */
export const idParam = [
  param('id')
    .isInt({ min: 1 }).withMessage('User ID must be a positive integer.')
    .toInt(),
];

/**
 * Validation for admin creating a new user (any role).
 * POST /api/v1/users
 */
export const createUser = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 20, max: 60 }).withMessage('Name must be between 20 and 60 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('address')
    .trim()
    .notEmpty().withMessage('Address is required.')
    .isLength({ max: 400 }).withMessage('Address must not exceed 400 characters.'),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8, max: 16 }).withMessage('Password must be between 8 and 16 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character.'),

  body('role')
    .notEmpty().withMessage('Role is required.')
    .isIn(['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'])
    .withMessage('Role must be one of: SYSTEM_ADMIN, NORMAL_USER, STORE_OWNER.'),
];

/**
 * Validation for user list query params (filtering / sorting / pagination).
 * GET /api/v1/users?name=&email=&role=&page=&limit=&sort=&order=
 */
export const listUsers = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100.').toInt(),
  query('role')
    .optional()
    .isIn(['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'])
    .withMessage('Invalid role filter.'),
  query('order')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Order must be asc or desc.'),
];
