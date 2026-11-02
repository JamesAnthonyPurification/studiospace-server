import { MongoClient, ServerApiVersion } from 'mongodb';
import { env } from './env.js';

// Cache the connection on globalThis so serverless invocations and
// `node --watch` restarts reuse a single client instead of opening new ones.
const cache = (globalThis.__studiospaceMongo ??= { promise: null });

async function createIndexes(db) {
  await Promise.all([
    db.collection('studios').createIndexes([
      { key: { ownerEmail: 1 } },
      { key: { category: 1 } },
      { key: { rating: -1, reviewCount: -1 } },
      { key: { createdAt: -1 } },
    ]),
    db.collection('bookings').createIndexes([
      { key: { studioId: 1, status: 1, startAt: 1, endAt: 1 } },
      { key: { userEmail: 1, createdAt: -1 } },
      { key: { hostEmail: 1, createdAt: -1 } },
    ]),
    db.collection('reviews').createIndex({ studioId: 1, userEmail: 1 }, { unique: true }),
    db.collection('wishlists').createIndex({ userEmail: 1, studioId: 1 }, { unique: true }),
    db.collection('newsletter').createIndex({ email: 1 }, { unique: true }),
  ]);
}

export async function getDb() {
  if (!cache.promise) {
    if (!env.mongoUri) throw new Error('MONGODB_URI is not set. Copy .env.example to .env and fill it in.');

    const client = new MongoClient(env.mongoUri, {
      serverApi: { version: ServerApiVersion.v1, strict: false, deprecationErrors: true },
    });

    cache.promise = client
      .connect()
      .then(async (connected) => {
        await createIndexes(connected.db(env.dbName));
        return connected;
      })
      .catch((err) => {
        cache.promise = null; // allow a retry on the next request
        throw err;
      });
  }

  const client = await cache.promise;
  return client.db(env.dbName);
}

export async function getCollections() {
  const db = await getDb();
  return {
    studios: db.collection('studios'),
    bookings: db.collection('bookings'),
    reviews: db.collection('reviews'),
    wishlists: db.collection('wishlists'),
    newsletter: db.collection('newsletter'),
  };
}

export async function closeDb() {
  if (!cache.promise) return;
  const client = await cache.promise;
  await client.close();
  cache.promise = null;
}
