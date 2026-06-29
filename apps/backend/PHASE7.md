# NutriScan AI — Phase 7: Premium Analytics & Gamification

## Architecture

```
GET /api/analytics/period?type=daily|weekly|monthly
GET /api/analytics/trends?type=weekly
GET /api/analytics/meal-frequency?days=7
GET /api/analytics/weight-trend?days=30
GET /api/analytics/insights
GET /api/analytics/streak
GET /api/analytics/stats
GET /api/analytics/achievements
GET /api/analytics/challenges
         ↓
  analyticsService / gamificationService
         ↓
  Reads from DailyAnalysis (Phase 6 cache)
  + Meal, WeightTracking, FoodScan tables
         ↓
  UserStats / UserAchievement / WeeklyChallenge (new)
```

All analytics build on top of the `DailyAnalysis` table populated in Phase 6 — no duplicate computation.

---

## Analytics Endpoints

### Period Summary
`GET /api/analytics/period?type=weekly`

Returns averages over 1/7/30 days: calories, protein, carbs, fat, fiber, sugar, sodium, water, score, days logged.

### Trends (chart data)
`GET /api/analytics/trends?type=weekly`

Returns `DayPoint[]` — one entry per day (zero-filled for missing days), used directly by Recharts.

### Meal Frequency
`GET /api/analytics/meal-frequency?days=7`

Groups meals by type (BREAKFAST/LUNCH/DINNER/SNACK) with count + average calories — powers the bar chart.

### Weight Trend
`GET /api/analytics/weight-trend?days=30`

Returns weight entries + target weight from health profile.

### Smart Insights
`GET /api/analytics/insights`

Rule-based pattern detection over the last 7 days, e.g.:
- "Đường vượt mức thường xuyên" — sugar exceeded 3+ days
- "Protein liên tục thấp" — protein <70% target for 4+ days
- "Bữa trưa cao calo nhất" — lunch is consistently the highest-calorie meal
- "Điểm sức khoẻ cải thiện!" — score trending up within the week
- "Hay bỏ bữa sáng" — breakfast logged ≤2/7 days

---

## Gamification System

### XP & Levels
```
level = floor(1 + sqrt(xp / 100))
xpRequiredForLevel(L) = (L-1)² × 100
```
| Level | XP required |
|-------|------------|
| 1 | 0 |
| 2 | 100 |
| 3 | 400 |
| 4 | 900 |
| 5 | 1600 |

### Achievements (13 total)

| Achievement | Condition | XP | Rarity |
|-------------|-----------|-----|--------|
| FIRST_SCAN | 1st food scan | 50 | common |
| SCAN_10 | 10 scans | 100 | common |
| SCAN_50 | 50 scans | 300 | rare |
| STREAK_7 | 7-day logging streak | 200 | common |
| STREAK_30 | 30-day streak | 500 | rare |
| STREAK_100 | 100-day streak | 2000 | legendary |
| PROTEIN_MASTER | Protein target hit 5 days straight | 300 | rare |
| HEALTHY_WEEK | Score ≥80 every day for 7 days | 400 | rare |
| FIBER_CHAMPION | Fiber target 7 days straight | 250 | rare |
| HYDRATION_HERO | Water target 7 days straight | 250 | common |
| CALORIE_CONTROL | In calorie range 5 days straight | 300 | rare |
| PERFECT_DAY | Score = 100 on any day | 500 | epic |
| WEIGHT_GOAL | Reached target weight (±0.5kg) | 1000 | epic |

Achievements are checked on every `GET /api/analytics/achievements` call — any newly satisfied condition is unlocked, XP is awarded, and returned in `newUnlocks`.

### Weekly Challenges

3 challenges are deterministically selected each week (based on week number, so all users see the same rotation but it changes weekly):

| Challenge | Metric | Target | XP |
|-----------|--------|--------|-----|
| Protein Tuần | protein ≥90% target | 7 days | 300 |
| Chất xơ xanh | fiber ≥25g | 7 days | 250 |
| Nước 7 ngày | water ≥2000ml | 7 days | 200 |
| Điểm 75+ | score ≥75 | 5 days | 350 |
| Ăn nhạt | sodium ≤2000mg | 5 days | 280 |
| Kiểm soát đường | sugar ≤40g | 5 days | 300 |
| Cân bằng calo | 90-110% calorie target | 5 days | 320 |
| Không nghỉ | log every day | 7 days | 400 |

Progress is recalculated from `DailyAnalysis` on every fetch; XP is awarded once on completion.

### Streak Tracking
`currentStreak` = consecutive days (including today) with `mealCount > 0`, computed by walking backward from today. Stored in `UserStats` and recalculated on every `/streak` call.

---

## Frontend — Premium Dashboard

### `/analytics` — Main Hub (3 tabs)

**Tab 1: Tổng quan (Overview)**
- Period selector (Hôm nay / 7 ngày / 30 ngày)
- 4 stat cards: avg calories, protein, score, water
- Calorie trend bar chart (actual vs target)
- Health score area chart over time
- Macro ratio pie chart
- Smart insights list

**Tab 2: Bữa ăn & Cân (Meals & Weight)**
- Meal frequency bar chart (color-coded by meal type)
- Weight trend line chart with target line

**Tab 3: Thành tích (Achievements)**
- Level display with XP progress bar
- Streak badge (🔥 fire emoji, glows when ≥7 days)
- 3 weekly challenge cards with progress bars
- Achievement grid (unlocked vs locked, grayscale for locked)

### Reused from Phase 6
`/analytics/daily` and `/analytics/weekly` remain available for the detailed AI-driven analysis (scores breakdown, alerts, AI recommendations).

---

## New Chart Components

| Component | File | Purpose |
|-----------|------|---------|
| `HealthScoreChart` | NutritionCharts.tsx | Area chart, 0-100 score over time |
| `MealFrequencyChart` | NutritionCharts.tsx | Color-coded bar chart by meal type |

---

## New Gamification Components

| Component | Purpose |
|-----------|---------|
| `AchievementBadge` | Single badge — emoji/lock, rarity ring color |
| `AchievementGrid` | Unlocked/locked sections |
| `WeeklyChallengeCard` | Progress bar + completion badge |
| `LevelDisplay` | XP bar + level circle (compact + full modes) |
| `StreakBadge` | 🔥 streak counter, glows when hot (≥7) |

---

## Setup

### 1. Migrate
```bash
npm run db:migrate
```
Creates: `user_achievements`, `weekly_challenges`, `user_stats`.

### 2. Test

```bash
# Period summary
curl "http://localhost:8000/api/analytics/period?type=weekly" -H "Authorization: Bearer TOKEN"

# Trends for charts
curl "http://localhost:8000/api/analytics/trends?type=weekly" -H "Authorization: Bearer TOKEN"

# Smart insights
curl http://localhost:8000/api/analytics/insights -H "Authorization: Bearer TOKEN"

# Gamification
curl http://localhost:8000/api/analytics/stats -H "Authorization: Bearer TOKEN"
curl http://localhost:8000/api/analytics/achievements -H "Authorization: Bearer TOKEN"
curl http://localhost:8000/api/analytics/challenges -H "Authorization: Bearer TOKEN"
```

### Note
Analytics depend on `DailyAnalysis` records created in Phase 6 (`GET /api/analysis/daily`). For best results, call the daily analysis endpoint for each day with meal data first (or let it run organically as users log meals — the dashboard's `HealthScoreWidget` already calls it daily).
