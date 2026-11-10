# FarmyTrack

FarmyTrack is a farm operations and business analytics app for managing products, sales, harvests, expenses, and spoilage.

## Project layout

- `frontend/` — Next.js App Router, React, TypeScript, and Tailwind CSS.
- `backend/` — Express API, PostgreSQL/Neon, Drizzle ORM, and cookie-based authentication.
- `reference-frontend/` is intentionally excluded from this repository; it is a separate reference project.

## Run locally

Requirements: Node.js 20.9 or later and PostgreSQL/Neon.

1. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL` and `AUTH_SECRET`.
2. Copy `frontend/.env.example` to `frontend/.env.local`.
3. In `backend/`, run `npm ci`, `npm run db:migrate`, and `npm run dev`.
4. In `frontend/`, run `npm ci` and `npm run dev`.
5. Open <http://localhost:3000>.

Do not commit `.env`, `.env.local`, database URLs, or authentication secrets.

## Deploy

The project is configured for a Render API and a Vercel frontend. The frontend proxies `/api` requests to Render so browser auth cookies remain same-origin.

### API on Render

Create a Render Blueprint from this repository using `render.yaml`. Set these secret/environment values for the `farmytrack-api` service:

- `DATABASE_URL` — the production PostgreSQL/Neon connection string.
- `AUTH_SECRET` — a unique, random secret of at least 32 bytes.
- `FRONTEND_URL` — the deployed Vercel production origin, with no trailing slash.

After the service is created, run `npm run db:migrate` in the backend service shell before using the app. The API health endpoint is `/`.

### Frontend on Vercel

Import this repository and set the project Root Directory to `frontend`. Add:

- `NEXT_PUBLIC_API_URL` — `/api`
- `FARMYTRACK_API_ORIGIN` — `https://<your-render-service>.onrender.com` (origin only, no `/api`)

Deploy after the Render API is available. Set `FARMYTRACK_API_ORIGIN` before the Vercel build so the Next.js rewrite is included. Auth cookies remain `SameSite=Lax; Secure` and same-origin through the proxy.

## Checks

```powershell
cd frontend
npm run lint
npx tsc --noEmit
npm run build

cd ..\backend
npm run typecheck
```
