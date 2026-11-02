import { Router } from 'express';
import { getCollections } from '../config/db.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { CATEGORIES, validateStudio } from '../utils/validate.js';
import { escapeRegex, HttpError, toObjectId } from '../utils/http.js';
import { DATE_RE } from '../utils/time.js';

const router = Router();

// Fields a studio card needs — keeps list payloads small.
const CARD_PROJECTION = {
  title: 1,
  category: 1,
  hourlyRate: 1,
  location: 1,
  image: 1,
  rating: 1,
  reviewCount: 1,
  maxCapacity: 1,
  ownerName: 1,
  createdAt: 1,
};

const SORTS = {
  newest: { createdAt: -1, _id: -1 },
  rating: { rating: -1, reviewCount: -1, _id: -1 },
  'price-asc': { hourlyRate: 1, _id: -1 },
  'price-desc': { hourlyRate: -1, _id: -1 },
};

/**
 * GET /api/studios
 * Query: search, category, sort (newest|rating|price-asc|price-desc),
 *        minPrice, maxPrice, minCapacity, exclude, page, limit
 */
router.get('/', async (req, res) => {
  const { studios } = await getCollections();
  const { search = '', category = '', sort = 'newest', minPrice, maxPrice, minCapacity, exclude } = req.query;

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(48, Math.max(1, parseInt(req.query.limit, 10) || 9));

  const filter = {};
  const term = String(search).trim();
  if (term) {
    const rx = new RegExp(escapeRegex(term), 'i');
    filter.$or = [{ title: rx }, { location: rx }, { category: rx }, { amenities: rx }];
  }
  if (CATEGORIES.includes(category)) filter.category = category;

  const priceRange = {};
  if (Number(minPrice) > 0) priceRange.$gte = Number(minPrice);
  if (Number(maxPrice) > 0) priceRange.$lte = Number(maxPrice);
  if (Object.keys(priceRange).length) filter.hourlyRate = priceRange;

  if (Number(minCapacity) > 0) filter.maxCapacity = { $gte: Number(minCapacity) };
  if (exclude) filter._id = { $ne: toObjectId(exclude) };

  const [items, total] = await Promise.all([
    studios
      .find(filter)
      .project(CARD_PROJECTION)
      .sort(SORTS[sort] ?? SORTS.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    studios.countDocuments(filter),
  ]);

  res.json({ studios: items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
});

/** GET /api/studios/featured — the 6 top-rated spaces (newest breaks ties). */
router.get('/featured', async (req, res) => {
  const { studios } = await getCollections();
  const featured = await studios
    .find({})
    .project(CARD_PROJECTION)
    .sort({ rating: -1, reviewCount: -1, createdAt: -1 })
    .limit(6)
    .toArray();
  res.json(featured);
});

/** GET /api/studios/categories — listing count and starting price per category. */
router.get('/categories', async (req, res) => {
  const { studios } = await getCollections();
  const stats = await studios
    .aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, fromRate: { $min: '$hourlyRate' } } },
      { $project: { _id: 0, category: '$_id', count: 1, fromRate: 1 } },
    ])
    .toArray();

  // Always return every category, even ones with no listings yet.
  res.json(CATEGORIES.map((name) => stats.find((s) => s.category === name) ?? { category: name, count: 0, fromRate: null }));
});

/** GET /api/studios/mine — listings owned by the logged-in host. */
router.get('/mine', verifyToken, async (req, res) => {
  const { studios } = await getCollections();
  const mine = await studios.find({ ownerEmail: req.user.email }).sort({ createdAt: -1 }).toArray();
  res.json(mine);
});

/** POST /api/studios — create a listing (protected). */
router.post('/', verifyToken, async (req, res) => {
  const { studios } = await getCollections();
  const data = validateStudio(req.body);
  const now = new Date();

  const studio = {
    ...data,
    ownerName: req.user.name,
    ownerEmail: req.user.email,
    ownerPhoto: req.user.image || '',
    rating: 0,
    reviewCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const { insertedId } = await studios.insertOne(studio);
  res.status(201).json({ insertedId, studio: { _id: insertedId, ...studio } });
});

/** Loads a studio and makes sure the logged-in user owns it. */
async function findOwnedStudio(studios, id, user) {
  const studio = await studios.findOne({ _id: toObjectId(id, 'Studio') });
  if (!studio) throw new HttpError(404, 'Studio not found.');
  if (studio.ownerEmail !== user.email) throw new HttpError(403, 'Forbidden: you can only manage your own listings.');
  return studio;
}

/** PATCH|PUT /api/studios/:id — update a listing (owner only). */
async function updateStudio(req, res) {
  const { studios } = await getCollections();
  const studio = await findOwnedStudio(studios, req.params.id, req.user);
  const data = validateStudio(req.body);

  const updated = await studios.findOneAndUpdate(
    { _id: studio._id },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: 'after' },
  );
  res.json({ success: true, studio: updated });
}
router.patch('/:id', verifyToken, updateStudio);
router.put('/:id', verifyToken, updateStudio);

/** DELETE /api/studios/:id — remove a listing (owner only). */
router.delete('/:id', verifyToken, async (req, res) => {
  const { studios, bookings, wishlists } = await getCollections();
  const studio = await findOwnedStudio(studios, req.params.id, req.user);

  await studios.deleteOne({ _id: studio._id });
  // Open requests can no longer be honoured; past/confirmed history is kept.
  const [cancelled] = await Promise.all([
    bookings.updateMany(
      { studioId: studio._id, status: 'Pending' },
      { $set: { status: 'Cancelled', cancelReason: 'Listing removed by host', updatedAt: new Date() } },
    ),
    wishlists.deleteMany({ studioId: studio._id }),
  ]);

  res.json({ success: true, deletedId: studio._id, cancelledRequests: cancelled.modifiedCount });
});

/** GET /api/studios/:id */
router.get('/:id', async (req, res) => {
  const { studios } = await getCollections();
  const studio = await studios.findOne({ _id: toObjectId(req.params.id, 'Studio') });
  if (!studio) throw new HttpError(404, 'Studio not found.');
  res.json(studio);
});

/**
 * GET /api/studios/:id/availability?date=YYYY-MM-DD
 * Active (Pending + Confirmed) slots for a day so the booking modal can show them.
 */
router.get('/:id/availability', async (req, res) => {
  const { bookings } = await getCollections();
  const studioId = toObjectId(req.params.id, 'Studio');
  const { date } = req.query;
  if (!DATE_RE.test(date ?? '')) throw new HttpError(400, 'Provide a date as YYYY-MM-DD.');

  const slots = await bookings
    .find({ studioId, date, status: { $in: ['Pending', 'Confirmed'] } })
    .project({ _id: 0, startTime: 1, endTime: 1, status: 1 })
    .sort({ startAt: 1 })
    .toArray();

  res.json({ date, slots });
});

export default router;
