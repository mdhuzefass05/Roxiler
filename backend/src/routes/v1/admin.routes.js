import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import * as adminController from '../../controllers/admin.controller.js';

const router = Router();

// All admin routes strictly require authentication and SYSTEM_ADMIN role
router.use(authenticate, authorize('SYSTEM_ADMIN'));

router.get('/stats', adminController.getDashboardStats);

export default router;
