/**
 * seed.js — Development database seeder.
 *
 * Creates 1 user per role (3 users total) and 3 sample stores with customer ratings.
 * SAFE AND REPEATABLE: cleans existing records and re-seeds.
 *
 * Usage:
 *   npm run seed
 *
 * Test credentials:
 * ┌────────────────────────────────────────────────────────────────┐
 * │  Role          │ Email                   │ Password    │ Name  │
 * ├────────────────┼─────────────────────────┼─────────────┼───────┤
 * │ SYSTEM_ADMIN   │ admin@storerate.dev     │ Admin@1234  │ Admin │
 * │ STORE_OWNER    │ owner@storerate.dev     │ Owner@1234  │ Owner │
 * │ NORMAL_USER    │ user@storerate.dev      │ User@1234   │ User  │
 * └────────────────┴─────────────────────────┴─────────────┴───────┘
 */

import bcrypt        from 'bcryptjs';
import env           from '../config/env.js';
import { getClient } from './index.js';

if (env.nodeEnv === 'production' && process.env.ALLOW_PROD_SEED !== 'true') {
  console.error('\n❌ [SECURITY GUARD] Database seeding is blocked in production mode.');
  console.error('   To force seed in production, set ALLOW_PROD_SEED=true in environment.\n');
  process.exit(1);
}

const BCRYPT_ROUNDS = 12;

// ── 1 User Per Role (3 Total) ────────────────────────────────────────────────
const SEED_USERS = [
  {
    name:     'System Administrator Alpha',  // 26 chars
    email:    'admin@storerate.dev',
    password: 'Admin@1234',
    address:  '1 Platform HQ, San Francisco, CA 94102',
    role:     'SYSTEM_ADMIN',
  },
  {
    name:     'John Davis Store Owner One',  // 26 chars
    email:    'owner@storerate.dev',
    password: 'Owner@1234',
    address:  '42 Commerce Lane, Austin, TX 73301',
    role:     'STORE_OWNER',
  },
  {
    name:     'Alice Johnson Normal Customer', // 29 chars
    email:    'user@storerate.dev',
    password: 'User@1234',
    address:  '10 Maple Street, Boston, MA 02101',
    role:     'NORMAL_USER',
  },
];

// ── 3 Sample Stores (all owned by STORE_OWNER) ──────────────────────────────
const SEED_STORES = [
  {
    name:       'Tech Mart Electronics Store',    // 27 chars
    email:      'techmart@stores.dev',
    address:    '123 Tech Avenue, Silicon Valley, CA 94025',
    ownerEmail: 'owner@storerate.dev',
  },
  {
    name:       'Fresh Grocery Hub Downtown',     // 26 chars
    email:      'freshgrocery@stores.dev',
    address:    '456 Market Street, Downtown, NY 10001',
    ownerEmail: 'owner@storerate.dev',
  },
  {
    name:       'Fashion Forward Boutique Store', // 30 chars
    email:      'fashionforward@stores.dev',
    address:    '789 Style Boulevard, Los Angeles, CA 90001',
    ownerEmail: 'owner@storerate.dev',
  },
];

// ── Sample Ratings from NORMAL_USER ──────────────────────────────────────────
const SEED_RATINGS = [
  { userEmail: 'user@storerate.dev', storeEmail: 'techmart@stores.dev',       ratingValue: 5 },
  { userEmail: 'user@storerate.dev', storeEmail: 'freshgrocery@stores.dev',   ratingValue: 4 },
  { userEmail: 'user@storerate.dev', storeEmail: 'fashionforward@stores.dev', ratingValue: 3 },
];

const seed = async () => {
  console.log('\n🌱  Store Rating — Database Seeder (1 User Per Role + 3 Stores)');
  console.log('═'.repeat(60));

  const client = await getClient();

  try {
    await client.query('BEGIN');

    // ── Step 1: Clean all existing application records ────────
    console.log('\n🧹 Cleaning existing data …');
    await client.query('DELETE FROM ratings');
    await client.query('DELETE FROM stores');
    await client.query('DELETE FROM users');
    console.log('   ✅ Tables cleaned.');

    // ── Step 2: Hash passwords ────────────────────────────────
    console.log('\n🔐 Hashing passwords (12 rounds) …');
    const hashedUsers = await Promise.all(
      SEED_USERS.map(async (u) => ({
        ...u,
        password_hash: await bcrypt.hash(u.password, BCRYPT_ROUNDS),
      }))
    );

    // ── Step 3: Insert 1 User Per Role ────────────────────────
    console.log('\n👤 Inserting 1 User Per Role …');
    const userIdMap = {};

    for (const u of hashedUsers) {
      const { rows } = await client.query(
        `INSERT INTO users (name, email, password_hash, address, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [u.name, u.email, u.password_hash, u.address, u.role]
      );
      userIdMap[u.email] = rows[0].id;
      console.log(`   ✅ [${u.role.padEnd(12)}] ${u.name} <${u.email}> (id: ${rows[0].id})`);
    }

    // ── Step 4: Insert 3 Sample Stores ────────────────────────
    console.log('\n🏪 Inserting 3 Sample Stores …');
    const storeIdMap = {};

    for (const s of SEED_STORES) {
      const ownerId = userIdMap[s.ownerEmail] || null;
      const { rows } = await client.query(
        `INSERT INTO stores (name, email, address, owner_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [s.name, s.email, s.address, ownerId]
      );
      storeIdMap[s.email] = rows[0].id;
      console.log(`   ✅ "${s.name}" (id: ${rows[0].id}) — Owner: ${s.ownerEmail}`);
    }

    // ── Step 5: Insert Sample Ratings ─────────────────────────
    console.log('\n⭐ Inserting Sample Ratings …');
    for (const r of SEED_RATINGS) {
      const userId  = userIdMap[r.userEmail];
      const storeId = storeIdMap[r.storeEmail];

      if (userId && storeId) {
        await client.query(
          `INSERT INTO ratings (user_id, store_id, rating_value)
           VALUES ($1, $2, $3)`,
          [userId, storeId, r.ratingValue]
        );
        console.log(`   ✅ [${r.ratingValue}★] ${r.userEmail} → ${r.storeEmail}`);
      }
    }

    // ── Step 6: Verify Store Summary View ─────────────────────
    console.log('\n📊 Rating Summary (via store_ratings_summary view):');
    const { rows: summary } = await client.query(
      `SELECT store_name, total_ratings, average_rating
       FROM store_ratings_summary
       ORDER BY average_rating DESC`
    );

    summary.forEach((row) => {
      console.log(
        `   ${row.store_name.padEnd(35)} ` +
        `avg: ${String(row.average_rating).padStart(4)} ★  ` +
        `(${row.total_ratings} rating${row.total_ratings !== 1 ? 's' : ''})`
      );
    });

    await client.query('COMMIT');

    // ── Summary ───────────────────────────────────────────────
    console.log('\n' + '─'.repeat(60));
    console.log('  Database Setup Complete!');
    console.log('\n  Test Credentials:');
    SEED_USERS.forEach((u) => {
      console.log(`  [${u.role.padEnd(12)}] ${u.email.padEnd(24)} → ${u.password}`);
    });
    console.log('─'.repeat(60) + '\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Seed failed — transaction rolled back.');
    console.error(`   ${err.message}\n`);
    throw err;
  } finally {
    client.release();
    process.exit(0);
  }
};

seed().catch((err) => {
  console.error('[SEED ERROR]', err.message);
  process.exit(1);
});
