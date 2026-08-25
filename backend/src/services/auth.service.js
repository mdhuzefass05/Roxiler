import bcrypt from 'bcryptjs';
import * as userModel from '../models/user.model.js';
import { signToken } from '../utils/jwt.js';
import AppError from '../utils/AppError.js';

const BCRYPT_ROUNDS = 12;

/**
 * Format safe user object for client responses (strips password / password_hash).
 * @param {Object} user
 * @returns {{ id: number, name: string, email: string, address: string, role: string }}
 */
const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  address: user.address,
  role: user.role,
});

/**
 * Register a new NORMAL_USER.
 * Only NORMAL_USER accounts can be registered through public signup.
 *
 * @param {{ name: string, email: string, password: string, address: string }} data
 * @returns {Promise<{ user: Object, token: string }>}
 */
export const register = async ({ name, email, password, address }) => {
  // 1. Check for duplicate email
  const existingUser = await userModel.findByEmail(email);
  if (existingUser) {
    throw new AppError('An account with this email address already exists.', 409);
  }

  // 2. Hash password
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // 3. Create user (forced role = NORMAL_USER)
  const newUser = await userModel.createUser({
    name,
    email,
    password_hash: passwordHash,
    address,
    role: 'NORMAL_USER',
  });

  // 4. Generate JWT
  const token = signToken({
    id: newUser.id,
    role: newUser.role,
    email: newUser.email,
  });

  return {
    user: sanitizeUser(newUser),
    token,
  };
};

/**
 * Authenticate any user role (SYSTEM_ADMIN, NORMAL_USER, STORE_OWNER).
 * Uses the same login endpoint for all roles.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ user: Object, token: string }>}
 */
export const login = async ({ email, password }) => {
  // 1. Find user by email
  const user = await userModel.findByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  // 2. Compare password with stored bcrypt hash
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  // 3. Generate JWT containing id, role, and email
  const token = signToken({
    id: user.id,
    role: user.role,
    email: user.email,
  });

  return {
    user: sanitizeUser(user),
    token,
  };
};

/**
 * Return current authenticated user profile.
 *
 * @param {number} userId
 * @returns {Promise<Object>} Safe user record
 */
export const getMe = async (userId) => {
  const user = await userModel.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }
  return sanitizeUser(user);
};

/**
 * Change the authenticated user's password.
 *
 * @param {number} userId
 * @param {{ currentPassword: string, newPassword: string }} data
 * @returns {Promise<void>}
 */
export const changePassword = async (userId, { currentPassword, newPassword }) => {
  // 1. Fetch user with password_hash
  const user = await userModel.findByIdWithPassword(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  // 2. Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    throw new AppError('Current password is incorrect.', 400);
  }

  // 3. Ensure new password is not identical to current
  if (currentPassword === newPassword) {
    throw new AppError('New password must be different from your current password.', 400);
  }

  // 4. Hash new password and update
  const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await userModel.updatePasswordHash(userId, newPasswordHash);
};
