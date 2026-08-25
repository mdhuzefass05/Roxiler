import './src/config/env.js';            // Validate env vars first — exits on missing vars
import pool, { testConnection } from './src/database/index.js';
import app               from './app.js';
import env               from './src/config/env.js';

const PORT = env.port || 5000;
let server;

const startServer = async () => {
  try {
    // Verify PostgreSQL connection
    await testConnection();
  } catch (err) {
    console.warn('\n⚠️  [DB NOTICE] PostgreSQL connection check:');
    console.warn(`   ${err.message}`);
    console.warn('   Update DB_PASSWORD in backend/.env with your local PostgreSQL password.\n');
  }

  server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${env.nodeEnv} mode`);
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`   Health:  http://localhost:${PORT}/api/health`);
    console.log(`   API v1:  http://localhost:${PORT}/api/v1\n`);
  });
};

// ── Graceful Shutdown ────────────────────────────────────────────────────────
const gracefulShutdown = (signal) => {
  console.log(`\n[SYSTEM] ${signal} signal received. Closing HTTP server and database pool...`);
  if (server) {
    server.close(async () => {
      console.log('[SYSTEM] HTTP server closed.');
      try {
        await pool.end();
        console.log('[SYSTEM] PostgreSQL pool drained.');
      } catch (err) {
        console.error('[SYSTEM] Error draining pool:', err.message);
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ── Unhandled Exceptions & Rejections ────────────────────────────────────────
process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception thrown:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

startServer();
