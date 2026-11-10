# FarmyTrack Frontend

FarmyTrack is a Next.js farm operations dashboard for monitoring products, sales, harvests, expenses, spoilage, and business analytics for a farm owner.

## Overview

- Product management
- Sales tracking and revenue totals
- Harvest record management
- Expense tracking
- Spoilage tracking
- Dashboard summary cards
- Forecasting and recommendation insights
- Authentication with HttpOnly cookie-based session management

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Axios
- React Hook Form
- Zod
- Lucide React
- Sonner
- Recharts

## Folder structure

```text
frontend/
├── app/
│   ├── analytics/
│   ├── dashboard/
│   ├── expenses/
│   ├── harvests/
│   ├── login/
│   ├── products/
│   ├── register/
│   ├── sales/
│   ├── spoilages/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/
│   └── ui/
├── context/
├── lib/
├── services/
├── types/
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── README.md
├── tsconfig.json
└── eslint.config.mjs
```

## Installation

```bash
cd frontend
npm install
```

## Environment configuration

Create a local environment file from the example:

```bash
copy .env.example .env.local
```

Then ensure your backend is running at:

```env
NEXT_PUBLIC_API_URL=http://localhost:7000/api
```

Do not commit secrets or replace the existing `.env.local` with sample values.
For local development, set `FRONTEND_URL=http://localhost:3000` in the backend environment so credentialed API requests from Next.js pass CORS checks. Start the backend with `cd backend` then `npm run dev`, and start the frontend with `cd frontend` then `npm run dev`.

## Development

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:3000
```

## Production build

```bash
npm run build
npm run start
```

## Backend integration

This frontend expects the FarmyTrack backend to be available at `http://localhost:7000/api`.

Required operations include:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `GET /api/analytics/*`
- CRUD endpoints for products, sales, harvests, expenses, and spoilages

## Main routes

- `/` — landing page
- `/login` — owner login
- `/register` — new farm registration
- `/dashboard` — overview dashboard
- `/products` — product management
- `/sales` — sales tracking
- `/harvests` — harvest tracking
- `/expenses` — expense tracking
- `/spoilages` — spoilage tracking
- `/analytics` — descriptive, predictive, and prescriptive analytics

## Notes

- Authentication uses backend-issued HttpOnly cookies and `withCredentials` Axios requests.
- Frontend state is protected via server-safe route gating through the auth context.
- Real backend data is used; no permanent mock data is stored in the app.
- Farm and produce photographs are stored locally in `public/` and reused as restrained section headers and auth-page imagery; see the [Unsplash license](https://unsplash.com/license).
- The layout uses simple outlined content cards and grouped tiles, following [Material Design card guidance](https://m3.material.io/components/cards/guidelines) and [Carbon tile guidance](https://carbondesignsystem.com/building-blocks/core/components/tile/guidelines).
