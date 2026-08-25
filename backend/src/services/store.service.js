import * as storeModel from '../models/store.model.js';
import * as userModel from '../models/user.model.js';
import * as ratingModel from '../models/rating.model.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import AppError from '../utils/AppError.js';

/**
 * Map API sort query fields to query columns
 */
const SORT_FIELD_MAP = {
  name: 's.name',
  store_name: 's.name',
  email: 's.email',
  store_email: 's.email',
  address: 's.address',
  store_address: 's.address',
  rating: 'average_rating',
  average_rating: 'average_rating',
  created_at: 's.created_at',
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
  user_rating: row.user_rating !== undefined && row.user_rating !== null
    ? parseInt(row.user_rating, 10)
    : null,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

/**
 * Get all stores with server-side filtering, sorting, pagination,
 * overall calculated ratings, and authenticated user's own submitted rating.
 *
 * @param {Object} queryParams - { name, email, address, page, limit, sort, order }
 * @param {number|null} currentUserId - The authenticated user's ID
 * @returns {Promise<{ stores: Array, pagination: Object }>}
 */
export const getAllStores = async (queryParams = {}, currentUserId = null) => {
  const { limit, offset, order, meta } = parsePagination(queryParams);

  const rawSort = queryParams.sort || 'name';
  const sortColumn = SORT_FIELD_MAP[rawSort] || 's.name';

  const conditions = [];
  const countConditions = [];
  const params = [];

  if (queryParams.name && queryParams.name.trim()) {
    params.push(`%${queryParams.name.trim()}%`);
    conditions.push(`s.name ILIKE $${params.length}`);
    countConditions.push(`store_name ILIKE $${params.length}`);
  }

  if (queryParams.email && queryParams.email.trim()) {
    params.push(`%${queryParams.email.trim()}%`);
    conditions.push(`s.email ILIKE $${params.length}`);
    countConditions.push(`store_email ILIKE $${params.length}`);
  }

  if (queryParams.address && queryParams.address.trim()) {
    params.push(`%${queryParams.address.trim()}%`);
    conditions.push(`s.address ILIKE $${params.length}`);
    countConditions.push(`store_address ILIKE $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const countWhereClause = countConditions.length > 0 ? `WHERE ${countConditions.join(' AND ')}` : '';
  const orderClause = `ORDER BY ${sortColumn} ${order}`;

  const [total, rows] = await Promise.all([
    storeModel.countAll({ whereClause: countWhereClause, params }),
    storeModel.findAllWithUserRating({
      userId: currentUserId,
      whereClause,
      params,
      orderClause,
      limit,
      offset,
    }),
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
 * Get the store owned by the authenticated STORE_OWNER with ratings breakdown and rater profiles.
 *
 * @param {number} ownerId
 * @returns {Promise<Object|null>}
 */
export const getMyStore = async (ownerId) => {
  // 1. Fetch store from summary view
  const storeRow = await storeModel.findByOwnerId(ownerId);
  if (!storeRow) {
    return null;
  }

  const storeId = storeRow.store_id || storeRow.id;

  // 2. Fetch raters list + 1-to-5 distribution
  const [ratingRows, distributionRows] = await Promise.all([
    ratingModel.findByStoreId(storeId),
    ratingModel.getRatingDistribution(storeId),
  ]);

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  distributionRows.forEach((row) => {
    distribution[row.rating_value] = parseInt(row.count, 10);
  });

  const ratings = ratingRows.map((r) => ({
    id: r.id,
    rating_value: r.rating_value,
    created_at: r.created_at,
    updated_at: r.updated_at,
    user: {
      id: r.user_id,
      name: r.user_name,
      email: r.user_email,
      address: r.user_address,
    },
  }));

  return {
    ...formatStore(storeRow),
    distribution,
    ratings,
  };
};
