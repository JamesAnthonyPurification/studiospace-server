import { Router } from 'express';
import { getCollections } from '../config/db.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { HttpError, toObjectId } from '../utils/http.js';

const router = Router();
router.use(verifyToken);

/** GET /api/wishlist — saved studios joined with their current details. */
router.get('/', async (req, res) => {
  const { wishlists } = await getCollections();
  const saved = await wishlists
    .aggregate([
      { $match: { userEmail: req.user.email } },
      { $sort: { createdAt: -1 } },
      { $lookup: { from: 'studios', localField: 'studioId', foreignField: '_id', as: 'studio' } },
      { $unwind: '$studio' },
      { $replaceRoot: { newRoot: { $mergeObjects: ['$studio', { savedAt: '$createdAt' }] } } },
      { $project: { overview: 0, gallery: 0, amenities: 0 } },
    ])
    .toArray();
  res.json(saved);
});

/** GET /api/wishlist/ids — just the studio ids, for heart icons on cards. */
router.get('/ids', async (req, res) => {
  const { wishlists } = await getCollections();
  const rows = await wishlists.find({ userEmail: req.user.email }).project({ studioId: 1 }).toArray();
  res.json(rows.map((row) => row.studioId.toString()));
});

/** POST /api/wishlist { studioId } */
router.post('/', async (req, res) => {
  const { studios, wishlists } = await getCollections();
  const studioId = toObjectId(req.body?.studioId, 'Studio');
  const exists = await studios.countDocuments({ _id: studioId }, { limit: 1 });
  if (!exists) throw new HttpError(404, 'Studio not found.');

  await wishlists.updateOne(
    { userEmail: req.user.email, studioId },
    { $setOnInsert: { createdAt: new Date() } },
    { upsert: true },
  );
  res.status(201).json({ success: true, studioId });
});

/** DELETE /api/wishlist/:studioId */
router.delete('/:studioId', async (req, res) => {
  const { wishlists } = await getCollections();
  const studioId = toObjectId(req.params.studioId, 'Studio');
  await wishlists.deleteOne({ userEmail: req.user.email, studioId });
  res.json({ success: true, studioId });
});

export default router;
