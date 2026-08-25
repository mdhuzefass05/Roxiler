import { Router } from 'express';
import authRoutes   from './auth.routes.js';
import userRoutes   from './user.routes.js';
import storeRoutes  from './store.routes.js';
import ratingRoutes from './rating.routes.js';

const router = Router();

/**
 * API v1 Router
 * Mounted at: /api/v1
 *
 * All sub-routers are registered here.
 * To add a new module (e.g. dashboard), simply:
 *   1. Create src/routes/v1/dashboard.routes.js
 *   2. import dashboardRoutes from './dashboard.routes.js'
 *   3. router.use('/dashboard', dashboardRoutes)
 */
router.use('/auth',    authRoutes);
router.use('/users',   userRoutes);
router.use('/stores',  storeRoutes);
router.use('/ratings', ratingRoutes);

export default router;
