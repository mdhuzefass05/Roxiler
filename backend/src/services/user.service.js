import bcrypt from 'bcryptjs';
import * as userModel from '../models/user.model.js';
import * as storeModel from '../models/store.model.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import AppError from '../utils/AppError.js';

const BCRYPT_ROUNDS = 10;

/**
 * User Service — business logic for user management (SYSTEM_ADMIN).
 */

/**
 * Get all users with server-side filtering, sorting, and pagination.
 *
 * @param {Object} queryParams - { name, email, address, role, page, limit, sort, order }
 * @returns {Promise<{ users: Array, pagination: Object }>}
 */
export const getAllUsers = async (queryParams = {}) => {
  const { limit, offset, sort, order, meta } = parsePagination(queryParams);

  const conditions = [];
  const params = [];

  if (queryParams.name && queryParams.name.trim()) {
    params.push(`%${queryParams.name.trim()}%`);
    conditions.push(`name ILIKE $${params.length}`);
  }

  if (queryParams.email && queryParams.email.trim()) {
    params.push(`%${queryParams.email.trim()}%`);
    conditions.push(`email ILIKE $${params.length}`);
  }

  if (queryParams.address && queryParams.address.trim()) {
    params.push(`%${queryParams.address.trim()}%`);
    conditions.push(`address ILIKE $${params.length}`);
  }

  if (queryParams.role && ['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'].includes(queryParams.role)) {
    params.push(queryParams.role);
    conditions.push(`role = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderClause = `ORDER BY ${sort} ${order}`;

  // Fetch total count and paginated rows in parallel
  const [total, users] = await Promise.all([
    userModel.countAll({ whereClause, params }),
    userModel.findAll({ whereClause, params, orderClause, limit, offset }),
  ]);

  const pagination = buildPaginationMeta(total, meta.page, meta.limit);

  return { users, pagination };
};

/**
 * Get a single user by ID.
 * If user is a STORE_OWNER, also attaches their store details and rating summary.
 *
 * @param {number} id
 * @returns {Promise<Object>} Safe user record with optional store details
 */
export const getUserById = async (id) => {
  const user = await userModel.findById(id);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const result = { ...user };

  // If the user is a STORE_OWNER, join store & rating analytics
  if (user.role === 'STORE_OWNER') {
    const store = await storeModel.findByOwnerId(user.id);
    result.store = store
      ? {
          id: store.store_id || store.id,
          name: store.store_name || store.name,
          email: store.store_email || store.email,
          address: store.store_address || store.address,
          average_rating: parseFloat(store.average_rating || 0),
          total_ratings: parseInt(store.total_ratings || 0, 10),
        }
      : null;
  }

  return result;
};

/**
 * Create a new user with any valid role (SYSTEM_ADMIN, NORMAL_USER, STORE_OWNER).
 *
 * @param {{ name: string, email: string, password: string, address: string, role: string }} data
 * @returns {Promise<Object>} Created user record (without password)
 */
export const createUser = async ({ name, email, password, address, role }) => {
  // 1. Check duplicate email
  const existingUser = await userModel.findByEmail(email);
  if (existingUser) {
    throw new AppError('A user with this email address already exists.', 409);
  }

  // 2. Hash password
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // 3. Insert user into DB
  const newUser = await userModel.createUser({
    name,
    email,
    password_hash: passwordHash,
    address,
    role,
  });

  return newUser;
};

/**
 * Delete a user by ID.
 *
 * @param {number} id
 * @returns {Promise<void>}
 */
export const deleteUser = async (id) => {
  const deleted = await userModel.deleteById(id);
  if (!deleted) {
    throw new AppError('User not found.', 404);
  }
};
