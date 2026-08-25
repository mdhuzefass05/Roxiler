import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import env from './src/config/env.js';
import errorHandler from './src/middleware/errorHandler.js';

import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import storeRoutes from './src/routes/store.routes.js';
import ratingRoutes from './src/routes/rating.routes.js';

const app = express();

// ──────────────────────────────────────────────
// Core Middleware
// ──────────────────────────────────────────────
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logger (dev: coloured, prod: combined)
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// ──────────────────────────────────────────────
// Health Check (no auth required)
// ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Store Rating API is running.',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ──────────────────────────────────────────────
// API Routes
// ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);

// ──────────────────────────────────────────────
// 404 Handler (unmatched routes)
// ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

// ──────────────────────────────────────────────
// Global Error Handler (must be last)
// ──────────────────────────────────────────────
app.use(errorHandler);

export default app;
