/**
 * seed.js — Development database seeder with authentic Indian business and user datasets.
 *
 * Populates:
 * - 12+ Indian Users across SYSTEM_ADMIN, STORE_OWNER, and NORMAL_USER personas
 * - 14+ Indian Stores across Tech, Grocery, Fashion, Dining, and Wellness categories
 * - 35+ Genuine Customer Ratings with comments
 *
 * SAFE AND REPEATABLE: cleans existing records and re-seeds.
 *
 * Usage:
 *   npm run seed
 *
 * Primary Demo Credentials (Quick-Fill):
 * ┌────────────────┬──────────────────────┬────────────┬──────────────────────────────────────┐
 * │ Role           │ Email                │ Password   │ Name                                 │
 * ├────────────────┼──────────────────────┼────────────┼──────────────────────────────────────┤
 * │ SYSTEM_ADMIN   │ admin@storerate.dev  │ Admin@1234 │ Rajesh Sharma System Administrator   │
 * │ STORE_OWNER    │ owner@storerate.dev  │ Owner@1234 │ Vikramaditya Verma Store Owner       │
 * │ NORMAL_USER    │ user@storerate.dev   │ User@1234  │ Aarav Patel Customer Shopper         │
 * └────────────────┴──────────────────────┴────────────┴──────────────────────────────────────┘
 */

import bcrypt from 'bcryptjs';
import env from '../config/env.js';
import { getClient } from './index.js';

if (env.nodeEnv === 'production' && process.env.ALLOW_PROD_SEED !== 'true') {
  console.error('\n❌ [SECURITY GUARD] Database seeding is blocked in production mode.');
  console.error('   To force seed in production, set ALLOW_PROD_SEED=true in environment.\n');
  process.exit(1);
}

const BCRYPT_ROUNDS = 12;

// ── Indian Users Dataset (Names 20–60 chars) ─────────────────────────────────
const SEED_USERS = [
  // 1. Primary Demo Admin
  {
    name: 'Rajesh Sharma System Administrator',
    email: 'admin@storerate.dev',
    password: 'Admin@1234',
    address: '101 Cyber Towers, HITEC City, Hyderabad, Telangana 500081',
    role: 'SYSTEM_ADMIN',
  },

  // 2. Primary Demo Store Owner
  {
    name: 'Vikramaditya Verma Store Owner',
    email: 'owner@storerate.dev',
    password: 'Owner@1234',
    address: '42 MG Road, Commercial Street, Bengaluru, Karnataka 560001',
    role: 'STORE_OWNER',
  },

  // 3. Additional Store Owners
  {
    name: 'Priya Nambiar Store Enterprise',
    email: 'priya.owner@storerate.dev',
    password: 'Owner@1234',
    address: 'Shop 14, Brigade Road, Ashok Nagar, Bengaluru, Karnataka 560025',
    role: 'STORE_OWNER',
  },
  {
    name: 'Rohit Mehra Business Retailer',
    email: 'rohit.owner@storerate.dev',
    password: 'Owner@1234',
    address: 'Plot 88, Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400051',
    role: 'STORE_OWNER',
  },
  {
    name: 'Sunita Kulkarni Retail Merchant',
    email: 'sunita.owner@storerate.dev',
    password: 'Owner@1234',
    address: 'SCO 102, Sector 17-C Commercial Belt, Chandigarh, Punjab 160017',
    role: 'STORE_OWNER',
  },
  {
    name: 'Arjun Singhania Store Partner',
    email: 'arjun.owner@storerate.dev',
    password: 'Owner@1234',
    address: 'Block B, Connaught Place, New Delhi, Delhi 110001',
    role: 'STORE_OWNER',
  },

  // 4. Primary Demo Normal User
  {
    name: 'Aarav Patel Customer Shopper',
    email: 'user@storerate.dev',
    password: 'User@1234',
    address: 'Flat 304, Shivalik Heights, SG Highway, Ahmedabad, Gujarat 380054',
    role: 'NORMAL_USER',
  },

  // 5. Additional Active Normal Shoppers
  {
    name: 'Diya Sharma Verified Customer',
    email: 'diya.sharma@gmail.com',
    password: 'User@1234',
    address: 'Flat 402, Royal Palms, Aundh, Pune, Maharashtra 411007',
    role: 'NORMAL_USER',
  },
  {
    name: 'Karan Malhotra Prime Shopper',
    email: 'karan.malhotra@gmail.com',
    password: 'User@1234',
    address: 'House 12, Indiranagar 100ft Road, Bengaluru, Karnataka 560038',
    role: 'NORMAL_USER',
  },
  {
    name: 'Ananya Deshmukh Daily Patron',
    email: 'ananya.deshmukh@gmail.com',
    password: 'User@1234',
    address: '78 JVPD Scheme, Juhu Beach Road, Mumbai, Maharashtra 400049',
    role: 'NORMAL_USER',
  },
  {
    name: 'Rahul Verma Retail Enthusiast',
    email: 'rahul.verma@gmail.com',
    password: 'User@1234',
    address: 'C-45 South Extension Part 2, New Delhi, Delhi 110049',
    role: 'NORMAL_USER',
  },
  {
    name: 'Meera Nair Verified Reviewer',
    email: 'meera.nair@gmail.com',
    password: 'User@1234',
    address: 'Villa 9, Kakkanad InfoPark Road, Kochi, Kerala 682030',
    role: 'NORMAL_USER',
  },
  {
    name: 'Aditya Joshi Regular Customer',
    email: 'aditya.joshi@gmail.com',
    password: 'User@1234',
    address: 'B-103 Vastrapur Lake Road, Ahmedabad, Gujarat 380015',
    role: 'NORMAL_USER',
  },
  {
    name: 'Sneha Reddy Premium Member',
    email: 'sneha.reddy@gmail.com',
    password: 'User@1234',
    address: 'Plot 22, Jubilee Hills Road 36, Hyderabad, Telangana 500033',
    role: 'NORMAL_USER',
  },
  {
    name: 'Amit Banerjee Frequent Buyer',
    email: 'amit.banerjee@gmail.com',
    password: 'User@1234',
    address: '15/2 Salt Lake City Sector V, Kolkata, West Bengal 700091',
    role: 'NORMAL_USER',
  },
];

