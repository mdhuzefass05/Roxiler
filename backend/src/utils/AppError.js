/**
 * AppError — Custom operational error class.
 *
 * Use this for all known, expected error conditions (e.g. "User not found",
 * "Unauthorized"). The global error handler checks `isOperational` to
 * distinguish these from unexpected programming bugs.
 *
 * @example
 *   throw new AppError('Store not found.', 404);
 *   throw new AppError('Email already registered.', 409);
 */
class AppError extends Error {
  /**
   * @param {string} message    - Human-readable error message
   * @param {number} statusCode - HTTP status code (default 500)
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Marks as a known, handled error
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
