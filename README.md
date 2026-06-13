# Food Waste Redistribution Platform

A full-stack marketplace for reducing food waste by connecting donors, sellers, charities, buyers, riders, volunteers, and admins in one operational flow. The project models a real redistribution system: surplus food can be posted, claimed or purchased, coordinated through chat, handed over with pickup codes, delivered by assigned helpers, reviewed after completion, and monitored by admins.

## Why This Project Matters

Food waste platforms are not only listing boards. A real system needs trust, timing, role-based access, logistics, and dispute handling. This project focuses on those harder product details: who is allowed to act, when food should expire, how handoff is verified, how buyers and charities coordinate with donors, and how admins keep the platform safe.

## Core Workflows

- Donors and sellers post surplus food as either donations or paid listings.
- Buyers place paid orders with self-pickup or home-delivery options.
- Charity organizations claim donation listings for redistribution.
- Pickup codes verify handoff before food changes status.
- Independent riders and organization volunteers support delivery flows.
- Users can message listing owners and coordinate directly.
- Completed activities can be rated to build trust.
- Issues can be reported and reviewed through admin complaint handling.
- Admins manage users, verifications, listings, complaints, order activity, and platform health.

## Main Features

- Role-based authentication for donor/seller, buyer, charity organization, independent delivery, organization volunteer, and admin users
- Email verification, password recovery, and secure token invalidation
- Role-specific profile completion and verification requirements
- Food listings with images, expiry windows, live filtering, and dynamic discount pricing
- Order and donation claim workflows with pickup authorization
- Home-delivery assignment for buyer orders and donation claims
- Realtime notifications and Socket.IO-powered chat
- My Activity page for purchases, sales, claims, deliveries, pickup codes, reports, and ratings
- Admin dashboard with user control, listing moderation, verification review, complaint handling, order oversight, and system health checks
- PostgreSQL migrations, typed backend models, and focused Jest coverage

## Architecture

```text
Food-Waste-Redistribution/
|-- backend/
|   |-- src/controllers   # Express request handlers
|   |-- src/services      # Business logic and workflow rules
|   |-- src/models        # TypeORM entities
|   |-- src/routes        # REST route modules
|   |-- src/migrations    # PostgreSQL schema history
|   `-- tests             # Jest unit and controller tests
|
|-- frontend/
|   |-- src/Pages         # Route-level React screens
|   |-- src/components    # UI, food, admin, order, and profile components
|   |-- src/store         # Zustand stores
|   |-- src/config        # API endpoint config
|   `-- src/lib           # Shared types and helpers
|
`-- README.md
```

## Tech Stack

**Frontend:** React, TypeScript, Vite, React Router, Zustand, Tailwind CSS, Radix UI, lucide-react

**Backend:** Node.js, Express, TypeScript, TypeORM, PostgreSQL, Socket.IO, Joi

**Services:** Supabase Postgres, Cloudinary, SMTP email

**Quality:** Jest, Supertest, TypeScript checks, database migrations, GitHub Actions-ready scripts

## Local Development

Requirements: Node.js 20+, npm, PostgreSQL, and optional Cloudinary/SMTP credentials for real uploads and emails.

Backend:

```bash
cd backend
npm ci
cp .env.example .env
npm run migration:run
npm run dev
```

Frontend:

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev
```

Typical local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Health check: `GET /api/health`

## Environment Overview

Backend `.env` needs database, JWT, frontend, CORS, SMTP, and Cloudinary values:

```env
PORT=4000
DB_HOST=<postgres-host>
DB_PORT=5432
DB_NAME=postgres
DB_USER=<postgres-user>
DB_PASSWORD=<postgres-password>
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
JWT_SECRET=<long-random-secret>
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
```

Frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_APP_NAME=Food Waste Redistribution
VITE_NODE_ENV=development
```

## Useful Commands

Backend:

```bash
npm run type-check
npm test
npm run build
npm run migration:show
npm run migration:run
```

Frontend:

```bash
npm run build
npm run dev
```

## API Areas

- `POST /api/auth/signup`, `POST /api/auth/login`
- `GET /api/food-listings`, `POST /api/food-listings/upload`
- `POST /api/orders/:id/create-order`
- `POST /api/orders/:id/authorize-pickup`
- `POST /api/orders/:id/complete-delivery`
- `POST /api/donations/:id/create-claim`
- `POST /api/donations/:id/authorize-pickup`
- `GET /api/chat/conversations`
- `POST /api/feedback/complaints`
- `POST /api/feedback/ratings`
- `GET /api/admin/dashboard/stats`
- `GET /api/admin/orders`
- `GET /api/admin/complaints`

## Deployment Notes

The frontend and backend are designed to deploy as separate projects. The REST API can run on serverless hosting, but Socket.IO chat and realtime notifications work best on a long-running Node host such as Render, Railway, Fly.io, EC2, or a VPS.

Before using a new database, run migrations from the backend project:

```bash
npm run migration:run
```

## Testing Status

The backend has Jest coverage for auth, validation, listings, orders, donations, notifications, chat, health, feedback, and pricing logic. The main verification commands are:

```bash
cd backend
npm run type-check
npm test

cd ../frontend
npm run build
```

## Contributors

- Mehedi Hasan
- Islam Tamjid