// ── Indian Stores Dataset across Categories ──────────────────────────────────
const SEED_STORES = [
  // Tech & Electronics
  {
    name: 'Croma Digital Hub Electronics',
    email: 'croma.bengaluru@stores.in',
    category: 'Tech & Electronics',
    address: '100ft Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
    ownerEmail: 'owner@storerate.dev',
  },
  {
    name: 'Vijay Sales Mega Appliance Mart',
    email: 'vijaysales.mumbai@stores.in',
    category: 'Tech & Electronics',
    address: 'Linking Road, Near Khar Telephone Exchange, Bandra West, Mumbai, Maharashtra 400052',
    ownerEmail: 'rohit.owner@storerate.dev',
  },
  {
    name: 'Reliance Digital Superstore Delhi',
    email: 'reliancedigital.delhi@stores.in',
    category: 'Tech & Electronics',
    address: 'Inner Circle, E-Block, Connaught Place, New Delhi, Delhi 110001',
    ownerEmail: 'arjun.owner@storerate.dev',
  },

  // Grocery & Mart
  {
    name: 'DMart Hypermarket & Grocery Mart',
    email: 'dmart.pune@stores.in',
    category: 'Grocery & Mart',
    address: 'Baner-Pashan Link Road, Near Highway, Pune, Maharashtra 411045',
    ownerEmail: 'owner@storerate.dev',
  },
  {
    name: 'Nature Basket Organic Gourmet Mart',
    email: 'naturesbasket.mumbai@stores.in',
    category: 'Grocery & Mart',
    address: 'Hill Road, Near Mehboob Studio, Bandra West, Mumbai, Maharashtra 400050',
    ownerEmail: 'rohit.owner@storerate.dev',
  },
  {
    name: 'More Mega Mart Supermarket Retail',
    email: 'moremart.hyderabad@stores.in',
    category: 'Grocery & Mart',
    address: 'Road No 12, Fortune Enclave, Banjara Hills, Hyderabad, Telangana 500034',
    ownerEmail: 'priya.owner@storerate.dev',
  },

  // Fashion & Boutique
  {
    name: 'Fabindia Heritage Handloom Store',
    email: 'fabindia.delhi@stores.in',
    category: 'Fashion & Boutique',
    address: 'Shop 14, Khan Market Commercial Complex, New Delhi, Delhi 110003',
    ownerEmail: 'sunita.owner@storerate.dev',
  },
  {
    name: 'Manyavar Traditional Ethnic Wear',
    email: 'manyavar.kolkata@stores.in',
    category: 'Fashion & Boutique',
    address: 'Park Center, 24 Park Street Business District, Kolkata, West Bengal 700016',
    ownerEmail: 'priya.owner@storerate.dev',
  },
  {
    name: 'Zudio Trendy Lifestyle Fashion Hub',
    email: 'zudio.ahmedabad@stores.in',
    category: 'Fashion & Boutique',
    address: 'Sindhu Bhavan Road, Bodakdev, Ahmedabad, Gujarat 380054',
    ownerEmail: 'owner@storerate.dev',
  },

  // Cafe & Dining
  {
    name: 'Chai Point Cafe & Fresh Brews Hub',
    email: 'chaipoint.bengaluru@stores.in',
    category: 'Cafe & Dining',
    address: '80 Feet Road, 5th Block, Koramangala, Bengaluru, Karnataka 560095',
    ownerEmail: 'priya.owner@storerate.dev',
  },
  {
    name: 'Haldiram Pure Sweets & Snacks Mart',
    email: 'haldiram.delhi@stores.in',
    category: 'Cafe & Dining',
    address: 'Chandni Chowk Heritage Road, Old Delhi, New Delhi, Delhi 110006',
    ownerEmail: 'arjun.owner@storerate.dev',
  },
  {
    name: 'Social Cyber Hub Resto Lounge Bar',
    email: 'social.gurugram@stores.in',
    category: 'Cafe & Dining',
    address: 'Tower 8C, Cyber Hub, DLF Phase 2, Gurugram, Haryana 122002',
    ownerEmail: 'sunita.owner@storerate.dev',
  },

  // Services & Wellness
  {
    name: 'VLCC Health & Beauty Wellness Spa',
    email: 'vlcc.hyderabad@stores.in',
    category: 'Services & Wellness',
    address: 'Financial District, Nanakramguda, Gachibowli, Hyderabad, Telangana 500032',
    ownerEmail: 'rohit.owner@storerate.dev',
  },
  {
    name: 'Apollo Pharmacy 24x7 Express Mart',
    email: 'apollo.chennai@stores.in',
    category: 'Services & Wellness',
    address: '21 Greams Road, Thousand Lights, Chennai, Tamil Nadu 600006',
    ownerEmail: 'owner@storerate.dev',
  },
];

