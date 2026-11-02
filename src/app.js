import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { getDb } from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import studioRoutes from './routes/studio.routes.js';
import bookingRoutes from './routes/booking.routes.js';

const app = express();

app.set('trust proxy', 1);
app.use(cors({ origin: env.clientUrls, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ name: 'StudioSpace API', status: 'ok', docs: 'See README.md for the endpoint list.' });
});

app.get('/api/health', async (req, res) => {
  const db = await getDb();
  await db.command({ ping: 1 });
  res.json({ status: 'ok', database: 'connected' });
});

app.use('/api', authRoutes);
app.use('/api/studios', studioRoutes);
app.use('/api/bookings', bookingRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
