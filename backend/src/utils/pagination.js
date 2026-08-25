/**
 * Pagination utility.
 *
 * Parses standard query parameters and returns SQL-ready LIMIT / OFFSET values
 * along with metadata for the API response.
 *
 * Supported query params:
 *   ?page=1       (default: 1)
 *   ?limit=10     (default: 10, max: 100)
 *   ?sort=name    (default: 'created_at')
 *   ?order=asc    (default: 'desc')
 */

// Columns that are safe to sort by (whitelist prevents SQL injection)
const ALLOWED_SORT_COLUMNS = new Set([
  'id',
  'name',
  'store_name',
  'email',
  'store_email',
  'address',
  'store_address',
  'created_at',
  'updated_at',
  'rating',
  'average_rating',
]);

/**
 * Parse pagination / sorting parameters from an Express query object.
 *
 * @param {Object} query - req.query
 * @returns {{ limit: number, offset: number, sort: string, order: string, meta: Object }}
 */
export const parsePagination = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || query.pageSize, 10) || 10));
  const offset = (page - 1) * limit;

  const rawSort = query.sort || 'name';
  const sort = ALLOWED_SORT_COLUMNS.has(rawSort) ? rawSort : 'name';

  const order = query.order?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const meta = { page, limit, sort, order };

  return { limit, offset, sort, order, meta };
};

/**
 * Build a pagination meta object after a query with a total count.
 *
 * @param {number} total - Total number of records in the DB
 * @param {number} page
 * @param {number} limit
 * @returns {Object} Pagination metadata
 */
export const buildPaginationMeta = (total, page, limit) => ({
  page,
  limit,
  pageSize: limit,
  total,
  totalItems: total,
  totalPages: Math.ceil(total / limit) || 1,
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});
