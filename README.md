# StudioSpace API

REST API for **StudioSpace**, a peer-to-peer marketplace for booking creative studios by the hour. Built with **Express 5** and the **MongoDB** native driver.

- 🌐 **Client repository / live site:** see the `studiospace-client` README

## Highlights

- **JWT in HTTPOnly cookies** — `POST /api/jwt` verifies a short-lived BetterAuth token against the client's JWKS (`jose`) and issues the API's own JWT as an HTTPOnly cookie. Every mutation is guarded by `verifyToken` and answers **401 Unauthorized** without a valid cookie; ownership checks return **403**.
- **Double-booking prevention** — new requests and host confirmations are checked against existing **Confirmed** bookings with an overlap query (`startAt < newEnd && endAt > newStart`); collisions return **409** with a clear message.
- **MongoDB operators & aggregations** — `$regex` search, `$gte/$lte` ranges, `.sort().limit(6)` for featured studios, `$group`/`$avg` rating roll-ups, `$lookup` for the wishlist and `$group`/`$sum` dashboard stats.
- **Explicit booking state machine** — Pending → Confirmed/Cancelled, Confirmed → Completed/Cancelled.
- **Serverless-friendly** — cached Mongo connection, indexes created on first connect, `vercel.json` included.

## Endpoints

🔒 = requires the HTTPOnly JWT cookie.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/health` | API + database health check |
| POST | `/api/jwt` | Exchange a BetterAuth JWT for the API cookie |
| POST | `/api/logout` | Clear the API cookie |
| GET | `/api/me` 🔒 | Current user from the cookie |
| GET | `/api/studios` | List with `search`, `category`, `sort`, `minPrice`, `maxPrice`, `minCapacity`, `page`, `limit` |
| GET | `/api/studios/featured` | Six top-rated studios |
| GET | `/api/studios/categories` | Listing count and starting price per category |
| GET | `/api/studios/mine` 🔒 | Studios owned by the current user |
| GET | `/api/studios/:id` | Studio details |
| GET | `/api/studios/:id/availability?date=` | Pending/confirmed slots for a day |
| POST | `/api/studios` 🔒 | Create a studio |
| PATCH / PUT | `/api/studios/:id` 🔒 | Update your studio |
| DELETE | `/api/studios/:id` 🔒 | Delete your studio (cancels its pending requests) |
| GET | `/api/studios/:id/reviews` | Reviews, newest first |
| POST | `/api/studios/:id/reviews` 🔒 | Add or update your review |
| POST | `/api/bookings` 🔒 | Request a booking (status `Pending`) |
| GET | `/api/bookings/mine` 🔒 | Your bookings |
| PATCH | `/api/bookings/:id/cancel` 🔒 | Cancel your pending booking |
| GET | `/api/bookings/requests` 🔒 | Bookings on studios you host |
| PATCH | `/api/bookings/:id/status` 🔒 | Host: confirm, decline, complete or cancel |
| GET | `/api/dashboard/stats` 🔒 | Listing, booking and earnings totals |
| GET | `/api/wishlist` 🔒 | Saved studios |
| GET | `/api/wishlist/ids` 🔒 | Saved studio ids |
| POST | `/api/wishlist` 🔒 | Save a studio |
| DELETE | `/api/wishlist/:studioId` 🔒 | Remove a saved studio |
| GET | `/api/stats` | Public platform numbers |
| POST | `/api/newsletter` | Newsletter signup |

## Run locally

```bash
npm install
cp .env.example .env      # fill in MONGODB_URI and JWT_SECRET
npm run seed              # optional: demo studios, reviews, bookings and wishlist
npm run dev               # http://localhost:5000
```

The seed only replaces documents tagged `seeded: true`, so it's safe to re-run. Create the matching examiner login with `npm run seed:demo` in the client repo.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | Local port (default `5000`) |
| `MONGODB_URI`, `DB_NAME` | MongoDB connection — same database as the client |
| `CLIENT_URL` | Client origin(s), comma separated; the first is used to fetch BetterAuth's JWKS |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Signing secret and lifetime of the HTTPOnly cookie JWT |
| `BETTER_AUTH_JWKS_URL` | Optional override for the JWKS URL |
| `DEMO_USER_EMAIL`, `DEMO_USER_NAME` | Account the seed attaches demo listings and bookings to |

## Deploy (Vercel)

Import the repo, add the environment variables (with `NODE_ENV=production` and `CLIENT_URL` set to the deployed client URL) and deploy. `vercel.json` routes every request to `index.js`, which exports the Express app.
