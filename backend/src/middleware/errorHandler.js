import env from '../config/env.js';

/**
 * Centralized error handling middleware.
 * Must be registered LAST in the Express middleware chain (after all routes).
 *
 * Handles:
 *  - Validation errors (status 400)
 *  - Custom AppErrors
 *  - Unexpected server errors (status 500)
 */

/**
 * Custom application error class.
 * Throw this anywhere in the app for controlled error responses.
 *
 * @example
 *   throw new AppError('User not found', 404);
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Express error handler.
 * @type {import('express').ErrorRequestHandler}
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // Log error details in development
  if (env.nodeEnv === 'development') {
    console.error('[ERROR]', err);
  } else {
    console.error(`[ERROR] ${err.message}`);
  }

  // Handle known operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Handle PostgreSQL errors
  if (err.code) {
    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'A record with this value already exists.',
      });
    }
    if (err.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'Related record not found.',
      });
    }
  }

  // Generic fallback
  return res.status(500).json({
    success: false,
    message: env.nodeEnv === 'production' ? 'Internal server error.' : err.message,
  });
};

export default errorHandler;