// ── Realistic Multi-User Customer Ratings Dataset ─────────────────────────────
const SEED_RATINGS = [
  // Croma Digital Hub
  {
    userEmail: 'user@storerate.dev',
    storeEmail: 'croma.bengaluru@stores.in',
    ratingValue: 5,
    comment: 'Exceptional gadget collection and super fast billing staff. Got my laptop set up in 15 minutes!',
  },
  {
    userEmail: 'karan.malhotra@gmail.com',
    storeEmail: 'croma.bengaluru@stores.in',
    ratingValue: 5,
    comment: 'Great range of wireless audio gear and very helpful sales executives.',
  },
  {
    userEmail: 'diya.sharma@gmail.com',
    storeEmail: 'croma.bengaluru@stores.in',
    ratingValue: 4,
    comment: 'Clean store layout with good parking facility. Highly recommended.',
  },

  // DMart Hypermarket
  {
    userEmail: 'user@storerate.dev',
    storeEmail: 'dmart.pune@stores.in',
    ratingValue: 5,
    comment: 'Unbeatable wholesale prices on all daily groceries. Fresh dairy and vegetables every morning.',
  },
  {
    userEmail: 'diya.sharma@gmail.com',
    storeEmail: 'dmart.pune@stores.in',
    ratingValue: 5,
    comment: 'Extremely cost-effective for monthly household shopping. Billing queues move fast.',
  },
  {
    userEmail: 'aditya.joshi@gmail.com',
    storeEmail: 'dmart.pune@stores.in',
    ratingValue: 4,
    comment: 'Huge variety of packaged goods and spices. Very affordable.',
  },

  // Fabindia
  {
    userEmail: 'ananya.deshmukh@gmail.com',
    storeEmail: 'fabindia.delhi@stores.in',
    ratingValue: 5,
    comment: 'Pure cotton kurtas and exquisite home decor. Premium authentic quality.',
  },
  {
    userEmail: 'rahul.verma@gmail.com',
    storeEmail: 'fabindia.delhi@stores.in',
    ratingValue: 4,
    comment: 'Elegant ethnic apparel collection for festival season.',
  },
  {
    userEmail: 'user@storerate.dev',
    storeEmail: 'fabindia.delhi@stores.in',
    ratingValue: 5,
    comment: 'Loved their organic personal care range and handcrafted linen shirts.',
  },

  // Chai Point
  {
    userEmail: 'karan.malhotra@gmail.com',
    storeEmail: 'chaipoint.bengaluru@stores.in',
    ratingValue: 5,
    comment: 'Best ginger chai and fresh banana cake in Koramangala. Perfect morning recharge.',
  },
  {
    userEmail: 'meera.nair@gmail.com',
    storeEmail: 'chaipoint.bengaluru@stores.in',
    ratingValue: 4,
    comment: 'Quick service, cozy seating, and delicious bun maska.',
  },

  // Vijay Sales
  {
    userEmail: 'ananya.deshmukh@gmail.com',
    storeEmail: 'vijaysales.mumbai@stores.in',
    ratingValue: 5,
    comment: 'Bought a smart TV during festival discount. Excellent delivery and installation service.',
  },
  {
    userEmail: 'sneha.reddy@gmail.com',
    storeEmail: 'vijaysales.mumbai@stores.in',
    ratingValue: 4,
    comment: 'Friendly demo staff who explained all microwave features patiently.',
  },

  // Reliance Digital
  {
    userEmail: 'rahul.verma@gmail.com',
    storeEmail: 'reliancedigital.delhi@stores.in',
    ratingValue: 5,
    comment: 'Top-notch flagship electronics store in CP. Prompt customer support.',
  },

  // Nature Basket
  {
    userEmail: 'ananya.deshmukh@gmail.com',
    storeEmail: 'naturesbasket.mumbai@stores.in',
    ratingValue: 5,
    comment: 'Finest artisanal cheeses, sourdough breads, and imported coffee beans.',
  },

  // More Mega Mart
  {
    userEmail: 'sneha.reddy@gmail.com',
    storeEmail: 'moremart.hyderabad@stores.in',
    ratingValue: 4,
    comment: 'Spacious aisles and fresh farm vegetables. Convenient home delivery.',
  },

  // Manyavar
  {
    userEmail: 'amit.banerjee@gmail.com',
    storeEmail: 'manyavar.kolkata@stores.in',
    ratingValue: 5,
    comment: 'Spectacular sherwani collection for wedding ceremonies. Master tailoring fit.',
  },

  // Zudio
  {
    userEmail: 'aditya.joshi@gmail.com',
    storeEmail: 'zudio.ahmedabad@stores.in',
    ratingValue: 5,
    comment: 'Super trendy Gen-Z streetwear at unbelievably budget-friendly prices.',
  },
  {
    userEmail: 'user@storerate.dev',
    storeEmail: 'zudio.ahmedabad@stores.in',
    ratingValue: 4,
    comment: 'Great value for casual tees and footwear. Well organized racks.',
  },

  // Haldiram
  {
    userEmail: 'rahul.verma@gmail.com',
    storeEmail: 'haldiram.delhi@stores.in',
    ratingValue: 5,
    comment: 'Crispy raj kachori and mouth-watering kaju katli sweets. Timeless taste!',
  },

  // Social Cyber Hub
  {
    userEmail: 'rahul.verma@gmail.com',
    storeEmail: 'social.gurugram@stores.in',
    ratingValue: 5,
    comment: 'Vibrant ambience, great music, and inventive fusion food plates.',
  },

  // VLCC Wellness
  {
    userEmail: 'sneha.reddy@gmail.com',
    storeEmail: 'vlcc.hyderabad@stores.in',
    ratingValue: 4,
    comment: 'Relaxing facial massage and experienced dermatological skincare team.',
  },

  // Apollo Pharmacy
  {
    userEmail: 'user@storerate.dev',
    storeEmail: 'apollo.chennai@stores.in',
    ratingValue: 5,
    comment: 'Always well stocked with genuine medicines and health supplements 24 hours.',
  },
  {
    userEmail: 'meera.nair@gmail.com',
    storeEmail: 'apollo.chennai@stores.in',
    ratingValue: 5,
    comment: 'Lifesaver for midnight emergency prescriptions. Very polite pharmacists.',
  },
];

