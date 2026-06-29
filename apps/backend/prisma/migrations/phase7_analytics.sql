-- ============================================================
-- NutriScan AI — Phase 7 Schema Changes
-- Run via: npm run db:migrate
-- ============================================================

CREATE TYPE "AchievementType" AS ENUM (
  'STREAK_7','STREAK_30','STREAK_100','PROTEIN_MASTER','HEALTHY_WEEK',
  'FIBER_CHAMPION','HYDRATION_HERO','CALORIE_CONTROL','FIRST_SCAN',
  'SCAN_10','SCAN_50','WEIGHT_GOAL','PERFECT_DAY'
);

-- user_achievements
CREATE TABLE "user_achievements" (
  "id"          TEXT              NOT NULL PRIMARY KEY,
  "userId"      TEXT              NOT NULL,
  "achievement" "AchievementType" NOT NULL,
  "unlockedAt"  TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "progress"    DOUBLE PRECISION  NOT NULL DEFAULT 0,
  "metadata"    JSONB,
  CONSTRAINT "user_achievements_userId_achievement_key" UNIQUE ("userId","achievement"),
  CONSTRAINT "user_achievements_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "user_achievements_userId_idx" ON "user_achievements"("userId");

-- weekly_challenges
CREATE TABLE "weekly_challenges" (
  "id"           TEXT          NOT NULL PRIMARY KEY,
  "userId"       TEXT          NOT NULL,
  "weekStart"    DATE          NOT NULL,
  "challengeId"  TEXT          NOT NULL,
  "title"        TEXT          NOT NULL,
  "description"  TEXT          NOT NULL,
  "targetValue"  DOUBLE PRECISION NOT NULL,
  "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "completed"    BOOLEAN       NOT NULL DEFAULT false,
  "completedAt"  TIMESTAMP(3),
  "rewardXp"     INTEGER       NOT NULL DEFAULT 100,
  CONSTRAINT "weekly_challenges_userId_weekStart_challengeId_key" UNIQUE ("userId","weekStart","challengeId"),
  CONSTRAINT "weekly_challenges_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "weekly_challenges_userId_idx"    ON "weekly_challenges"("userId");
CREATE INDEX "weekly_challenges_weekStart_idx" ON "weekly_challenges"("weekStart");

-- user_stats
CREATE TABLE "user_stats" (
  "id"               TEXT         NOT NULL PRIMARY KEY,
  "userId"           TEXT         NOT NULL UNIQUE,
  "totalXp"          INTEGER      NOT NULL DEFAULT 0,
  "level"            INTEGER      NOT NULL DEFAULT 1,
  "currentStreak"    INTEGER      NOT NULL DEFAULT 0,
  "longestStreak"    INTEGER      NOT NULL DEFAULT 0,
  "totalMealsLogged" INTEGER      NOT NULL DEFAULT 0,
  "totalScans"       INTEGER      NOT NULL DEFAULT 0,
  "avgDailyScore"    DOUBLE PRECISION NOT NULL DEFAULT 0,
  "lastLoggedAt"     TIMESTAMP(3),
  "updatedAt"        TIMESTAMP(3) NOT NULL,
  CONSTRAINT "user_stats_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "user_stats_userId_idx" ON "user_stats"("userId");
