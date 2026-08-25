import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import * as ratingValidator from '../../validators/rating.validator.js';
import * as ratingController from '../../controllers/rating.controller.js';

const router = Router();

router.use(authenticate);

// NORMAL_USER: get their own submitted ratings history
router.get('/my-ratings',
  authorize('NORMAL_USER'),
  ratingController.getMyRatings
);

// NORMAL_USER: submit a rating
router.post('/',
  authorize('NORMAL_USER'),
  ratingValidator.submitRating,
  validate,
  ratingController.submitRating
);

// NORMAL_USER: update their rating for a store (supports both PUT and PATCH)
router.put('/:storeId',
  authorize('NORMAL_USER'),
  ratingValidator.updateRating,
  validate,
  ratingController.updateRating
);

router.patch('/:storeId',
  authorize('NORMAL_USER'),
  ratingValidator.updateRating,
  validate,
  ratingController.updateRating
);

// STORE_OWNER: post an official reply to a review
router.post('/:id/reply',
  authorize('STORE_OWNER'),
  ratingValidator.replyToRating,
  validate,
  ratingController.replyToRating
);

// Any authenticated user: view ratings for a store
router.get('/store/:storeId',
  ratingValidator.storeIdParam,
  validate,
  ratingController.getRatingsByStore
);

export default router;
