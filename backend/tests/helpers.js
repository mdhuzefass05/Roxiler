import jwt from 'jsonwebtoken';
import env from '../src/config/env.js';
import { setMockQueryHandler, resetMockQueryHandler } from '../src/database/index.js';

/**
 * Generate a valid test JWT token for a specific user role.
 */
export const createTestToken = (payload = {}) => {
  const defaultPayload = {
    id: 1,
    role: 'SYSTEM_ADMIN',
    email: 'admin@storerate.dev',
    ...payload,
  };
  return jwt.sign(defaultPayload, env.jwt.secret, { expiresIn: '1h' });
};

export const createAdminToken = (overrides = {}) =>
  createTestToken({ id: 1, role: 'SYSTEM_ADMIN', email: 'admin@storerate.dev', ...overrides });

export const createUserToken = (overrides = {}) =>
  createTestToken({ id: 3, role: 'NORMAL_USER', email: 'alice.johnson@storerate.dev', ...overrides });

export const createOwnerToken = (overrides = {}) =>
  createTestToken({ id: 2, role: 'STORE_OWNER', email: 'john.owner@storerate.dev', ...overrides });

/**
 * Setup a mock database response handler for test execution.
 */
export const setupMockDatabase = () => {
  setMockQueryHandler(async (sql, params) => {
    const text = sql.toLowerCase();

    // ── Admin stats ──
    if (text.includes('as total_users') || (text.includes('count(*)') && text.includes('users') && text.includes('stores'))) {
      return {
        rows: [{ total_users: 10, total_stores: 5, total_ratings: 20, users: 10, stores: 5, ratings: 20 }],
      };
    }

    // ── Count queries ──
    if (text.startsWith('select count(*)')) {
      return { rows: [{ total: 3 }] };
    }

    // ── Rating distribution ──
    if (text.includes('group by rating_value')) {
      return {
        rows: [
          { rating_value: 5, count: 2 },
          { rating_value: 4, count: 1 },
          { rating_value: 3, count: 0 },
          { rating_value: 2, count: 0 },
          { rating_value: 1, count: 0 },
        ],
      };
    }

    // ── Ratings listing ──
    if (text.includes('from ratings')) {
      return {
        rows: [
          {
            id: 1,
            user_id: 3,
            store_id: 1,
            rating_value: 5,
            user_name: 'Alice Johnson Customer One',
            user_email: 'alice.johnson@storerate.dev',
            user_address: '742 Evergreen Terrace, Springfield',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      };
    }

    // ── Stores queries ──
    if (text.includes('from stores') || text.includes('from store_ratings_summary')) {
      return {
        rows: [
          {
            id: 1,
            store_id: 1,
            name: 'Tech Mart Electronics Store',
            store_name: 'Tech Mart Electronics Store',
            email: 'techmart@stores.dev',
            store_email: 'techmart@stores.dev',
            address: '123 Tech Avenue, Silicon Valley, CA 94025',
            store_address: '123 Tech Avenue, Silicon Valley, CA 94025',
            owner_id: 2,
            owner_name: 'John Davis Store Owner One',
            owner_email: 'john.owner@storerate.dev',
            average_rating: '4.50',
            total_ratings: 3,
            user_rating: 5,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      };
    }

    // ── Users queries ──
    if (text.includes('from users')) {
      return {
        rows: [
          {
            id: 1,
            name: 'System Administrator Primary',
            email: 'admin@storerate.dev',
            address: '100 Admin Parkway, Suite 500',
            role: 'SYSTEM_ADMIN',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 2,
            name: 'John Davis Store Owner One',
            email: 'john.owner@storerate.dev',
            address: '456 Commercial Way, Seattle, WA',
            role: 'STORE_OWNER',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 3,
            name: 'Alice Johnson Customer One',
            email: 'alice.johnson@storerate.dev',
            address: '742 Evergreen Terrace, Springfield',
            role: 'NORMAL_USER',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      };
    }

    // ── Default empty rows ──
    return { rows: [] };
  });
};

export const teardownMockDatabase = () => {
  resetMockQueryHandler();
};
