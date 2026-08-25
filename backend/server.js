import './src/config/env.js'; // Validate env vars first — exits on failure
import { testConnection } from './src/config/db.js';
import app from './app.js';
import env from './src/config/env.js';

const PORT = env.port || 5000;

const startServer = async () => {
  try {
    // Verify PostgreSQL connectivity before accepting traffic
    await testConnection();

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running in ${env.nodeEnv} mode`);
      console.log(`   Local:   http://localhost:${PORT}`);
      console.log(`   Health:  http://localhost:${PORT}/api/health\n`);
    });
  } catch (err) {
    console.error('\n[STARTUP ERROR] Failed to connect to database:');
    console.error(`  ${err.message}\n`);
    console.error('Check your DB_* environment variables and ensure PostgreSQL is running.');
    process.exit(1);
  }
};

startServer();
