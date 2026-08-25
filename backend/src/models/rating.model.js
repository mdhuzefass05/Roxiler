import { query } from '../database/index.js';

/**
 * Rating Model — raw SQL query functions.
 * Schema defined in: src/database/migrations/001_initial.sql
 */

export const findByUserAndStore = async (userId, storeId) => {
  const { rows } = await query(
    'SELECT * FROM ratings WHERE user_id = $1 AND store_id = $2 LIMIT 1',
    [userId, storeId]
  );
  return rows[0] || null;
};

export const findByStoreId = async (storeId) => {
  const { rows } = await query(
    `SELECT r.*, u.name AS user_name
     FROM ratings r
     JOIN users u ON u.id = r.user_id
     WHERE r.store_id = $1
     ORDER BY r.created_at DESC`,
    [storeId]
  );
  return rows;
};

export const findByUserId = async (userId) => {
  const { rows } = await query(
    `SELECT r.*, s.name AS store_name
     FROM ratings r
     JOIN stores s ON s.id = r.store_id
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC`,
    [userId]
  );
  return rows;
};

export const createRating = async ({ userId, storeId, rating }) => {
  const { rows } = await query(
    `INSERT INTO ratings (user_id, store_id, rating)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, storeId, rating]
  );
  return rows[0];
};

export const updateRating = async (userId, storeId, rating) => {
  const { rows } = await query(
    `UPDATE ratings
     SET rating = $1
     WHERE user_id = $2 AND store_id = $3
     RETURNING *`,
    [rating, userId, storeId]
  );
  return rows[0] || null;
};
