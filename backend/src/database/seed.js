/**
 * seed.js — Development database seeder.
 *
 * Creates realistic test accounts for all three roles and sample ratings.
 * SAFE AND REPEATABLE: deletes seed data first (by email), then re-inserts.
 * Will NOT affect data outside the known seed emails.
 *
 * Usage:
 *   npm run seed
 *
 * Test credentials (all follow the same pattern):
 * ┌────────────────────────────────────────────────────────┐
 * │  Role          │ Email                   │ Password    │
 * ├────────────────┼─────────────────────────┼─────────────┤
 * │ SYSTEM_ADMIN   │ admin@storerate.dev      │ Admin@1234  │
 * │ STORE_OWNER    │ john.owner@storerate.dev │ Owner@1234  │
 * │ STORE_OWNER    │ mary.owner@storerate.dev │ Owner@1234  │
 * │ NORMAL_USER    │ alice@storerate.dev      │ Alice@1234  │
 * │ NORMAL_USER    │ bob@storerate.dev        │ Bob@12345   │
 * │ NORMAL_USER    │ carol@storerate.dev      │ Carol@1234  │
 * │ NORMAL_USER    │ david@storerate.dev      │ David@1234  │
 * └────────────────┴─────────────────────────┴─────────────┘
 */

import bcrypt            from 'bcryptjs';
import '../config/env.js';
import { getClient }     from './index.js';

// ── Seed Data Definitions ─────────────────────────────────────────────────────

const BCRYPT_ROUNDS = 12;

const SEED_USERS = [
  // ── SYSTEM_ADMIN ────────────────────────────────────────────
  {
    name:     'System Administrator Alpha',  // 26 chars ✓
    email:    'admin@storerate.dev',
    password: 'Admin@1234',
    address:  '1 Platform HQ, San Francisco, CA 94102',
    role:     'SYSTEM_ADMIN',
  },

  // ── STORE_OWNERs ─────────────────────────────────────────────
  {
    name:     'John Davis Store Owner One',  // 26 chars ✓
    email:    'john.owner@storerate.dev',
    password: 'Owner@1234',
    address:  '42 Commerce Lane, Austin, TX 73301',
    role:     'STORE_OWNER',
  },
  {
    name:     'Mary Wilson Shop Manager Pro', // 28 chars ✓
    email:    'mary.owner@storerate.dev',
    password: 'Owner@1234',
    address:  '88 Retail Boulevard, Chicago, IL 60601',
    role:     'STORE_OWNER',
  },

  // ── NORMAL_USERs ─────────────────────────────────────────────
  {
    name:     'Alice Johnson Normal Customer', // 29 chars ✓
    email:    'alice@storerate.dev',
    password: 'Alice@1234',
    address:  '10 Maple Street, Boston, MA 02101',
    role:     'NORMAL_USER',
  },
  {
    name:     'Bob William Smith Shopper',     // 25 chars ✓
    email:    'bob@storerate.dev',
    password: 'Bob@12345',
    address:  '22 Oak Avenue, Denver, CO 80201',
    role:     'NORMAL_USER',
  },
  {
    name:     'Carol Anne Davis Buyer Pro',    // 26 chars ✓
    email:    'carol@storerate.dev',
    password: 'Carol@1234',
    address:  '5 Pine Road, Seattle, WA 98101',
    role:     'NORMAL_USER',
  },
  {
    name:     'David Michael Wilson User',     // 25 chars ✓
    email:    'david@storerate.dev',
    password: 'David@1234',
    address:  '77 Elm Court, Miami, FL 33101',
    role:     'NORMAL_USER',
  },
];

const SEED_STORE_EMAILS = [
  'techmart@stores.dev',
  'freshgrocery@stores.dev',
  'fashionforward@stores.dev',
];

// Ratings are defined after users and stores are created (keyed by email)
const SEED_RATINGS = [
  // Alice rates all three stores
  { userEmail: 'alice@storerate.dev', storeEmail: 'techmart@stores.dev',       ratingValue: 5 },
  { userEmail: 'alice@storerate.dev', storeEmail: 'freshgrocery@stores.dev',   ratingValue: 4 },
  { userEmail: 'alice@storerate.dev', storeEmail: 'fashionforward@stores.dev', ratingValue: 3 },

  // Bob rates two stores
  { userEmail: 'bob@storerate.dev',   storeEmail: 'techmart@stores.dev',       ratingValue: 4 },
  { userEmail: 'bob@storerate.dev',   storeEmail: 'freshgrocery@stores.dev',   ratingValue: 5 },

  // Carol rates two stores
  { userEmail: 'carol@storerate.dev', storeEmail: 'techmart@stores.dev',       ratingValue: 3 },
  { userEmail: 'carol@storerate.dev', storeEmail: 'fashionforward@stores.dev', ratingValue: 4 },

  // David rates two stores
  { userEmail: 'david@storerate.dev', storeEmail: 'freshgrocery@stores.dev',   ratingValue: 2 },
  { userEmail: 'david@storerate.dev', storeEmail: 'fashionforward@stores.dev', ratingValue: 5 },
];

