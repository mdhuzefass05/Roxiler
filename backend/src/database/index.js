import pkg from 'pg';
import env from '../config/env.js';

const { Pool } = pkg;

/**
 * PostgreSQL connection pool.
 *
 * This is the single source of the pg Pool for the entire application.
 * All models must import `query` from here — nothing else should import `pg`
 * directly.
 */
const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
  process.exit(1);
});

let mockQueryHandler = null;

/**
 * Set a mock query handler for unit/integration tests without a live DB connection.
 */
export const setMockQueryHandler = (handler) => {
  mockQueryHandler = handler;
};

/**
 * Reset mock query handler back to default pg pool.
 */
export const resetMockQueryHandler = () => {
  mockQueryHandler = null;
};

/**
 * Run a parameterised SQL query.
 *
 * @param {string} text   - SQL query string with $1, $2 … placeholders
 * @param {Array}  params - Query parameter values
 * @returns {Promise<import('pg').QueryResult>}
 *
 * @example
 *   const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
 */
export const query = (text, params) => {
  if (mockQueryHandler) {
    return mockQueryHandler(text, params);
  }
  return pool.query(text, params);
};

/**
 * Acquire a client from the pool for use in transactions.
 * Always call client.release() in a finally block.
 *
 * @returns {Promise<import('pg').PoolClient>}
 *
 * @example
 *   const client = await getClient();
 *   try {
 *     await client.query('BEGIN');
 *     // ... queries ...
 *     await client.query('COMMIT');
 *   } catch (err) {
 *     await client.query('ROLLBACK');
 *     throw err;
 *   } finally {
 *     client.release();
 *   }
 */
export const getClient = () => pool.connect();

/**
 * Test the database connection.
 * Called once at server startup — exits the process on failure.
 *
 * @returns {Promise<void>}
 */
export const testConnection = async () => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT NOW() AS now');
    console.log(`[DB] PostgreSQL connected — server time: ${rows[0].now}`);
  } finally {
    client.release();
  }
};

export default pool;
