import { Router } from 'express';
import { getCollections } from '../config/db.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { HttpError, toObjectId } from '../utils/http.js';
import {
  CLOSING_MINUTES,
  isValidCalendarDate,
  OPENING_MINUTES,
  slotDate,
  TIME_RE,
  toMinutes,
} from '../utils/time.js';

const router = Router();
router.use(verifyToken);

export const STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
const DAY_MS = 24 * 60 * 60 * 1000;

/** Mongo filter for bookings of a studio whose time range overlaps [startAt, endAt). */
const overlapping = (studioId, startAt, endAt) => ({
  studioId,
  startAt: { $lt: endAt },
  endAt: { $gt: startAt },
});

/**
 * Throws 409 if the slot collides with an already Confirmed booking.
 * Used both when a creator requests a slot and when a host confirms one.
 */
async function assertNoConfirmedOverlap(bookings, { studioId, startAt, endAt, date }, excludeId) {
  const conflict = await bookings.findOne({
    ...overlapping(studioId, startAt, endAt),
    status: 'Confirmed',
    ...(excludeId && { _id: { $ne: excludeId } }),
  });

  if (conflict) {
    throw new HttpError(
      409,
      `This studio is already booked from ${conflict.startTime} to ${conflict.endTime} on ${date}. Please choose a different time slot.`,
    );
  }
}

/** POST /api/bookings — request a slot. Saved with status "Pending". */
router.post('/', async (req, res) => {
  const { studios, bookings } = await getCollections();
  const { studioId, date, startTime, endTime, notes = '' } = req.body ?? {};
  const guests = Number(req.body?.guests);

  if (!isValidCalendarDate(String(date ?? ''))) throw new HttpError(400, 'Please pick a valid date.');
  if (!TIME_RE.test(startTime ?? '') || !TIME_RE.test(endTime ?? '')) throw new HttpError(400, 'Please pick a start and end time.');

  const startMin = toMinutes(startTime);
  const endMin = toMinutes(endTime);
  if (startMin < OPENING_MINUTES || endMin > CLOSING_MINUTES) throw new HttpError(400, 'Studios can be booked between 06:00 and 24:00.');
  if (endMin - startMin < 60) throw new HttpError(400, 'A booking must be at least 1 hour long.');
  if ((endMin - startMin) % 30 !== 0) throw new HttpError(400, 'Bookings are made in 30-minute increments.');

  const startAt = slotDate(date, startMin);
  const endAt = slotDate(date, endMin);
  // One day of slack so creators in timezones ahead of UTC can book "today".
  if (endAt.getTime() < Date.now() - DAY_MS) throw new HttpError(400, 'That time slot is in the past.');

  const studio = await studios.findOne({ _id: toObjectId(studioId, 'Studio') });
  if (!studio) throw new HttpError(404, 'Studio not found.');
  if (studio.ownerEmail === req.user.email) throw new HttpError(400, "You can't book your own studio.");
  if (!Number.isInteger(guests) || guests < 1) throw new HttpError(400, 'Guest count must be at least 1.');
  if (guests > studio.maxCapacity) throw new HttpError(400, `This studio fits up to ${studio.maxCapacity} people.`);

  const slot = { studioId: studio._id, startAt, endAt, date };
  await assertNoConfirmedOverlap(bookings, slot);

  const ownRequest = await bookings.findOne({
    ...overlapping(studio._id, startAt, endAt),
    userEmail: req.user.email,
    status: 'Pending',
  });
  if (ownRequest) {
    throw new HttpError(409, `You already have a pending request for ${ownRequest.startTime}–${ownRequest.endTime} on this date.`);
  }

  const hours = (endMin - startMin) / 60;
  const subtotal = Math.round(hours * studio.hourlyRate * 100) / 100;
  const now = new Date();

  const booking = {
    studioId: studio._id,
    studioTitle: studio.title,
    studioImage: studio.image,
    studioLocation: studio.location,
    studioCategory: studio.category,
    hostName: studio.ownerName,
    hostEmail: studio.ownerEmail,
    userName: req.user.name,
    userEmail: req.user.email,
    date,
    startTime,
    endTime,
    startAt,
    endAt,
    hours,
    guests,
    notes: String(notes).trim().slice(0, 500),
    hourlyRate: studio.hourlyRate,
    subtotal,
    securityDeposit: studio.securityDeposit,
    totalPrice: subtotal + studio.securityDeposit,
    status: 'Pending',
    createdAt: now,
    updatedAt: now,
  };

  const { insertedId } = await bookings.insertOne(booking);
  res.status(201).json({ insertedId, booking: { _id: insertedId, ...booking } });
});

/** GET /api/bookings/mine?status= — reservations made by the logged-in creator. */
router.get('/mine', async (req, res) => {
  const { bookings } = await getCollections();
  const filter = { userEmail: req.user.email };
  if (STATUSES.includes(req.query.status)) filter.status = req.query.status;
  res.json(await bookings.find(filter).sort({ createdAt: -1 }).toArray());
});

/** PATCH /api/bookings/:id/cancel — creators can cancel their own pending requests. */
router.patch('/:id/cancel', async (req, res) => {
  const { bookings } = await getCollections();
  const booking = await bookings.findOne({ _id: toObjectId(req.params.id, 'Booking') });
  if (!booking) throw new HttpError(404, 'Booking not found.');
  if (booking.userEmail !== req.user.email) throw new HttpError(403, 'Forbidden: this is not your booking.');
  if (booking.status !== 'Pending') throw new HttpError(400, `Only pending bookings can be cancelled (this one is ${booking.status}).`);

  const updated = await bookings.findOneAndUpdate(
    { _id: booking._id, status: 'Pending' },
    { $set: { status: 'Cancelled', cancelReason: 'Cancelled by creator', updatedAt: new Date() } },
    { returnDocument: 'after' },
  );
  res.json({ success: true, booking: updated });
});

/** GET /api/bookings/requests?status= — bookings made on the logged-in host's studios. */
router.get('/requests', async (req, res) => {
  const { bookings } = await getCollections();
  const filter = { hostEmail: req.user.email };
  if (STATUSES.includes(req.query.status)) filter.status = req.query.status;
  res.json(await bookings.find(filter).sort({ createdAt: -1 }).toArray());
});

// What a host may move a booking to from each state.
const HOST_TRANSITIONS = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Completed', 'Cancelled'],
};

/** PATCH /api/bookings/:id/status — hosts confirm, decline or complete a booking. */
router.patch('/:id/status', async (req, res) => {
  const { bookings } = await getCollections();
  const { status } = req.body ?? {};
  const booking = await bookings.findOne({ _id: toObjectId(req.params.id, 'Booking') });
  if (!booking) throw new HttpError(404, 'Booking not found.');
  if (booking.hostEmail !== req.user.email) throw new HttpError(403, 'Forbidden: only the studio host can update this booking.');

  const allowed = HOST_TRANSITIONS[booking.status] ?? [];
  if (!allowed.includes(status)) {
    throw new HttpError(400, `A ${booking.status} booking can't be marked as ${status || 'that status'}.`);
  }

  if (status === 'Confirmed') await assertNoConfirmedOverlap(bookings, booking, booking._id);

  const updated = await bookings.findOneAndUpdate(
    { _id: booking._id, status: booking.status },
    {
      $set: {
        status,
        updatedAt: new Date(),
        ...(status === 'Cancelled' && { cancelReason: 'Declined by host' }),
      },
    },
    { returnDocument: 'after' },
  );
  if (!updated) throw new HttpError(409, 'This booking was updated by someone else. Refresh and try again.');

  res.json({ success: true, booking: updated });
});

export default router;
