/**
 * Application Constants
 */

export const ROLES = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  NORMAL_USER: 'NORMAL_USER',
  STORE_OWNER: 'STORE_OWNER',
};

export const ALL_ROLES = Object.values(ROLES);

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

export const RATING_LIMITS = {
  MIN: 1,
  MAX: 5,
};

export const FIELD_LIMITS = {
  NAME_MIN: 20,
  NAME_MAX: 60,
  ADDRESS_MAX: 400,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 16,
};
