import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';
import AppError from '../utils/AppError.js';

/**
 * authenticate — Verifies the JWT in the Authorization header.
 *
 * Attaches the decoded user payload to `req.user` on success.
 * Expected header: `Authorization: Bearer <token>`
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Please provide a valid token.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    req.user = decoded; // { id, role, email, iat, exp }
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, { message: 'Token expired. Please log in again.', status: 401 });
    }
    if (err.name === 'JsonWebTokenError') {
      return sendError(res, { message: 'Invalid token.', status: 401 });
    }
    return sendError(res, { message: err.message, status: err.statusCode || 401 });
  }
};

/**
 * authorize — Restricts access to specific user roles.
 * Must be chained AFTER `authenticate`.
 *
 * @param {...string} roles - Allowed roles: 'SYSTEM_ADMIN' | 'NORMAL_USER' | 'STORE_OWNER'
 * @returns {import('express').RequestHandler}
 *
 * @example
 *   router.get('/admin', authenticate, authorize('SYSTEM_ADMIN'), handler);
 *   router.post('/rate', authenticate, authorize('NORMAL_USER', 'SYSTEM_ADMIN'), handler);
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
