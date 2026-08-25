import { query } from '../database/index.js';

/**
 * Admin Service — platform statistics, analytics, and administrative operations.
 */

/**
 * Retrieve real-time platform statistics, health metrics, category distribution, leaderboards, and recent activity feeds.
 */
export const getDashboardStats = async () => {
  const [statsRes, topStoresRes, recentRatingsRes, recentUsersRes, categoriesRes] = await Promise.all([
    query(`
      SELECT
        (SELECT COUNT(*)::INTEGER FROM users)                            AS total_users,
        (SELECT COUNT(*)::INTEGER FROM stores)                           AS total_stores,
        (SELECT COUNT(*)::INTEGER FROM ratings)                          AS total_ratings,
        (SELECT COUNT(*)::INTEGER FROM users WHERE role = 'NORMAL_USER') AS total_normal_users,
        (SELECT COUNT(*)::INTEGER FROM users WHERE role = 'STORE_OWNER') AS total_store_owners,
        (SELECT COUNT(*)::INTEGER FROM users WHERE role = 'SYSTEM_ADMIN') AS total_admin_users,
        (SELECT COALESCE(ROUND(AVG(rating_value)::NUMERIC, 2), 0.00) FROM ratings) AS platform_avg_rating,
        (SELECT COUNT(*)::INTEGER FROM ratings WHERE rating_value = 5)   AS five_star_ratings,
        (SELECT COUNT(DISTINCT store_id)::INTEGER FROM ratings)          AS active_stores_rated
    `),
    query(`
      SELECT
        s.id,
        s.name,
        s.address,
        COALESCE(s.category, 'General') AS category,
        COUNT(r.id)::INTEGER AS total_ratings,
        COALESCE(ROUND(AVG(r.rating_value)::NUMERIC, 2), 0.00) AS average_rating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      GROUP BY s.id, s.name, s.address, s.category
      ORDER BY average_rating DESC, total_ratings DESC
      LIMIT 5
    `),
    query(`
      SELECT
        r.id,
        r.rating_value,
        r.comment,
        r.created_at,
        u.name AS user_name,
        u.email AS user_email,
        s.name AS store_name
      FROM ratings r
      JOIN users u ON u.id = r.user_id
      JOIN stores s ON s.id = r.store_id
      ORDER BY r.created_at DESC
      LIMIT 5
    `),
    query(`
      SELECT
        id,
        name,
        email,
        role,
        created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `),
    query(`
      SELECT
        COALESCE(category, 'General') AS category,
        COUNT(*)::INTEGER AS count
      FROM stores
      GROUP BY category
      ORDER BY count DESC
    `),
  ]);

  const stats = statsRes.rows[0] || {
    total_users: 0,
    total_stores: 0,
    total_ratings: 0,
    total_normal_users: 0,
    total_store_owners: 0,
    total_admin_users: 0,
    platform_avg_rating: 0.0,
    five_star_ratings: 0,
    active_stores_rated: 0,
  };

  const parsedCounts = {
    total_users: parseInt(stats.total_users || 0, 10),
    total_stores: parseInt(stats.total_stores || 0, 10),
    total_ratings: parseInt(stats.total_ratings || 0, 10),
    total_normal_users: parseInt(stats.total_normal_users || 0, 10),
    total_store_owners: parseInt(stats.total_store_owners || 0, 10),
    total_admin_users: parseInt(stats.total_admin_users || 0, 10),
    platform_avg_rating: parseFloat(stats.platform_avg_rating || 0),
    five_star_ratings: parseInt(stats.five_star_ratings || 0, 10),
    active_stores_rated: parseInt(stats.active_stores_rated || 0, 10),
  };

  return {
    ...stats,
    ...parsedCounts,
    counts: parsedCounts,
    top_stores: topStoresRes.rows.map((row) => ({
      id: row.id,
      name: row.name,
      address: row.address,
      category: row.category,
      average_rating: parseFloat(row.average_rating || 0),
      total_ratings: parseInt(row.total_ratings || 0, 10),
    })),
    recent_ratings: recentRatingsRes.rows.map((row) => ({
      id: row.id,
      rating_value: row.rating_value,
      comment: row.comment,
      created_at: row.created_at,
      user_name: row.user_name,
      user_email: row.user_email,
      store_name: row.store_name,
    })),
    recent_users: recentUsersRes.rows,
    category_distribution: categoriesRes.rows.map((row) => ({
      category: row.category,
      count: parseInt(row.count, 10),
    })),
  };
};
