/**
 * notFound.middleware.js
 *
 * Catches all requests that didn't match any registered route.
 * Returns a consistent JSON 404 (never HTML).
 *
 * Must be registered AFTER all routes and BEFORE the error middleware.
 */
const notFoundMiddleware = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export default notFoundMiddleware;
