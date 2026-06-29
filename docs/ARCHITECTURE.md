# Architecture

## Overview

NutriScan AI is a monorepo (npm workspaces) with two apps sharing a types package:

```
apps/frontend  (React SPA)  ──┐
apps/backend   (Express API) ─┼─→ packages/shared-types
                               │
                          PostgreSQL + Redis
```

## Request lifecycle (backend)

```
Request
  → Helmet, CORS, cookie-parser, compression
  → requestId, headerGuard, sanitizeInput   (Phase 8 security)
  → globalRateLimiter
  → /api/* routes
      → authenticate (JWT from cookie or Authorization header)
      → validate(ZodSchema)                  (DTO validation)
      → controller → service → repository/Prisma
  → notFoundHandler / errorHandler / Sentry
```

## Layered design (backend)

| Layer | Responsibility |
|-------|-----------------|
| **routes** | URL → middleware chain → controller |
| **controllers** | Parse req, call service, format response (`sendSuccess`/`sendError`) |
| **services** | Business logic, orchestration, transactions |
| **repositories** | Prisma queries (Phase 1–2 modules) |
| **utils** | Pure functions: health-rules/, food-matching/, jwt, logger |
| **dto** | Zod schemas — single source of truth for validation + types |

## AI Abstraction Layer (Phase 5)

```
IAIVisionProvider (interface)
   ├── GoogleVisionProvider   (production)
   ├── MockAIProvider          (dev, zero external calls)
   └── YOLOv8Provider          (stub — implement when custom model ready)
        ↑
   AIProviderFactory.getProvider()   ← reads AI_PROVIDER env var
```

Swapping providers requires **zero changes** to `scan.service.ts`, controllers, or routes — only `AI_PROVIDER` env var and the provider implementation.

## Food Matching Pipeline (Phase 5)

```
AI label (English/romanized)
  → removeDiacritics() normalization
  → 1. Exact alias dictionary    (score × 1.00)
  → 2. DB FoodAlias table         (score × 0.95, if similarity > 85%)
  → 3. Levenshtein + Dice fuzzy   (score × 0.80, if similarity > 55%)
  → 4. Token overlap keyword      (score × 0.70, if overlap > 60%)
  → final_score = match_score × AI_confidence
  → ranked FoodMatchResult[]
```

## Health Analysis Pipeline (Phase 6)

```
Meals + Water for day
  → aggregate nutrition (calories, macros, sugar, sodium, fiber, ...)
  → calculateDailyScore(nutrition, targets, conditions)
       ├── 6 weighted sub-scores → overall (0-100)
       └── generateAlerts() — condition-aware (DIABETES/HYPERTENSION/...)
  → recommendationService
       ├── buildDailyPrompt() — grounded in real data
       ├── Claude Haiku API call
       └── rule-based fallback (no hallucination risk either way)
  → upsert DailyAnalysis (cached for Phase 7 analytics)
```

## Analytics & Gamification (Phase 7)

Built entirely on top of `DailyAnalysis` rows from Phase 6 — no duplicate aggregation:

```
DailyAnalysis (cached daily scores/nutrition)
  ├── analyticsService.getPeriodSummary()   → cached in Redis (5 min TTL)
  ├── analyticsService.getDailyPoints()     → chart data (zero-filled)
  ├── analyticsService.getSmartInsights()   → 7 rule-based pattern detectors
  └── gamificationService
        ├── checkAchievements()  → 13 achievement conditions, auto-unlock + XP
        ├── getCurrentChallenge()→ 3 deterministic weekly challenges
        └── updateStreak()       → consecutive-day streak from DailyAnalysis
```

## Caching strategy (Phase 8)

- **Cache-aside** via `cached(key, ttl, fn)` in `@config/redis`
- Redis is **optional** — all cache functions degrade to direct DB calls if `REDIS_URL` unset or connection fails
- Invalidation: `invalidateAnalyticsCache(userId)` should be called after meal/water/weight mutations (cache-aside with short 5min TTL also self-heals)

## Security layers (Phase 8)

```
Helmet (CSP, HSTS, frame options)
  → CORS (allowlist from FRONTEND_URL)
  → cookie-parser (signed cookies)
  → sanitizeInput (strip $-keys, __proto__, prototype pollution)
  → headerGuard (reject abnormal headers)
  → globalRateLimiter / authRateLimiter / forgotPasswordLimiter / uploadRateLimiter
  → authenticate (JWT verify, checks lockedUntil)
  → csrfProtection (double-submit cookie, constant-time compare)
  → requireRole / requireOwnerOrAdmin (RBAC)
  → validate(ZodSchema) (request shape + type safety)
```

## Database indexing

Composite indexes added in Phase 8 for the hottest query paths:

- `Meal(userId, mealDate)` — daily/weekly/monthly aggregation queries
- `FoodScan(userId, status)` — scan history filtering

All Phase 6/7 analytics tables (`daily_analyses`, `weekly_analyses`, `user_achievements`, `weekly_challenges`) have `userId` + date/time indexes from their initial migration.

## Frontend architecture

- **Routing**: `react-router-dom` v6, lazy-loaded route components (code-splitting per page)
- **State**: Zustand for auth/UI state (persisted to localStorage), TanStack Query for server state (5-10 min staleTime per query)
- **Charts**: Recharts wrappers in `components/charts/`, memoized with `React.memo` (Phase 8) to avoid re-renders when parent dashboard state changes
- **Styling**: Tailwind + CSS variables for theming (light/dark), shadcn/ui primitives

## Deployment topology

```
Vercel (frontend, static + CDN)
   │  VITE_API_URL
   ▼
Railway (backend, Docker container)
   │
   ├── Supabase (managed PostgreSQL)
   ├── Railway Redis addon (or Upstash)
   ├── Cloudinary (image storage)
   ├── Google Cloud Vision (AI)
   ├── Anthropic API (recommendations)
   └── Sentry (error monitoring)
```
