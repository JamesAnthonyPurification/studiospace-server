import { closeDb, getCollections } from '../src/config/db.js';
import { slotDate, toMinutes } from '../src/utils/time.js';
import { bookingPlan, creators, dayOffset, demoHost, hosts, reviewsFor, studios as studioData, wishlistPlan } from './data.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const demo = demoHost(process.env.DEMO_USER_EMAIL || 'examiner@example.com', process.env.DEMO_USER_NAME || 'Examiner Demo');

async function seed() {
  const { studios, reviews, bookings, wishlists } = await getCollections();

  const removed = await Promise.all(
    [studios, reviews, bookings, wishlists].map((col) => col.deleteMany({ seeded: true })),
  );
  console.log(`🧹 Removed previous demo data (${removed.reduce((n, r) => n + r.deletedCount, 0)} documents)`);

  // Studios — staggered createdAt so "newest" sorting is meaningful.
  const now = Date.now();
  const studioDocs = studioData.map(({ key, owner, ...data }, i) => {
    const host = owner === 'demo' ? demo : hosts[owner];
    const createdAt = new Date(now - (studioData.length - i) * 2 * DAY_MS);
    return {
      key,
      doc: {
        ...data,
        ownerName: host.name,
        ownerEmail: host.email,
        ownerPhoto: host.photo,
        rating: 0,
        reviewCount: 0,
        createdAt,
        updatedAt: createdAt,
        seeded: true,
      },
    };
  });
  const { insertedIds } = await studios.insertMany(studioDocs.map((s) => s.doc));
  const byKey = Object.fromEntries(studioDocs.map((s, i) => [s.key, { ...s.doc, _id: insertedIds[i] }]));
  console.log(`🎬 Inserted ${studioDocs.length} studios`);

  // Reviews, then roll them up into each studio's rating.
  const reviewDocs = Object.values(byKey).flatMap((studio, index) =>
    reviewsFor(studio, index).map(({ rating, comment, reviewer, daysAgo }) => {
      const createdAt = new Date(now - daysAgo * DAY_MS);
      return {
        studioId: studio._id,
        rating,
        comment,
        userName: reviewer.name,
        userEmail: reviewer.email,
        userImage: reviewer.photo,
        createdAt,
        updatedAt: createdAt,
        seeded: true,
      };
    }),
  );
  await reviews.insertMany(reviewDocs);

  const summaries = await reviews
    .aggregate([{ $group: { _id: '$studioId', average: { $avg: '$rating' }, count: { $sum: 1 } } }])
    .toArray();
  await studios.bulkWrite(
    summaries.map((s) => ({
      updateOne: {
        filter: { _id: s._id },
        update: { $set: { rating: Math.round(s.average * 10) / 10, reviewCount: s.count } },
      },
    })),
  );
  console.log(`⭐ Inserted ${reviewDocs.length} reviews`);

  // Bookings
  const bookingDocs = bookingPlan.map((plan, i) => {
    const studio = byKey[plan.studio];
    const guest = plan.guest === 'demo' ? demo : creators[plan.guest];
    const date = dayOffset(plan.day);
    const startMin = toMinutes(plan.start);
    const endMin = toMinutes(plan.end);
    const hours = (endMin - startMin) / 60;
    const subtotal = hours * studio.hourlyRate;
    const createdAt = new Date(now - (bookingPlan.length - i) * 3600_000 - Math.max(0, -plan.day + 2) * DAY_MS);

    return {
      studioId: studio._id,
      studioTitle: studio.title,
      studioImage: studio.image,
      studioLocation: studio.location,
      studioCategory: studio.category,
      hostName: studio.ownerName,
      hostEmail: studio.ownerEmail,
      userName: guest.name,
      userEmail: guest.email,
      date,
      startTime: plan.start,
      endTime: plan.end,
      startAt: slotDate(date, startMin),
      endAt: slotDate(date, endMin),
      hours,
      guests: plan.guests,
      notes: plan.notes,
      hourlyRate: studio.hourlyRate,
      subtotal,
      securityDeposit: studio.securityDeposit,
      totalPrice: subtotal + studio.securityDeposit,
      status: plan.status,
      ...(plan.status === 'Cancelled' && { cancelReason: 'Cancelled by creator' }),
      createdAt,
      updatedAt: createdAt,
      seeded: true,
    };
  });
  await bookings.insertMany(bookingDocs);
  console.log(`📅 Inserted ${bookingDocs.length} bookings`);

  await wishlists.insertMany(
    wishlistPlan.map((key, i) => ({
      userEmail: demo.email,
      studioId: byKey[key]._id,
      createdAt: new Date(now - i * DAY_MS),
      seeded: true,
    })),
  );
  console.log(`❤️  Saved ${wishlistPlan.length} studios to ${demo.email}'s wishlist`);
}

seed()
  .then(() => console.log('✅ Seed complete'))
  .catch((err) => {
    console.error('❌ Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(closeDb);
