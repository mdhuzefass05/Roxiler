import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import validate                    from '../../middleware/validate.middleware.js';
import * as storeValidator         from '../../validators/store.validator.js';
import * as storeController        from '../../controllers/store.controller.js';

const router = Router();

// All store routes require authentication
router.use(authenticate);

// STORE_OWNER: get their own store and customer ratings
// NOTE: must be defined BEFORE /:id to prevent "my-store" matching as an id
router.get('/my-store', authorize('STORE_OWNER'), storeController.getMyStore);
router.get('/my-store/ratings', authorize('STORE_OWNER'), storeController.getMyStoreRatings);

// Any authenticated user: browse stores
router.get( '/',    storeValidator.listStores,  validate, storeController.getAllStores);
router.get( '/:id', storeValidator.idParam,     validate, storeController.getStoreById);

// SYSTEM_ADMIN only: create a store
router.post('/', authorize('SYSTEM_ADMIN'), storeValidator.createStore, validate, storeController.createStore);

export default router;
