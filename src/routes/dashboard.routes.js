import { Router } from 'express';
import { getCollections } from '../config/db.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = Router();

const byStatus = (rows, field) =>
  Object.fromEntries(rows.map((row) => [row._id, { count: row.count, amount: row[field] }]));

/** GET /api/dashboard/stats — numbers for the logged-in user's dashboard. */
router.get('/stats', verifyToken, async (req, res) => {
  const { studios, bookings, wishlists } = await getCollections();
  const email = req.user.email;

  const [listings, myBookings, hostBookings, saved] = await Promise.all([
    studios.countDocuments({ ownerEmail: email }),
    bookings
      .aggregate([
        { $match: { userEmail: email } },
        { $group: { _id: '$status', count: { $sum: 1 }, spent: { $sum: '$subtotal' } } },
      ])
      .toArray(),
    bookings
      .aggregate([
        { $match: { hostEmail: email } },
        { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$subtotal' } } },
      ])
      .toArray(),
    wishlists.countDocuments({ userEmail: email }),
  ]);

  const mine = byStatus(myBookings, 'spent');
  const hosted = byStatus(hostBookings, 'revenue');
  const sum = (map, keys, key) => keys.reduce((total, k) => total + (map[k]?.[key] ?? 0), 0);

  res.json({
    listings,
    saved,
    bookings: {
      total: sum(mine, Object.keys(mine), 'count'),
      upcoming: mine.Confirmed?.count ?? 0,
      pending: mine.Pending?.count ?? 0,
      spent: sum(mine, ['Confirmed', 'Completed'], 'amount'),
    },
    hosting: {
      total: sum(hosted, Object.keys(hosted), 'count'),
      pendingRequests: hosted.Pending?.count ?? 0,
      confirmed: hosted.Confirmed?.count ?? 0,
      earnings: sum(hosted, ['Confirmed', 'Completed'], 'amount'),
    },
  });
});

export default router;
