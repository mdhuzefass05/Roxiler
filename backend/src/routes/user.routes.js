import { Router } from 'express';
import { getAllUsers, getUserById, deleteUser } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All user routes require SYSTEM_ADMIN role
router.use(authenticate, authorize('SYSTEM_ADMIN'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.delete('/:id', deleteUser);

export default router;
