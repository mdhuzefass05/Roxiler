import { sendError } from '../utils/response.js';

/**
 * Rating Controller
 * All handlers are stubbed and return 501 Not Implemented.
 * Implement in Phase 4 (Ratings).
 */

/**
 * POST /api/ratings
 * Submit a rating for a store. Requires: NORMAL_USER role.
 */
export const submitRating = (_req, res) => {
  return sendError(res, { message: 'submitRating — not implemented yet.', status: 501 });
};

/**
 * PATCH /api/ratings/:storeId
 * Modify existing rating for a store. Requires: NORMAL_USER role.
 */
export const updateRating = (_req, res) => {
  return sendError(res, { message: 'updateRating — not implemented yet.', status: 501 });
};

/**
 * GET /api/ratings/store/:storeId
 * Get all ratings for a store.
 */
export const getRatingsByStore = (_req, res) => {
  return sendError(res, { message: 'getRatingsByStore — not implemented yet.', status: 501 });
};
