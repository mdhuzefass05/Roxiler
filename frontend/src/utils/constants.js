/**
 * Application-wide constants.
 */

// User roles — must match backend role strings exactly
export const ROLES = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  NORMAL_USER: 'NORMAL_USER',
  STORE_OWNER: 'STORE_OWNER',
};

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',

  // User
  USER_DASHBOARD: '/user/dashboard',
  STORES: '/stores',

  // Owner
  OWNER_DASHBOARD: '/owner/dashboard',

  NOT_FOUND: '*',
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  AUTH_USER: 'authUser',
};
