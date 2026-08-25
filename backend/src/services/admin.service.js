import { query } from '../database/index.js';

/**
 * Admin Service — platform statistics and administrative operations.
 */

/**
 * Retrieve real-time platform statistics from PostgreSQL in a single round-trip.
 *
 * @returns {Promise<{
 *   total_users: number,
 *   total_stores: number,
 *   total_ratings: number,
 *   total_normal_users: number,
 *   total_store_owners: number,
 *   total_admin_users: number
 * }>}
 */
export const getDashboardStats = async () => {
  const { rows } = await query(`
    SELECT
      (SELECT COUNT(*)::INTEGER FROM users)                            AS total_users,
      (SELECT COUNT(*)::INTEGER FROM stores)                           AS total_stores,
      (SELECT COUNT(*)::INTEGER FROM ratings)                          AS total_ratings,
      (SELECT COUNT(*)::INTEGER FROM users WHERE role = 'NORMAL_USER') AS total_normal_users,
      (SELECT COUNT(*)::INTEGER FROM users WHERE role = 'STORE_OWNER') AS total_store_owners,
      (SELECT COUNT(*)::INTEGER FROM users WHERE role = 'SYSTEM_ADMIN') AS total_admin_users
  `);

  return (
    rows[0] || {
      total_users: 0,
      total_stores: 0,
      total_ratings: 0,
      total_normal_users: 0,
      total_store_owners: 0,
      total_admin_users: 0,
    }
  );
};
