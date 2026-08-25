import { body } from 'express-validator';

/**
 * Auth validators — express-validator chains.
 */

/**
 * Validation rules for POST /api/v1/auth/register
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
 * Validation rules for PATCH /api/v1/auth/profile
 */
export const updateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 60 })
    .withMessage('Name must be between 3 and 60 characters.'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters.'),
];

/**
 * Validation rules for PATCH & POST /api/v1/auth/change-password
 */
export const changePassword = [
  body()
    .custom((value) => {
      const currentPassword = value.currentPassword || value.current_password;
      if (!currentPassword || typeof currentPassword !== 'string' || !currentPassword.trim()) {
        throw new Error('Current password is required.');
      }

      const newPassword = value.newPassword || value.new_password;
      if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 16) {
        throw new Error('New password must be between 8 and 16 characters.');
      }

      if (!/[A-Z]/.test(newPassword)) {
        throw new Error('New password must contain at least one uppercase letter.');
      }

      if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
        throw new Error('New password must contain at least one special character.');
      }

      const confirmPassword = value.confirmPassword || value.confirm_password;
      if (confirmPassword !== undefined && confirmPassword !== newPassword) {
        throw new Error('New password and confirmation password do not match.');
      }

      if (currentPassword === newPassword) {
        throw new Error('New password must be different from your current password.');
      }

      return true;
    }),
];
