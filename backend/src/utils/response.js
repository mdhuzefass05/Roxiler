/**
 * Standardised API response helpers.
 *
 * Every API response follows the same envelope:
 *   { success: bool, message: string, data?: any, meta?: any, errors?: any[] }
 */

/**
 * Send a successful JSON response.
 *
 * @param {import('express').Response} res
 * @param {Object} options
 * @param {any}    [options.data=null]      - Response payload
 * @param {any}    [options.meta=null]      - Pagination / extra metadata
 * @param {string} [options.message='Success']
 * @param {number} [options.status=200]
 */
export const sendSuccess = (
  res,
  { data = null, meta = null, message = 'Success', status = 200 } = {}
) => {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
};

/**
 * Send an error JSON response.
 *
 * @param {import('express').Response} res
 * @param {Object} options
 * @param {string} [options.message='Internal Server Error']
 * @param {number} [options.status=500]
 * @param {any}    [options.errors=null] - Validation errors array
 */
export const sendError = (
  res,
  { message = 'Internal Server Error', status = 500, errors = null } = {}
) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(status).json(body);
};
