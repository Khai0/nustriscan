# 🥗 NutriScan AI

> Ứng dụng theo dõi dinh dưỡng thông minh dành cho người Việt — quét ảnh món ăn bằng AI, phân tích sức khoẻ chuyên sâu, và gamification để duy trì động lực.

[![CI](https://github.com/your-org/nutriscan-ai/actions/workflows/ci.yml/badge.svg)](.github/workflows/ci.yml)

---

## ✨ Tính năng chính

| Phase | Tính năng |
|-------|-----------|
| 1–2 | Monorepo architecture, PostgreSQL schema, Health Engine (BMR/TDEE) |
| 3 | Authentication doanh nghiệp: JWT + httpOnly cookies, CSRF, account lockout, email verification |
| 4 | UI Design System: dark mode, 25+ components, responsive layouts |
| 5 | **AI Food Recognition**: Google Vision + fuzzy matching cho 1000+ món Việt Nam |
| 6 | **Intelligent Health Analysis**: scoring engine, condition-aware rules, AI recommendations |
| 7 | **Premium Analytics**: charts, smart insights, achievements, weekly challenges, XP/levels |
| 8 | **Production hardening**: tests, Docker, CI/CD, monitoring, security |

---

## 🏗️ Tech Stack

**Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Zustand, TanStack Query, Recharts
**Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL, Redis, JWT
**AI**: Google Cloud Vision (swappable via abstraction layer → YOLOv8 ready), Claude Haiku for recommendations
**Storage**: Cloudinary (with local fallback)
**Testing**: Vitest, React Testing Library, Supertest, Playwright
**Infra**: Docker, GitHub Actions, Vercel (frontend), Railway (backend), Supabase (Postgres)

---

## 📁 Project Structure

```
nutriscan-ai/
├── apps/
│   ├── frontend/          # React + Vite SPA
│   │   ├── src/
│   │   │   ├── features/  # Feature modules (auth, scan, analysis, analytics, gamification)
│   │   │   ├── pages/      # Route-level pages
│   │   │   ├── components/ # Shared UI (ui/, common/, charts/, layout/)
│   │   │   ├── layouts/    # AuthLayout, DashboardLayout
│   │   │   ├── store/       # Zustand stores
│   │   │   └── lib/         # Axios, query client, utils
│   │   ├── e2e/             # Playwright tests
│   │   └── Dockerfile
│   └── backend/
│       ├── src/
│       │   ├── controllers/ # Thin HTTP handlers
│       │   ├── services/    # Business logic (auth, scan, analysis, analytics, ai/)
│       │   ├── repositories/# Prisma data access
│       │   ├── middlewares/ # auth, rbac, csrf, rateLimiter, security
│       │   ├── utils/        # health-rules/, food-matching/, logger, errors
│       │   ├── dto/          # Zod validation schemas
│       │   └── __tests__/    # Vitest unit + integration tests
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/   # phase2..phase7 SQL docs
│       │   └── seed.ts
│       └── Dockerfile
├── packages/
│   └── shared-types/        # Shared TS types (frontend ↔ backend)
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── SETUP.md
├── .github/workflows/        # CI + Deploy
├── docker-compose.yml
└── PHASE{1..8}.md             # Per-phase delivery notes
```

---

## 🚀 Quick Start (Docker — recommended)

```bash
git clone <repo> && cd nutriscan-ai
cp .env.example .env
# Edit .env — at minimum set the 4 secrets (32+ chars each):
#   JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, COOKIE_SECRET, CSRF_SECRET

docker compose up --build

# In another terminal — run migrations + seed
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/health
- Demo login: `demo@nutriscan.ai` / `Password123!`

---

## 🛠️ Local Development (without Docker)

```bash
npm install

# Backend
cp apps/backend/.env.example apps/backend/.env
# edit DATABASE_URL to point at a local Postgres instance

npm run db:migrate
npm run db:seed
npm run dev   # runs both frontend (5173→proxied) and backend (8000)
```

See [`docs/SETUP.md`](docs/SETUP.md) for full setup instructions, including Google Vision, Cloudinary, and Anthropic API configuration.

---

## 🧪 Testing

```bash
# Backend unit + integration tests (Vitest + Supertest)
npm run test --workspace=apps/backend
npm run test:coverage --workspace=apps/backend

# Frontend component tests (Vitest + RTL)
npm run test --workspace=apps/frontend

# E2E tests (Playwright)
npm run test:e2e --workspace=apps/frontend
```

---

## 📖 Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system design, data flow, AI abstraction layer
- [`docs/API.md`](docs/API.md) — full REST API reference
- [`docs/SETUP.md`](docs/SETUP.md) — environment setup, third-party services
- `PHASE1.md` … `PHASE8.md` — detailed notes per development phase

---

## 🔐 Security

- httpOnly cookies + CSRF double-submit tokens
- bcrypt (12 rounds), account lockout after 5 failed logins
- Rate limiting per-endpoint (auth, forgot-password, uploads)
- Input sanitization against NoSQL/prototype-pollution injection
- Helmet security headers, strict CSP
- Zod validation on every request body/query/params

---

## 📊 Monitoring

- `GET /api/health` — liveness probe
- `GET /api/health/ready` — readiness probe (checks DB + Redis)
- Winston structured logging (`apps/backend/src/utils/logger.ts`)
- Sentry error tracking (set `SENTRY_DSN` to enable)

---

## 📄 License

Proprietary — © 2024 NutriScan AI. All rights reserved.
