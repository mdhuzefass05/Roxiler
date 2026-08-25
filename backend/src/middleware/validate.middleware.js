import { validationResult } from 'express-validator';
import { sendError } from '../utils/response.js';

/**
 * validate — Checks for express-validator errors after validation chains run.
 *
 * Place this middleware AFTER the validator chain array and BEFORE the controller.
 * Returns 422 with structured error list if validation fails.
 *
 * @example
 *   router.post('/register',
 *     authValidator.register,   // array of validation chains
 *     validate,                 // this middleware
 *     asyncHandler(authController.register)
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
