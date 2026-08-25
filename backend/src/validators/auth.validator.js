import { body } from 'express-validator';

/**
 * Auth validators — express-validator chains.
 *
 * Usage:
 *   router.post('/register', authValidator.register, validate, asyncHandler(controller));
 */

/**
 * Validation rules for POST /api/v1/auth/register
 *
 * Business rules (per spec):
 *   - name:     20–60 characters
 *   - address:  max 400 characters
 *   - email:    valid email format
 *   - password: 8–16 characters, must contain at least one uppercase letter
 *               and one special character
 */
export const register = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters.'),

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
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character.'),
];

/**
 * Validation rules for POST /api/v1/auth/login
 */
export const login = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.'),
];

/**
 * Validation rules for PATCH /api/v1/auth/change-password
 */
export const changePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required.'),

  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters.')
    .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter.')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('New password must contain at least one special character.'),
];
