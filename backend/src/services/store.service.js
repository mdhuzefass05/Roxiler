import * as storeModel from '../models/store.model.js';
import * as userModel from '../models/user.model.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import AppError from '../utils/AppError.js';

/**
 * Map API sort query fields to view columns
 */
const SORT_FIELD_MAP = {
  name: 'store_name',
  store_name: 'store_name',
  email: 'store_email',
  store_email: 'store_email',
  address: 'store_address',
  store_address: 'store_address',
  rating: 'average_rating',
  average_rating: 'average_rating',
  created_at: 'created_at',
};

const formatStore = (row) => ({
  id: row.store_id || row.id,
  name: row.store_name || row.name,
  email: row.store_email || row.email,
  address: row.store_address || row.address,
  owner_id: row.owner_id,
  owner_name: row.owner_name || null,
  owner_email: row.owner_email || null,
  average_rating: parseFloat(row.average_rating || 0),
  total_ratings: parseInt(row.total_ratings || 0, 10),
  created_at: row.created_at,
  updated_at: row.updated_at,
});

/**
 * Get all stores with server-side filtering, sorting, and pagination.
 *
 * @param {Object} queryParams - { name, email, address, page, limit, sort, order }
 * @returns {Promise<{ stores: Array, pagination: Object }>}
 */
export const getAllStores = async (queryParams = {}) => {
  const { limit, offset, order, meta } = parsePagination(queryParams);

  const rawSort = queryParams.sort || 'store_name';
  const sortColumn = SORT_FIELD_MAP[rawSort] || 'store_name';

  const conditions = [];
  const params = [];

  if (queryParams.name && queryParams.name.trim()) {
    params.push(`%${queryParams.name.trim()}%`);
    conditions.push(`store_name ILIKE $${params.length}`);
  }

  if (queryParams.email && queryParams.email.trim()) {
    params.push(`%${queryParams.email.trim()}%`);
    conditions.push(`store_email ILIKE $${params.length}`);
  }

  if (queryParams.address && queryParams.address.trim()) {
    params.push(`%${queryParams.address.trim()}%`);
    conditions.push(`store_address ILIKE $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderClause = `ORDER BY ${sortColumn} ${order}`;

  const [total, rows] = await Promise.all([
    storeModel.countAll({ whereClause, params }),
    storeModel.findAll({ whereClause, params, orderClause, limit, offset }),
  ]);

  const stores = rows.map(formatStore);
  const pagination = buildPaginationMeta(total, meta.page, meta.limit);

  return { stores, pagination };
};

/**
 * Get a single store by ID.
 *
 * @param {number} id
 * @returns {Promise<Object>} Formatted store object
 */
export const getStoreById = async (id) => {
  const row = await storeModel.findById(id);
  if (!row) {
    throw new AppError('Store not found.', 404);
  }
  return formatStore(row);
};

/**
 * Create a new store (SYSTEM_ADMIN only).
 *
 * @param {{ name: string, email: string, address: string, owner_id?: number }} data
 * @returns {Promise<Object>} Created store with owner & rating details
 */
export const createStore = async ({ name, email, address, owner_id }) => {
  // 1. Verify owner exists and has STORE_OWNER role if owner_id is supplied
  if (owner_id) {
    const owner = await userModel.findById(owner_id);
    if (!owner) {
      throw new AppError('The specified store owner was not found.', 404);
    }
    if (owner.role !== 'STORE_OWNER') {
      throw new AppError('The assigned owner must have the STORE_OWNER role.', 400);
    }
  }

  // 2. Insert store into database
  const created = await storeModel.createStore({
    name,
    email,
    address,
    owner_id: owner_id || null,
  });

  // 3. Fetch enriched record from the store_ratings_summary view
  const store = await storeModel.findById(created.id);
  return formatStore(store || created);
};

/**
 * Get the store owned by the authenticated STORE_OWNER.
 *
 * @param {number} ownerId
 * @returns {Promise<Object|null>}
 */
export const getMyStore = async (ownerId) => {
  const row = await storeModel.findByOwnerId(ownerId);
  return row ? formatStore(row) : null;
};
