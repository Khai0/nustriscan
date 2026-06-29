# Setup Guide

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 16 (or Docker)
- Redis 7 (optional — gracefully degrades without it)

---

## 1. Clone & install

```bash
git clone <repo> && cd nutriscan-ai
npm install
```

This installs dependencies for all workspaces (`apps/frontend`, `apps/backend`, `packages/shared-types`).

---

## 2. Environment variables

### Backend (`apps/backend/.env`)

```bash
cp apps/backend/.env.example apps/backend/.env
```

**Required (generate with `openssl rand -base64 32`):**
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/nutriscan_ai
JWT_ACCESS_SECRET=<32+ chars>
JWT_REFRESH_SECRET=<32+ chars>
COOKIE_SECRET=<32+ chars>
CSRF_SECRET=<32+ chars>
```

**Optional but recommended:**
| Variable | Purpose | Fallback if unset |
|----------|---------|--------------------|
| `REDIS_URL` | Caching | In-memory/no cache (degrades gracefully) |
| `AI_PROVIDER` | `mock` \| `google_vision` \| `yolov8` | `mock` (no external calls) |
| `GOOGLE_VISION_API_KEY` | Real food recognition | N/A if `AI_PROVIDER=mock` |
| `CLOUDINARY_*` | Image storage | Local filesystem `/uploads` |
| `ANTHROPIC_API_KEY` | AI nutrition recommendations | Rule-based fallback text |
| `SMTP_*` | Email verification/reset | Logs email content to console |
| `SENTRY_DSN` | Error monitoring | Disabled |

### Frontend (`apps/frontend/.env`)

```env
VITE_API_URL=http://localhost:8000
```

---

## 3. Database setup

### Option A: Docker (recommended)
```bash
docker compose up -d postgres redis
```

### Option B: Local Postgres
Create a database matching your `DATABASE_URL`:
```bash
createdb nutriscan_ai
```

### Run migrations + seed
```bash
cd apps/backend
npx prisma migrate deploy   # applies all migrations
npx prisma db seed          # seeds 16 Vietnamese foods, aliases, demo user
```

Demo account: `demo@nutriscan.ai` / `Password123!`

---

## 4. Run the apps

```bash
npm run dev   # from repo root — runs frontend (Vite) + backend (tsx watch) concurrently
```

- Frontend: http://localhost:5173 (Vite dev server, proxies `/api` to backend)
- Backend: http://localhost:8000

---

## 5. Third-party service setup

### Google Cloud Vision (Phase 5)
1. Create a GCP project → enable **Cloud Vision API**
2. Create an API key (Credentials → Create Credentials → API Key)
3. Restrict the key to "Cloud Vision API" for security
4. Set `AI_PROVIDER=google_vision` and `GOOGLE_VISION_API_KEY=...`

Without this, `AI_PROVIDER=mock` returns realistic-looking labels for development with zero cost.

### Cloudinary (Phase 5)
1. Sign up at cloudinary.com (free tier is sufficient)
2. Dashboard → copy Cloud Name, API Key, API Secret
3. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

Without this, images are stored on local disk under `apps/backend/uploads/` (served at `/uploads/*`).

### Anthropic API (Phase 6)
1. Get an API key from console.anthropic.com
2. Set `ANTHROPIC_API_KEY=sk-ant-...`

Without this, `recommendationService` uses rule-based Vietnamese text generated from the same scoring data — still accurate, just less personalized in phrasing.

### Gmail SMTP (Phase 3, optional)
1. Enable 2FA on your Google account
2. Generate an App Password (Google Account → Security → App Passwords)
3. Set:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=you@gmail.com
   SMTP_PASS=<app password>
   ```

### Sentry (Phase 8, optional)
1. Create a project at sentry.io (Node.js platform)
2. Copy the DSN → `SENTRY_DSN=https://...@sentry.io/...`

---

## 6. Testing

```bash
# Backend (Vitest + Supertest) — mocks Prisma, no DB required for these specs
npm run test --workspace=apps/backend

# Frontend (Vitest + React Testing Library)
npm run test --workspace=apps/frontend

# E2E (Playwright) — builds + serves the frontend automatically
npx playwright install --with-deps chromium
npm run test:e2e --workspace=apps/frontend
```

The `authenticated-flow.spec.ts` E2E spec requires a running backend with the seeded demo account — set `E2E_BASE_URL` and ensure `VITE_API_URL` points at it.

---

## 7. Production build

```bash
npm run build --workspace=packages/shared-types
npm run build --workspace=apps/backend
npm run build --workspace=apps/frontend
```

Or via Docker:
```bash
docker compose -f docker-compose.yml build
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `JWT_ACCESS_SECRET must be 32+ chars` | Run `openssl rand -base64 32` and paste into `.env` |
| Prisma `P1001: Can't reach database` | Check `DATABASE_URL`, ensure Postgres container/service is running |
| Redis warnings in logs | Harmless — caching disabled, app works normally. Set `REDIS_URL` to enable |
| Google Vision 403 | API key not enabled for Cloud Vision API, or billing not enabled on GCP project |
| Images not uploading | Check Cloudinary creds, or confirm `apps/backend/uploads/` is writable (local fallback) |
| Playwright "browser not found" | Run `npx playwright install --with-deps chromium` |
