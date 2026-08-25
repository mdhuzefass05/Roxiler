/**
 * migrate.js — Database migration runner.
 *
 * Reads all *.sql files from src/database/migrations/ in alphabetical order,
 * tracks which have been applied in a `_migrations` table, and skips any
 * already-applied files. This makes it safe to run repeatedly.
 *
 * Usage:
 *   npm run migrate
 *
 * What it does:
 *   1. Creates a `_migrations` tracking table (if not exists)
 *   2. Reads migration files in sorted order
 *   3. Skips already-applied migrations
 *   4. Applies pending migrations inside a transaction per file
 *   5. Records each applied migration in `_migrations`
 */

import { readdir, readFile } from 'fs/promises';
import path                  from 'path';
import { fileURLToPath }     from 'url';

// Load and validate environment variables before anything else
import '../config/env.js';
import { getClient } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

const runMigrations = async () => {
  console.log('\n🗄️  Store Rating — Database Migration Runner');
  console.log('═'.repeat(50));

  const client = await getClient();

  try {
    // ── Step 1: Ensure tracking table exists ────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id          SERIAL       PRIMARY KEY,
        filename    VARCHAR(255) NOT NULL,
        applied_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_migration_filename UNIQUE (filename)
      )
    `);

    // ── Step 2: Get list of migration files ──────────────────
    const allFiles = await readdir(MIGRATIONS_DIR);
    const sqlFiles = allFiles
      .filter((f) => f.endsWith('.sql'))
      .sort(); // alphabetical = chronological (001_, 002_, …)

    if (sqlFiles.length === 0) {
      console.log('\n⚠️  No migration files found in migrations/');
      return;
    }

    console.log(`\nFound ${sqlFiles.length} migration file(s).\n`);

    // ── Step 3: Check which are already applied ───────────────
    const { rows: applied } = await client.query(
      'SELECT filename FROM _migrations'
    );
    const appliedSet = new Set(applied.map((r) => r.filename));

    // ── Step 4: Apply pending migrations ─────────────────────
    let appliedCount = 0;
    let skippedCount = 0;

    for (const file of sqlFiles) {
      if (appliedSet.has(file)) {
        console.log(`  ⏭  Skipped  ${file} (already applied)`);
        skippedCount++;
        continue;
      }

      console.log(`  ⏳ Applying ${file} …`);
      const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8');

      try {
        // Run each migration in its own transaction
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO _migrations (filename) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');

        console.log(`  ✅ Applied  ${file}`);
        appliedCount++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  ❌ Failed   ${file}`);
        console.error(`     ${err.message}`);
        throw err; // Stop on first failure
      }
    }

    // ── Summary ───────────────────────────────────────────────
    console.log('\n' + '─'.repeat(50));
    console.log(`  Applied : ${appliedCount}`);
    console.log(`  Skipped : ${skippedCount}`);
    console.log('─'.repeat(50));
    console.log('\n✨ Migrations complete.\n');
  } finally {
    client.release();
    process.exit(0);
  }
};

runMigrations().catch((err) => {
  console.error('\n[MIGRATE ERROR]', err.message);
  process.exit(1);
});
