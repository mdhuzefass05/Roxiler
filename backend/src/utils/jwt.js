import jwt from 'jsonwebtoken';
import env from '../config/env.js';

const JWT_ALGORITHM = 'HS256';

/**
 * Signs a JWT token with explicit HS256 algorithm and essential claims.
 * @param {Object} payload - Data to embed in the token ({ id, role, email })
 * @returns {string} Signed JWT token
 */
export const signToken = (payload) => {
  return jwt.sign(payload, env.jwt.secret, {
    algorithm: JWT_ALGORITHM,
    expiresIn: env.jwt.expiresIn,
  });
};

/**
 * Cryptographically verifies and decodes a JWT token.
 * Enforces HS256 algorithm to eliminate algorithm-confusion vulnerabilities.
 *
 * @param {string} token
 * @returns {Object} Decoded payload
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
export const verifyToken = (token) => {
  return jwt.verify(token, env.jwt.secret, {
    algorithms: [JWT_ALGORITHM],
  });
};
