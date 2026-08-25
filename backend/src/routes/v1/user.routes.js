import { Router } from 'express';
import { authenticate, authorize }  from '../../middleware/auth.middleware.js';
import validate                     from '../../middleware/validate.middleware.js';
import * as userValidator           from '../../validators/user.validator.js';
import * as userController          from '../../controllers/user.controller.js';

const router = Router();

// All user management routes require SYSTEM_ADMIN role
router.use(authenticate, authorize('SYSTEM_ADMIN'));

router.get( '/',    userValidator.listUsers,               validate, userController.getAllUsers);
router.post('/',    userValidator.createUser,              validate, userController.createUser);
router.get( '/:id', userValidator.idParam,                validate, userController.getUserById);
router.delete('/:id', userValidator.idParam,              validate, userController.deleteUser);

export default router;
