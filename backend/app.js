import express    from 'express';
import helmet     from 'helmet';
import cors       from 'cors';
import morgan     from 'morgan';

import env                  from './src/config/env.js';
import v1Router             from './src/routes/v1/index.js';
import { generalLimiter }   from './src/middleware/rateLimiter.middleware.js';
import notFoundMiddleware   from './src/middleware/notFound.middleware.js';
import errorMiddleware      from './src/middleware/error.middleware.js';

const app = express();

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── HTTP Request Logger ───────────────────────────────────────────────────────
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// ── Health Check (unauthenticated, no rate limit) ─────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Store Rating API is running.',
    version: 'v1',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ── API v1 Routes (general rate limiter applied) ──────────────────────────────
app.use('/api/v1', generalLimiter, v1Router);

// ── 404 — Unmatched Routes ────────────────────────────────────────────────────
app.use(notFoundMiddleware);

// ── Global Error Handler (must be last) ───────────────────────────────────────
app.use(errorMiddleware);

export default app;
