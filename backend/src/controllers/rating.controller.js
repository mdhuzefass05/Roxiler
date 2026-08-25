import * as ratingService from '../services/rating.service.js';
import { sendSuccess } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Rating Controller
 */

/**
 * POST /api/v1/ratings
 * NORMAL_USER only.
 */
export const submitRating = asyncHandler(async (req, res) => {
  const rating = await ratingService.submitRating(req.user.id, req.body);
  return sendSuccess(res, {
    data: rating,
    message: 'Rating submitted successfully.',
    status: 201,
  });
});

/**
 * PATCH / PUT /api/v1/ratings/:storeId
 * NORMAL_USER only — update their existing rating.
 */
export const updateRating = asyncHandler(async (req, res) => {
  const ratingValue = req.body.rating_value !== undefined ? req.body.rating_value : req.body.rating;
  const comment = req.body.comment !== undefined ? req.body.comment : undefined;
  const rating = await ratingService.updateRating(
    req.user.id,
    req.params.storeId,
    ratingValue,
    comment
  );
  return sendSuccess(res, {
    data: rating,
    message: 'Rating updated successfully.',
  });
});

/**
 * GET /api/v1/ratings/my-ratings
 * NORMAL_USER only — get all ratings submitted by current user.
 */
export const getMyRatings = asyncHandler(async (req, res) => {
  const ratings = await ratingService.getMyRatings(req.user.id);
  return sendSuccess(res, {
    data: ratings,
    message: 'User ratings retrieved successfully.',
  });
});

/**
 * GET /api/v1/ratings/store/:storeId
 * Any authenticated user.
 */
export const getRatingsByStore = asyncHandler(async (req, res) => {
  const ratings = await ratingService.getRatingsByStore(req.params.storeId);
  return sendSuccess(res, {
    data: ratings,
    message: 'Ratings retrieved successfully.',
  });
});
