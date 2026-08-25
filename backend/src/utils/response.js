/**
 * Standardised API response helpers.
 * All API responses follow the same envelope shape:
 *   { success, message, data?, errors? }
 */

/**
 * Send a successful response.
 * @param {import('express').Response} res
 * @param {Object} options
 * @param {any}    options.data    - Response payload
 * @param {string} options.message - Human-readable message
 * @param {number} options.status  - HTTP status code (default 200)
 */
export const sendSuccess = (res, { data = null, message = 'Success', status = 200 } = {}) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {Object} options
 * @param {string} options.message - Error message
 * @param {number} options.status  - HTTP status code (default 500)
 * @param {any}    options.errors  - Optional validation errors array
 */
export const sendError = (res, { message = 'Internal Server Error', status = 500, errors = null } = {}) => {
  const body = { success: false, message };
  if (errors) {
    body.errors = errors;
  }
  return res.status(status).json(body);
};
