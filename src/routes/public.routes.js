import { Router } from 'express';
import { getCollections } from '../config/db.js';
import { HttpError } from '../utils/http.js';

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** GET /api/stats — platform numbers for the About page. */
router.get('/stats', async (req, res) => {
  const { studios, bookings } = await getCollections();
  const [studioCount, hosts, completed, [ratings]] = await Promise.all([
    studios.estimatedDocumentCount(),
    studios.distinct('ownerEmail'),
    bookings.countDocuments({ status: { $in: ['Confirmed', 'Completed'] } }),
    studios
      .aggregate([{ $match: { reviewCount: { $gt: 0 } } }, { $group: { _id: null, average: { $avg: '$rating' } } }])
      .toArray(),
  ]);

  res.json({
    studios: studioCount,
    hosts: hosts.length,
    bookings: completed,
    averageRating: ratings ? Math.round(ratings.average * 10) / 10 : 0,
  });
});

/** POST /api/newsletter { email } */
router.post('/newsletter', async (req, res) => {
  const { newsletter } = await getCollections();
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) throw new HttpError(400, 'Please enter a valid email address.');

  const result = await newsletter.updateOne(
    { email },
    { $setOnInsert: { email, subscribedAt: new Date() } },
    { upsert: true },
  );

  if (result.upsertedCount === 0) return res.json({ success: true, message: "You're already on the list — thanks!" });
  res.status(201).json({ success: true, message: 'Subscribed! Fresh studios will land in your inbox.' });
});

export default router;
