/**
 * reset.js — Development database reset utility.
 *
 * ⚠️  WARNING: This DROPS all application tables and data.
 * Use only in development to start fresh.
 *
 * Usage:
 *   npm run db:reset
 *
 * What it does:
 *   1. Drops all app tables (ratings → stores → users → _migrations)
 *   2. Drops the user_role ENUM
 *   3. Drops all app functions and triggers
 *   4. Drops the store_ratings_summary view
 *   5. Re-runs migrations
 *   6. Re-runs seeds
 *
 * After this script completes, the DB is in a clean seeded state.
 */

import '../config/env.js';
import { getClient } from './index.js';
import { execSync }  from 'child_process';

const reset = async () => {
  console.log('\n🔄  Store Rating — Database Reset');
  console.log('═'.repeat(50));
  console.log('⚠️  WARNING: All data will be dropped!\n');

  const client = await getClient();

  try {
    await client.query('BEGIN');

    console.log('🗑️  Dropping application objects …\n');

    // Drop triggers first (they depend on functions)
    await client.query(`
      DROP TRIGGER IF EXISTS trg_ratings_role_guard   ON ratings;
      DROP TRIGGER IF EXISTS trg_ratings_updated_at   ON ratings;
      DROP TRIGGER IF EXISTS trg_stores_updated_at    ON stores;
      DROP TRIGGER IF EXISTS trg_users_updated_at     ON users;
    `);
    console.log('   ✅ Triggers dropped.');

    // Drop view
    await client.query('DROP VIEW IF EXISTS store_ratings_summary CASCADE');
    console.log('   ✅ View dropped.');

    // Drop tables (FK order: ratings → stores → users)
    await client.query(`
      DROP TABLE IF EXISTS ratings     CASCADE;
      DROP TABLE IF EXISTS stores      CASCADE;
      DROP TABLE IF EXISTS users       CASCADE;
      DROP TABLE IF EXISTS _migrations CASCADE;
    `);
    console.log('   ✅ Tables dropped.');

    // Drop functions
    await client.query(`
      DROP FUNCTION IF EXISTS fn_prevent_store_owner_rating() CASCADE;
      DROP FUNCTION IF EXISTS fn_set_updated_at() CASCADE;
    `);
    console.log('   ✅ Functions dropped.');

    // Drop ENUM type
    await client.query('DROP TYPE IF EXISTS user_role CASCADE');
    console.log('   ✅ ENUM type dropped.');

    await client.query('COMMIT');
    console.log('\n✅ Database cleared successfully.\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Reset failed:', err.message);
    client.release();
    process.exit(1);
  }

  client.release();

  // Re-run migrations + seed
  console.log('Running migrations …');
  execSync('node src/database/migrate.js', { stdio: 'inherit' });

  console.log('\nRunning seed …');
  execSync('node src/database/seed.js', { stdio: 'inherit' });
};

reset().catch((err) => {
  console.error('[RESET ERROR]', err.message);
  process.exit(1);
});
