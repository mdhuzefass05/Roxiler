import pkg from 'pg';
import env from './env.js';

const { Pool } = pkg;

/**
 * PostgreSQL connection pool.
 * Reuses connections across requests — do NOT call pool.end() between requests.
 */
const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
  process.exit(1);
});

/**
 * Tests the database connection. Called on server startup.
 * @returns {Promise<void>}
 */
export const testConnection = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT NOW() AS now');
    console.log(`[DB] PostgreSQL connected — server time: ${result.rows[0].now}`);
  } finally {
    client.release();
  }
};

/**
 * Convenience wrapper for running a parameterised query.
 * @param {string} text - SQL query string
 * @param {Array}  params - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
export const query = (text, params) => pool.query(text, params);

export default pool;
