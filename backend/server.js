import './src/config/env.js';            // Validate env vars first — exits on missing vars
import { testConnection } from './src/database/index.js';
import app               from './app.js';
import env               from './src/config/env.js';

const PORT = env.port || 5000;

const startServer = async () => {
  try {
    // Verify PostgreSQL is reachable before accepting HTTP traffic
    await testConnection();

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running in ${env.nodeEnv} mode`);
      console.log(`   Local:   http://localhost:${PORT}`);
      console.log(`   Health:  http://localhost:${PORT}/api/health`);
      console.log(`   API v1:  http://localhost:${PORT}/api/v1\n`);
    });
  } catch (err) {
    console.error('\n[STARTUP ERROR] Could not connect to PostgreSQL:');
    console.error(`  ${err.message}`);
    console.error('\nCheck your DB_* environment variables and ensure PostgreSQL is running.\n');
    process.exit(1);
  }
};

startServer();
