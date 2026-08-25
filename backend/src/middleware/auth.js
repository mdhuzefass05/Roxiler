import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';

/**
 * Middleware: Verifies the JWT in the Authorization header.
 * Attaches the decoded user payload to req.user on success.
 *
 * Expected header format:
 *   Authorization: Bearer <token>
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, {
      message: 'Authentication required. Please provide a valid token.',
      status: 401,
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { id, role, email, iat, exp }
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, { message: 'Token expired. Please log in again.', status: 401 });
    }
    return sendError(res, { message: 'Invalid token.', status: 401 });
  }
};

/**
 * Middleware factory: Restricts access to specific user roles.
 * Must be used AFTER authenticate middleware.
 *
 * @param {...string} roles - Allowed role names (e.g., 'SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER')
 * @returns {import('express').RequestHandler}
 *
 * @example
 *   router.get('/admin', authenticate, authorize('SYSTEM_ADMIN'), handler);
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, {
        message: 'Forbidden. You do not have permission to access this resource.',
        status: 403,
      });
    }
    return next();
  };
};
