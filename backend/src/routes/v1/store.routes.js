import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import validate                    from '../../middleware/validate.middleware.js';
import * as storeValidator         from '../../validators/store.validator.js';
import * as storeController        from '../../controllers/store.controller.js';

const router = Router();

// All store routes require authentication
router.use(authenticate);

// STORE_OWNER: get their own store, customer ratings, and rating statistics
// NOTE: must be defined BEFORE /:id to prevent "my-store" matching as an id
router.get('/my-store', authorize('STORE_OWNER'), storeController.getMyStore);
router.get('/my-store/ratings', authorize('STORE_OWNER'), storeController.getMyStoreRatings);
router.get('/my-store/stats', authorize('STORE_OWNER'), storeController.getMyStoreStats);

// Any authenticated user: browse stores
router.get( '/',    storeValidator.listStores,  validate, storeController.getAllStores);
router.get( '/:id', storeValidator.idParam,     validate, storeController.getStoreById);

// SYSTEM_ADMIN only: create, update, and delete stores
router.post('/',    authorize('SYSTEM_ADMIN'), storeValidator.createStore, validate, storeController.createStore);
router.put( '/:id', authorize('SYSTEM_ADMIN'), storeValidator.updateStore, validate, storeController.updateStore);
router.delete('/:id', authorize('SYSTEM_ADMIN'), storeValidator.idParam, validate, storeController.deleteStore);

export default router;
