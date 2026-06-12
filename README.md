# Food Waste Redistribution Platform

Food Waste Redistribution is a full-stack web app for connecting food donors, sellers, charities, buyers, and delivery volunteers. Donors can list surplus food for donation or sale, buyers and charities can place orders or claims, and volunteers can help coordinate delivery.

## Features

- Role-based signup and login for donors/sellers, charities, buyers, independent delivery volunteers, organization volunteers, and admins
- Email verification and password recovery
- Role-specific profile completion
- Food listing creation with image upload support
- Donation claim and paid order flows
- Pickup codes for handoff confirmation
- Delivery records and notification records
- Admin dashboard for users, verification requests, listings, complaints, and platform stats

## Tech Stack

- Frontend: React 19, TypeScript, Vite, React Router, Zustand, Tailwind CSS, Radix UI
- Backend: Node.js, Express, TypeScript, TypeORM, PostgreSQL, Joi
- Storage and services: Supabase Postgres, Cloudinary, SMTP email
- Testing and CI: Jest, Supertest, GitHub Actions

## Project Structure

```text
Food-Waste-Redistribution/
|-- backend/      # Express API, TypeORM models, migrations, tests
|-- frontend/     # Vite React app
`-- README.md
```

## Local Setup

Requirements:

- Node.js 20+. Use the version in `.nvmrc`.
- npm
- A PostgreSQL database. Supabase Postgres works well.
- Cloudinary credentials if you want real image uploads.
- SMTP credentials if you want real email verification/password reset delivery.

### Backend

```bash
cd backend
npm ci
cp .env.example .env
```

Fill `backend/.env`:

```env
PORT=4000
DB_HOST=aws-1-ap-northeast-1.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.<project-ref>
DB_PASSWORD=<your-password>
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
JWT_SECRET=<long-random-secret>
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

For a fresh database, run migrations:

```bash
npm run migration:show
npm run migration:run
```

Start the API:

```bash
npm run dev
```

The backend defaults to `http://localhost:4000`.

Useful backend commands:

```bash
npm run type-check
npm run test
npm run build
npm run migration:show
npm run migration:run
npm run migration:revert
```

### Frontend

```bash
cd frontend
npm ci
cp .env.example .env
```

Fill `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_APP_NAME=Food Waste Redistribution
VITE_NODE_ENV=development
```

Start the frontend:

```bash
npm run dev
```

The frontend defaults to `http://localhost:5173`.

Useful frontend commands:

```bash
npm run build
npm run lint
npm run preview
```

## Deployment Notes

This repo is easiest to deploy as two separate projects:

- Backend project root: `backend`
- Frontend project root: `frontend`

### Backend Environment

Set these variables in the backend host:

```env
NODE_ENV=production
DB_HOST=<supabase-pooler-host>
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.<project-ref>
DB_PASSWORD=<your-database-password>
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=24h
FRONTEND_URL=https://<your-frontend-domain>
CORS_ORIGINS=https://<your-frontend-domain>,http://localhost:5173
SMTP_HOST=<your-smtp-host>
SMTP_PORT=465
SMTP_USER=<your-smtp-user>
SMTP_PASSWORD=<your-smtp-password>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
```

Run migrations against the production database before using a fresh deployment:

```bash
cd backend
npm run migration:show
npm run migration:run
```

After deployment, check:

```http
GET /api/health
```

The endpoint returns `200` when the API and database are reachable. It returns `503` with `status: "degraded"` when the API is up but the database is not reachable.

### Frontend Environment

Set this in the frontend host:

```env
VITE_API_BASE_URL=https://<your-backend-domain>
VITE_APP_NAME=Food Waste Redistribution
VITE_NODE_ENV=production
```

### Realtime Hosting Note

Vercel serverless functions are fine for the REST API, but they are not a good fit for long-running Socket.IO connections. For production realtime notifications and live chat, deploy the backend on a long-running Node host such as Render, Railway, Fly.io, an EC2/VPS server, or switch realtime features to a managed realtime service.

## API Overview

### Health

```http
GET /api/health
```

### Auth

```http
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/verify-email
POST /api/auth/request-password-reset
POST /api/auth/reset-password
POST /api/auth/change-password
```

### Profile

```http
GET /api/profile/get-profile
POST /api/profile/complete
PUT /api/profile/update-profile
```

### Food Listings

```http
GET /api/food-listings
GET /api/food-listings/search
GET /api/food-listings/:id
POST /api/food-listings/upload
GET /api/food-listings/my/listings
GET /api/food-listings/my/stats
PUT /api/food-listings/:id/update
DELETE /api/food-listings/:id
POST /api/food-listings/:id/negotiate
PATCH /api/food-listings/:id/status
```

### Orders

```http
POST /api/orders/:id/create-order
POST /api/orders/:id/authorize-pickup
POST /api/orders/:id/complete-delivery
POST /api/orders/:id/report-failure
GET /api/orders/:id
GET /api/orders/my/purchases
GET /api/orders/my/sales
GET /api/orders/my/deliveries
GET /api/orders/my/stats
PUT /api/orders/:id/cancel
```

### Donations

```http
POST /api/donations/:id/create-claim
POST /api/donations/:id/authorize-pickup
POST /api/donations/:id/complete-delivery
POST /api/donations/:id/report-failure
GET /api/donations/:id
GET /api/donations/my/claims
GET /api/donations/my/offers
GET /api/donations/my/deliveries
GET /api/donations/my/stats
PUT /api/donations/:id/cancel
```

### Notifications

```http
GET /api/notifications/get-notifications
PATCH /api/notifications/:notificationId/read
PATCH /api/notifications/read-all
```

### Admin

```http
GET /api/admin/dashboard/stats
GET /api/admin/system/health
GET /api/admin/users
PUT /api/admin/users/:userId/suspend
PUT /api/admin/users/:userId/reactivate
GET /api/admin/verifications/pending
POST /api/admin/verifications/process
GET /api/admin/food-listings
DELETE /api/admin/food-listings/:listingId
GET /api/admin/complaints
PUT /api/admin/complaints/:complaintId/resolve
```

## Contributors

- Mehedi Hasan
- Islam Tamjid
