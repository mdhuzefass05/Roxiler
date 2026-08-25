import { validationResult } from 'express-validator';
import { sendError } from '../utils/response.js';

/**
 * Middleware: Checks for express-validator errors after validation chains run.
 * Returns a 422 with the first error per field if validation fails.
 *
 * @example
 *   router.post('/register',
 *     [body('email').isEmail(), body('password').isLength({ min: 8 })],
 *     validate,      // <-- place this here
 *     authController.register
 *   );
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return sendError(res, {
      message: 'Validation failed.',
      status: 422,
      errors: errors.array({ onlyFirstError: true }),
    });
  }

  return next();
};

export default validate;
