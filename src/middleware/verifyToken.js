import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const COOKIE_NAME = 'studiospace_token';

export const cookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  // The client proxies /api/* through Next.js, so the cookie is first-party.
  // 'none' in production also keeps direct cross-site calls working over HTTPS.
  sameSite: env.isProd ? 'none' : 'lax',
  path: '/',
};

/**
 * Rejects the request with 401 unless it carries a valid JWT in the
 * HTTPOnly cookie. On success the decoded user is available as req.user.
 */
export function verifyToken(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: please log in to continue.' });
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    next();
  } catch {
    res.clearCookie(COOKIE_NAME, cookieOptions);
    return res.status(401).json({ message: 'Unauthorized: your session has expired. Please log in again.' });
  }
}
