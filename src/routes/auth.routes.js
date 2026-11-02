import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { env } from '../config/env.js';
import { COOKIE_NAME, cookieOptions, verifyToken } from '../middleware/verifyToken.js';

const router = Router();
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

let jwks;
const getJwks = () => (jwks ??= createRemoteJWKSet(new URL(env.jwksUrl)));

/**
 * POST /api/jwt
 * Exchanges a short-lived BetterAuth JWT (signed with the client's JWKS)
 * for this API's own JWT, stored in an HTTPOnly cookie.
 */
router.post('/jwt', async (req, res) => {
  const { token } = req.body ?? {};
  if (!token) return res.status(400).json({ message: 'Missing BetterAuth token.' });

  let payload;
  try {
    ({ payload } = await jwtVerify(token, getJwks()));
  } catch {
    return res.status(401).json({ message: 'Unauthorized: could not verify your login session.' });
  }

  if (!payload.email) return res.status(401).json({ message: 'Unauthorized: token has no email.' });

  const user = {
    id: payload.sub ?? payload.id,
    email: payload.email,
    name: payload.name ?? payload.email.split('@')[0],
    image: payload.image ?? '',
  };

  const appToken = jwt.sign(user, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
  res.cookie(COOKIE_NAME, appToken, { ...cookieOptions, maxAge: SEVEN_DAYS }).json({ success: true, user });
});

/** POST /api/logout — clears the HTTPOnly cookie. */
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions).json({ success: true });
});

/** GET /api/me — who the cookie belongs to (useful for debugging the JWT flow). */
router.get('/me', verifyToken, (req, res) => {
  const { id, email, name, image } = req.user;
  res.json({ user: { id, email, name, image } });
});

export default router;
