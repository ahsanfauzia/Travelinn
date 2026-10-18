# TravelInn — Major Project

TravelInn is a MERN-style accommodation booking project with a React/Vite frontend, Express API and MongoDB database.

## Included features

- Public home page, property listing and property detail pages
- Property search/filter API (city, type, price range and guest count)
- Guest registration/login using bcrypt password hashing and JWT authentication
- Forgot/reset password flow with single-use, 15-minute reset tokens
- Wishlist saved to MongoDB per logged-in user
- Booking creation, date-overlap check, booking history and cancellation
- Razorpay order creation and server-side payment-signature verification
- Host dashboard and property create/edit/delete endpoints
- Reviews and ratings endpoints
- Admin dashboard, user/property/booking management endpoints
- Responsive UI layer and deployment environment examples

## Requirements

- Node.js LTS (Node 20 or newer recommended)
- MongoDB Atlas or a local MongoDB instance
- Resend account and a verified sender domain for real password-reset emails
- Razorpay test/live credentials if online payments are required

## Local setup (Windows)

1. Extract the ZIP. Open the `Travelinn` folder that directly contains `client`, `server`, and this README.
2. A local `server/.env` and `client/.env` are included with development defaults. The server uses local MongoDB (`mongodb://127.0.0.1:27017/travelinn`) and a generated development JWT secret. If you use MongoDB Atlas, replace `MONGO_URI` with your own Atlas URI. Never share or commit `.env` files.
3. `client/.env` is set to `VITE_API_URL=http://localhost:5000` for local development. If these files are missing, copy the corresponding `.env.example` files and fill them in.
4. Open one terminal in `Travelinn/server` and run:
   - `npm install`
   - `npm run dev`
5. Open a second terminal in `Travelinn/client` and run:
   - `npm install`
   - `npm run dev`
6. Open the Vite URL shown in the terminal (usually `http://localhost:5173`). The API health endpoint is `http://localhost:5000/`.

## Environment variables

### Server (`server/.env`)

- `PORT=5000`
- `NODE_ENV=development` locally; `production` when deployed
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — private random string, 32+ characters
- `CLIENT_URL` — frontend origin for CORS; local value `http://localhost:5173`; production value must be your exact deployed frontend origin
- `RESEND_API_KEY` — API key from Resend for password reset emails
- `SMTP_FROM` — sender address verified in Resend, e.g. `TravelInn <support@your-domain.com>`
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` — only needed for payments; use test credentials while testing

### Frontend (`client/.env`)

- `VITE_API_URL` — backend origin only, e.g. `http://localhost:5000` locally or `https://your-api-domain` in production. Do not append `/api` and do not add a trailing slash.

Restart/redeploy the frontend after changing Vite environment variables.

## First-time database setup

1. Start MongoDB and register a normal account through the site.
2. If you need a host account, update that user's `role` to `host` in MongoDB (unless you add a host onboarding/approval UI yourself).
3. For admin access, change one trusted account's `role` to `admin` in MongoDB. Never create an admin role from a public signup form.
4. Add sample properties using a host account. Property images are currently expected to be image URLs; there is no image upload/storage service included.
5. Confirm the property is visible on `/properties` before testing bookings.

Example MongoDB update in `mongosh` (replace the email with your own account):

```js
db.users.updateOne({ email: "your-email@example.com" }, { $set: { role: "admin" } })
```

Use `role: "host"` for a host account. Run this only against your own development database and never share credentials.

## Password reset setup

1. Create a Resend account and verify a domain/sender address for production delivery.
2. Add `RESEND_API_KEY` and `SMTP_FROM` to `server/.env` locally or to the backend host's environment settings.
3. Ensure `CLIENT_URL` is the actual frontend origin because the reset link is built from it.
4. Test `/forgot-password`, click the email link within 15 minutes, set a new password, then log in again.
5. In local development with email settings absent, the server logs a one-time reset URL and the form displays it for testing. This fallback is not for production.

## Deployment (frontend + backend separately)

- Deploy `server/` as a Node web service and `client/` as a Vite static site.
- Configure all server variables in the backend provider dashboard; configure `VITE_API_URL` in the frontend provider dashboard.
- Set `CLIENT_URL` to the deployed frontend origin, and permit the backend in MongoDB Atlas network access.
- Configure the frontend host's SPA rewrite so unknown paths serve `index.html`; otherwise refreshing `/wishlist`, `/login`, or `/reset-password/...` can return 404.
- Use HTTPS in production. Never put `JWT_SECRET`, MongoDB credentials, Resend API key or Razorpay secret in `client/.env` or any `VITE_` variable.
- Payment should first be tested using Razorpay test keys. Do not accept real money until the complete order/verification/cancellation/refund workflow has been reviewed.

## Pre-submission / deployment test checklist

- [ ] Register with a new email; confirm duplicate email is rejected.
- [ ] Login with correct and incorrect passwords.
- [ ] Forgot password for a registered email; verify email arrives; check expired/used link is rejected.
- [ ] Reset password; confirm old password fails and new password succeeds.
- [ ] Add wishlist items, refresh, log out/in, remove items; confirm data persists per account.
- [ ] Test past dates, checkout-before-checkin, excess guests, overlapping bookings and cancellation.
- [ ] Test host access and confirm one host cannot edit another host's property.
- [ ] Test Razorpay test payment and failed/cancelled payment handling.
- [ ] Test admin-only routes with guest/host tokens and admin token.
- [ ] Test mobile layout, broken image URLs, empty/error states and direct refresh of nested routes.
- [ ] Run `npm run build` in `client/` and check browser console + backend logs.

## Known scope / things not to claim as production-complete yet

- Email delivery depends on your own Resend key and verified sender domain.
- Payment depends on your own Razorpay credentials and must be tested end-to-end.
- Property images are URLs, not file uploads; image hosting is not bundled.
- Host/admin roles require trusted manual database promotion; there is no self-service host approval flow.
- Booking refunds, email booking confirmations, production monitoring, rate limiting, automated tests and a full transactional inventory-locking system still need additional work before a real commercial launch.
- A successful ZIP/package check does not replace testing against your own live database and provider credentials.
