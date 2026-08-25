import express    from 'express';
import helmet     from 'helmet';
import cors       from 'cors';
import morgan     from 'morgan';
import crypto     from 'crypto';

import env                  from './src/config/env.js';
import { query }            from './src/database/index.js';
import v1Router             from './src/routes/v1/index.js';
import { generalLimiter }   from './src/middleware/rateLimiter.middleware.js';
import notFoundMiddleware   from './src/middleware/notFound.middleware.js';
import errorMiddleware      from './src/middleware/error.middleware.js';

const app = express();

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── Request Correlation ID ───────────────────────────────────────────────────
app.use((req, res, next) => {
  const reqId = req.headers['x-request-id'] || crypto.randomUUID();
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);
  next();
});

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  })
);

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── HTTP Request Logger ───────────────────────────────────────────────────────
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// ── Health & Readiness Check (with DB probe) ──────────────────────────────────
app.get(['/health', '/api/health'], async (_req, res) => {
  try {
    await query('SELECT 1');
    res.status(200).json({
      status: 'UP',
      success: true,
      database: 'connected',
      message: 'Store Rating API is healthy and operational.',
      version: '1.0.0',
      environment: env.nodeEnv,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'DOWN',
      success: false,
      database: 'disconnected',
      message: 'Database probe failed.',
      timestamp: new Date().toISOString(),
    });
  }
});

// ── API Routes (general rate limiter applied) ─────────────────────────────────
app.use('/api/v1', generalLimiter, v1Router);
app.use('/api', generalLimiter, v1Router);

// ── 404 — Unmatched Routes ────────────────────────────────────────────────────
app.use(notFoundMiddleware);

// ── Global Error Handler (must be last) ───────────────────────────────────────
app.use(errorMiddleware);

export default app;
