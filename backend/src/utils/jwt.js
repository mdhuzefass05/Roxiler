import jwt from 'jsonwebtoken';
import env from '../config/env.js';

/**
 * Signs a JWT token.
 * @param {Object} payload - Data to embed in the token (e.g., { id, role })
 * @returns {string} Signed JWT token
 */
export const signToken = (payload) => {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
};

/**
 * Verifies and decodes a JWT token.
 * @param {string} token
 * @returns {Object} Decoded payload
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
export const verifyToken = (token) => {
  return jwt.verify(token, env.jwt.secret);
};
