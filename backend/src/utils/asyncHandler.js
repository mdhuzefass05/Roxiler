/**
 * asyncHandler — Wraps an async Express route handler to automatically
 * forward any thrown errors to the next() error middleware.
 *
 * This eliminates the need for try/catch blocks inside every controller.
 *
 * @param {Function} fn - Async route handler (req, res, next) => Promise
 * @returns {Function} Express middleware
 *
 * @example
 *   router.get('/stores', asyncHandler(async (req, res) => {
 *     const stores = await storeService.getAll();
 *     sendSuccess(res, { data: stores });
 *   }));
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
