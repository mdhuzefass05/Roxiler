import { Router } from 'express';
import { authenticate }                  from '../../middleware/auth.middleware.js';
import { authLimiter }                   from '../../middleware/rateLimiter.middleware.js';
import validate                          from '../../middleware/validate.middleware.js';
import * as authValidator                from '../../validators/auth.validator.js';
import * as authController               from '../../controllers/auth.controller.js';

const router = Router();

// ── Public routes (rate limited) ──────────────────────────────────────────────
router.post('/register', authLimiter, authValidator.register,        validate, authController.register);
router.post('/login',    authLimiter, authValidator.login,           validate, authController.login);

// ── Protected routes ──────────────────────────────────────────────────────────
router.get( '/me',              authenticate, authController.getMe);
router.patch('/change-password',authenticate, authValidator.changePassword, validate, authController.changePassword);
router.put(  '/change-password',authenticate, authValidator.changePassword, validate, authController.changePassword);

export default router;
