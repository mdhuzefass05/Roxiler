import dotenv from 'dotenv';
dotenv.config();

/**
 * Validates that all required environment variables are present.
 * Throws an error and exits on startup if any are missing.
 */
const REQUIRED_VARS = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'CLIENT_URL',
];

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `\n[ENV ERROR] Missing required environment variables:\n  ${missing.join('\n  ')}\n`
  );
  console.error('Copy .env.example to .env and fill in all values.\n');
  process.exit(1);
}

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 16) {
  console.error('\n[ENV SECURITY ERROR] JWT_SECRET must be at least 16 characters long for cryptographic security.\n');
  process.exit(1);
}

const env = {
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10),
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  clientUrl: process.env.CLIENT_URL,
};

export default env;
