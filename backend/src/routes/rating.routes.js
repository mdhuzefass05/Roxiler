import { Router } from 'express';
import {
  submitRating,
  updateRating,
  getRatingsByStore,
} from '../controllers/rating.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// NORMAL_USER: submit or modify a rating
router.post('/', authorize('NORMAL_USER'), submitRating);
router.patch('/:storeId', authorize('NORMAL_USER'), updateRating);

// Any authenticated user: view ratings for a store
router.get('/store/:storeId', getRatingsByStore);

export default router;
