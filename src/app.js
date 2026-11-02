import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

app.set('trust proxy', 1);
app.use(cors({ origin: env.clientUrls, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ name: 'StudioSpace API', status: 'ok', docs: 'See README.md for the endpoint list.' });
});

app.use(notFound);
app.use(errorHandler);

export default app;
