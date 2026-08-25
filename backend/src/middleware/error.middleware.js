import AppError from '../utils/AppError.js';
import env from '../config/env.js';

/**
 * Global error-handling middleware.
 * Must be registered LAST in the Express middleware chain.
 *
 * Handles:
 *   - Operational AppErrors  (thrown deliberately — 4xx / known 5xx)
 *   - PostgreSQL errors       (pg driver error codes)
 *   - JWT errors              (expired / invalid)
 *   - Unexpected errors       (programming bugs — always 500)
 *
 * @type {import('express').ErrorRequestHandler}
 */
// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, _next) => {
  // ── Logging ────────────────────────────────────────────────
  if (env.nodeEnv === 'development') {
    console.error('\n[ERROR]', {
      name: err.name,
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
    });
  } else {
    console.error(`[ERROR] ${err.name}: ${err.message}`);
  }

  // ── Operational (AppError) ─────────────────────────────────
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // ── JWT errors ─────────────────────────────────────────────
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }

  // ── PostgreSQL errors ──────────────────────────────────────
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        return res.status(409).json({
          success: false,
          message: 'A record with this value already exists.',
          detail: env.nodeEnv === 'development' ? err.detail : undefined,
        });
      case '23503': // foreign_key_violation
        return res.status(400).json({ success: false, message: 'Referenced record not found.' });
      case '23502': // not_null_violation
        return res.status(400).json({
          success: false,
          message: `Required field missing: ${err.column}.`,
        });
      case '22P02': // invalid_text_representation (e.g. bad UUID/int)
        return res.status(400).json({ success: false, message: 'Invalid data format.' });
    }
  }

  // ── Validation error from express-validator (passed as Error) ─
  if (err.type === 'validation') {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: err.errors,
    });
  }

  // ── Unexpected / programming errors ───────────────────────
  return res.status(500).json({
    success: false,
    message:
      env.nodeEnv === 'production'
        ? 'An unexpected error occurred. Please try again later.'
        : err.message,
  });
};

export default errorMiddleware;
