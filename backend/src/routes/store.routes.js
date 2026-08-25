import { Router } from 'express';
import {
  getAllStores,
  getStoreById,
  createStore,
  getMyStore,
} from '../controllers/store.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All store routes require authentication
router.use(authenticate);

// STORE_OWNER: get their own store
router.get('/my-store', authorize('STORE_OWNER'), getMyStore);

// Any authenticated user: browse stores
router.get('/', getAllStores);
router.get('/:id', getStoreById);

// SYSTEM_ADMIN only: create store
router.post('/', authorize('SYSTEM_ADMIN'), createStore);

export default router;
