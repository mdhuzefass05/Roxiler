import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter.
 * Applied to all /api/v1/* routes.
 *
 * Limits: 100 requests per 15 minutes per IP.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again after 15 minutes.',
  },
});

/**
 * Strict auth limiter.
 * Applied only to /api/v1/auth/login and /api/v1/auth/register.
 *
 * Limits: 10 requests per 15 minutes per IP.
 * Prevents brute-force and credential stuffing attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});
