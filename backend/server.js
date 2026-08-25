import './src/config/env.js';            // Validate env vars first — exits on missing vars
import { testConnection } from './src/database/index.js';
import app               from './app.js';
import env               from './src/config/env.js';

const PORT = env.port || 5000;

const startServer = async () => {
  try {
    // Verify PostgreSQL connection
    await testConnection();
  } catch (err) {
    console.warn('\n⚠️  [DB NOTICE] PostgreSQL connection check:');
    console.warn(`   ${err.message}`);
    console.warn('   Update DB_PASSWORD in backend/.env with your local PostgreSQL password.\n');
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${env.nodeEnv} mode`);
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`   Health:  http://localhost:${PORT}/api/health`);
    console.log(`   API v1:  http://localhost:${PORT}/api/v1\n`);
  });
};

startServer();