// ── Seed Runner ───────────────────────────────────────────────────────────────

const seed = async () => {
  console.log('\n🌱  Store Rating — Database Seeder');
  console.log('═'.repeat(50));

  const client = await getClient();

  try {
    await client.query('BEGIN');

    // ── Step 1: Clean up existing seed data ────────────────────
    console.log('\n🧹 Cleaning existing seed data …');

    const seedEmails = SEED_USERS.map((u) => u.email);

    // Delete ratings first (FK constraint order)
    await client.query(
      `DELETE FROM ratings
       WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1::text[]))`,
      [seedEmails]
    );

    // Delete stores seeded previously
    await client.query(
      'DELETE FROM stores WHERE email = ANY($1::text[])',
      [SEED_STORE_EMAILS]
    );

    // Delete seed users
    await client.query(
      'DELETE FROM users WHERE email = ANY($1::text[])',
      [seedEmails]
    );

    console.log('   ✅ Existing seed data cleared.');

    // ── Step 2: Hash passwords ──────────────────────────────────
    console.log('\n🔐 Hashing passwords …');
    const hashedUsers = await Promise.all(
      SEED_USERS.map(async (u) => ({
        ...u,
        password_hash: await bcrypt.hash(u.password, BCRYPT_ROUNDS),
      }))
    );
    console.log(`   ✅ ${hashedUsers.length} password(s) hashed (${BCRYPT_ROUNDS} rounds).`);

    // ── Step 3: Insert users ────────────────────────────────────
    console.log('\n👤 Inserting users …');
    const userIdMap = {}; // email → id

    for (const u of hashedUsers) {
      const { rows } = await client.query(
        `INSERT INTO users (name, email, password_hash, address, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [u.name, u.email, u.password_hash, u.address, u.role]
      );
      userIdMap[u.email] = rows[0].id;
      console.log(
        `   ✅ [${u.role.padEnd(12)}] ${u.name} <${u.email}> (id: ${rows[0].id})`
      );
    }

    // ── Step 4: Insert stores ────────────────────────────────────
    console.log('\n🏪 Inserting stores …');

    const storeDefinitions = [
      {
        name:    'Tech Mart Electronics Store',
        email:   'techmart@stores.dev',
        address: '123 Tech Avenue, Silicon Valley, CA 94025',
        ownerEmail: 'john.owner@storerate.dev',
      },
      {
        name:    'Fresh Grocery Hub Downtown',
        email:   'freshgrocery@stores.dev',
        address: '456 Market Street, Downtown, NY 10001',
        ownerEmail: 'mary.owner@storerate.dev',
      },
      {
        name:    'Fashion Forward Boutique',
        email:   'fashionforward@stores.dev',
        address: '789 Style Boulevard, Los Angeles, CA 90001',
        ownerEmail: 'john.owner@storerate.dev',
      },
    ];

    const storeIdMap = {}; // email → id

    for (const s of storeDefinitions) {
      const ownerId = userIdMap[s.ownerEmail] || null;
      const { rows } = await client.query(
        `INSERT INTO stores (name, email, address, owner_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [s.name, s.email, s.address, ownerId]
      );
      storeIdMap[s.email] = rows[0].id;
      console.log(
        `   ✅ "${s.name}" (id: ${rows[0].id}) — owner: ${s.ownerEmail}`
      );
    }

    // ── Step 5: Insert ratings ────────────────────────────────────
    console.log('\n⭐ Inserting ratings …');

    for (const r of SEED_RATINGS) {
      const userId  = userIdMap[r.userEmail];
      const storeId = storeIdMap[r.storeEmail];

      if (!userId || !storeId) {
        console.warn(`   ⚠️  Skipping rating — missing user or store.`);
        continue;
      }

      await client.query(
        `INSERT INTO ratings (user_id, store_id, rating_value)
         VALUES ($1, $2, $3)`,
        [userId, storeId, r.ratingValue]
      );
      console.log(
        `   ✅ [${r.ratingValue}★] ${r.userEmail} → ${r.storeEmail}`
      );
    }

    // ── Step 6: Verify averages via view ──────────────────────────
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

    // ── Summary ────────────────────────────────────────────────
    console.log('\n' + '─'.repeat(50));
    console.log('  Seed complete!');
    console.log('\n  Test credentials:');
    SEED_USERS.forEach((u) => {
      console.log(`  [${u.role.padEnd(12)}] ${u.email.padEnd(28)} → ${u.password}`);
    });
    console.log('─'.repeat(50) + '\n');
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
