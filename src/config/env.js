import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const clientUrls = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

export const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  dbName: process.env.DB_NAME || 'studiospace',
  clientUrls,
  // BetterAuth (running inside the Next.js client) publishes its public keys here.
  jwksUrl: process.env.BETTER_AUTH_JWKS_URL || `${clientUrls[0]}/api/auth/jwks`,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  isProd: process.env.NODE_ENV === 'production',
};

if (!env.jwtSecret) {
  console.warn('⚠️  JWT_SECRET is not set. Protected routes will reject every request.');
}
