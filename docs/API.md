# API Reference

Base URL: `http://localhost:8000/api` (dev) · configured via `VITE_API_URL` (frontend)

All responses follow the shape:
```json
{ "success": true, "message": "...", "data": { } }
```
Errors:
```json
{ "success": false, "message": "...", "data": null }
```

Authenticated routes accept the access token via **httpOnly cookie** (set automatically on login) or `Authorization: Bearer <token>` header. Mutating requests additionally require the `x-csrf-token` header (read from the `csrf_token` cookie).

---

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | – | Liveness probe |
| GET | `/health/ready` | – | Readiness probe (DB + Redis) |

---

## Auth (`/auth`)

| Method | Path | Auth | Rate limit | Description |
|--------|------|------|-----------|-------------|
| POST | `/auth/register` | – | 10/15min | Register + send verification email |
| POST | `/auth/login` | – | 10/15min | Login, sets cookies |
| POST | `/auth/refresh` | cookie | – | Rotate access/refresh tokens |
| POST | `/auth/logout` | – | – | Revoke refresh token, clear cookies |
| POST | `/auth/logout-all` | ✅ + CSRF | – | Revoke all sessions |
| GET  | `/auth/me` | ✅ | – | Current user profile |
| POST | `/auth/verify-email` | – | – | Verify via token |
| POST | `/auth/resend-verification` | – | 3/15min | Resend verification email |
| POST | `/auth/forgot-password` | – | 5/hour | Request reset email |
| POST | `/auth/reset-password` | – | 10/15min | Reset password via token |
| POST | `/auth/change-password` | ✅ + CSRF | – | Change password (revokes sessions) |

**Register/Login body**:
```json
{ "email": "demo@nutriscan.ai", "password": "Password123!", "name": "Demo User", "rememberMe": false }
```

---

## Health Profile (`/health-profile`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health-profile` | ✅ | Get profile (BMR/TDEE/targets) |
| PUT | `/health-profile` | ✅ | Update profile, recalculates targets |

---

## Foods (`/foods`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/foods` | ✅ | List/search food database |
| GET | `/foods/:id` | ✅ | Food item detail |

---

## Meals (`/meals`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/meals` | ✅ | List meals (filter by date range) |
| POST | `/meals` | ✅ | Create meal manually |
| GET | `/meals/:id` | ✅ | Meal detail with items |
| PATCH | `/meals/:id` | ✅ | Update meal |
| DELETE | `/meals/:id` | ✅ | Soft-delete meal |

---

## Water / Weight (`/water`, `/weight`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET/POST | `/water` | ✅ | Get/log water intake |
| GET/POST | `/weight` | ✅ | Get/log weight entries |

---

## AI Scans (`/scans`) — Phase 5

| Method | Path | Auth | Rate limit | Description |
|--------|------|------|-----------|-------------|
| POST | `/scans/analyze` | ✅ | 10/min | Upload image → AI detection → food matches |
| POST | `/scans/:id/confirm` | ✅ | – | Confirm match + serving size → creates Meal |
| GET | `/scans/history` | ✅ | – | Paginated scan history |
| GET | `/scans/:id` | ✅ | – | Scan detail |
| DELETE | `/scans/:id` | ✅ | – | Delete scan + image |

**Analyze** (multipart/form-data, field `image`):
```
curl -X POST /api/scans/analyze -H "Authorization: Bearer TOKEN" -F "image=@food.jpg"
```

**Confirm body**:
```json
{
  "foodItemId": "clxxx...",
  "mealType": "LUNCH",
  "mealDate": "2024-01-15",
  "servingPreset": "medium",
  "customGrams": null,
  "notes": "optional"
}
```

---

## Health Analysis (`/analysis`) — Phase 6

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/analysis/daily?date=YYYY-MM-DD` | ✅ | Score, alerts, AI recommendation for a day |
| GET | `/analysis/weekly?weekStart=YYYY-MM-DD` | ✅ | 7-day trends, deficiencies, habits, AI insight |
| GET | `/analysis/conditions` | ✅ | List user's health conditions |
| POST | `/analysis/conditions` | ✅ | Add/update condition |
| DELETE | `/analysis/conditions/:condition` | ✅ | Remove condition |

**Condition values**: `DIABETES`, `HYPERTENSION`, `OBESITY`, `HIGH_CHOLESTEROL`, `CELIAC`, `LACTOSE_INTOLERANT`, `NONE`

**Daily response** (abridged):
```json
{
  "data": {
    "date": "2024-01-15",
    "nutrition": { "calories": 1420, "protein": 72, "fiber": 18, "sugar": 38, "sodium": 1850 },
    "scoring": {
      "scores": { "overall": 67, "calorie": 72, "protein": 55, "sugar": 78, "sodium": 65, "fiber": 58, "diversity": 85 },
      "grade": "good",
      "alerts": [ { "id": "low_protein", "severity": "WARNING", "title": "...", "message": "...", "recommendation": "..." } ]
    },
    "recommendation": "AI-generated text...",
    "mealCount": 3
  }
}
```

---

## Analytics & Gamification (`/analytics`) — Phase 7

| Method | Path | Auth | Cache | Description |
|--------|------|------|-------|-------------|
| GET | `/analytics/period?type=daily\|weekly\|monthly` | ✅ | 5min | Period averages |
| GET | `/analytics/trends?type=weekly` | ✅ | – | Chart-ready daily points |
| GET | `/analytics/meal-frequency?days=7` | ✅ | – | Meal counts/avg-calories by type |
| GET | `/analytics/weight-trend?days=30` | ✅ | – | Weight history + target |
| GET | `/analytics/insights` | ✅ | – | Smart pattern-based insights |
| GET | `/analytics/streak` | ✅ | – | Current/longest logging streak |
| GET | `/analytics/stats` | ✅ | – | XP, level, totals |
| GET | `/analytics/achievements` | ✅ | – | All 13 achievements + unlock status; checks for new unlocks |
| GET | `/analytics/challenges` | ✅ | – | Current week's 3 challenges + progress |

**Period summary response**:
```json
{
  "data": {
    "period": "weekly", "label": "7 ngày qua",
    "avgCalories": 1874, "avgProtein": 88, "avgScore": 72,
    "daysLogged": 6, "totalMeals": 18,
    "calorieTarget": 2100, "proteinTarget": 160
  }
}
```

**Achievement object**:
```json
{
  "id": "STREAK_7", "type": "STREAK_7", "title": "7 ngày liên tiếp 🔥",
  "description": "Ghi nhận bữa ăn 7 ngày liên tiếp", "emoji": "🔥",
  "xp": 200, "rarity": "common",
  "unlocked": true, "unlockedAt": "2024-01-15T08:00:00Z", "progress": 100
}
```

---

## Error codes

| HTTP | Meaning |
|------|---------|
| 400 | Validation error (Zod) — `data: null`, `message` describes the issue |
| 401 | Missing/invalid/expired token |
| 403 | Authenticated but not authorized (RBAC) |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error (logged to Winston/Sentry) |
| 503 | `/health/ready` — dependency (DB/Redis) unavailable |