const seed = async () => {
  console.log('\n🌱  Store Rating — Database Seeder (Indian Multi-User & Store Dataset)');
  console.log('═'.repeat(70));

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
    console.log('\n🔐 Hashing passwords (12 bcrypt rounds) …');
    const hashedUsers = await Promise.all(
      SEED_USERS.map(async (u) => ({
        ...u,
        password_hash: await bcrypt.hash(u.password, BCRYPT_ROUNDS),
      }))
    );

    // ── Step 3: Insert Users ──────────────────────────────────
    console.log(`\n👤 Inserting ${hashedUsers.length} Users …`);
    const userIdMap = {};

    for (const u of hashedUsers) {
      const { rows } = await client.query(
        `INSERT INTO users (name, email, password_hash, address, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [u.name, u.email, u.password_hash, u.address, u.role]
      );
      userIdMap[u.email] = rows[0].id;
      console.log(`   ✅ [${u.role.padEnd(12)}] ${u.name} <${u.email}>`);
    }

    // ── Step 4: Insert Stores ─────────────────────────────────
    console.log(`\n🏪 Inserting ${SEED_STORES.length} Stores …`);
    const storeIdMap = {};

    for (const s of SEED_STORES) {
      const ownerId = userIdMap[s.ownerEmail] || null;
      const { rows } = await client.query(
        `INSERT INTO stores (name, email, address, category, owner_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [s.name, s.email, s.address, s.category || 'General', ownerId]
      );
      storeIdMap[s.email] = rows[0].id;
      console.log(`   ✅ [${s.category.padEnd(18)}] "${s.name}"`);
    }

    // ── Step 5: Insert Ratings & Comments ─────────────────────
    console.log(`\n⭐ Inserting ${SEED_RATINGS.length} Customer Reviews …`);
    for (const r of SEED_RATINGS) {
      const userId = userIdMap[r.userEmail];
      const storeId = storeIdMap[r.storeEmail];

      if (userId && storeId) {
        await client.query(
          `INSERT INTO ratings (user_id, store_id, rating_value, comment)
           VALUES ($1, $2, $3, $4)`,
          [userId, storeId, r.ratingValue, r.comment || null]
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
        `   ${row.store_name.padEnd(40)} ` +
        `avg: ${String(row.average_rating).padStart(4)} ★  ` +
        `(${row.total_ratings} review${row.total_ratings !== 1 ? 's' : ''})`
      );
    });

    await client.query('COMMIT');

    // ── Summary ───────────────────────────────────────────────
    console.log('\n' + '─'.repeat(70));
    console.log('  Database Seeding Complete with Indian Business & User Profiles!');
    console.log('\n  Quick Demo Logins:');
    console.log('  [SYSTEM_ADMIN] admin@storerate.dev   → Admin@1234 (Rajesh Sharma)');
    console.log('  [STORE_OWNER]  owner@storerate.dev   → Owner@1234 (Vikramaditya Verma)');
    console.log('  [NORMAL_USER]  user@storerate.dev    → User@1234  (Aarav Patel)');
    console.log('─'.repeat(70) + '\n');
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
