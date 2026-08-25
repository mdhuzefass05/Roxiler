import { Router } from 'express';
import authRoutes   from './auth.routes.js';
import userRoutes   from './user.routes.js';
import storeRoutes  from './store.routes.js';
import ratingRoutes from './rating.routes.js';
import adminRoutes  from './admin.routes.js';

const router = Router();

/**
 * API v1 Router
 * Mounted at: /api/v1
 */
router.use('/auth',    authRoutes);
router.use('/admin',   adminRoutes);
router.use('/users',   userRoutes);
router.use('/stores',  storeRoutes);
router.use('/ratings', ratingRoutes);

export default router;
