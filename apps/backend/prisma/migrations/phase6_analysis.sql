-- ============================================================
-- NutriScan AI — Phase 6 Schema Changes
-- Run via: npm run db:migrate
-- ============================================================

CREATE TYPE "HealthCondition" AS ENUM (
  'DIABETES','HYPERTENSION','OBESITY',
  'HIGH_CHOLESTEROL','CELIAC','LACTOSE_INTOLERANT','NONE'
);

CREATE TYPE "AlertSeverity" AS ENUM ('INFO','WARNING','DANGER');

-- daily_analyses
CREATE TABLE "daily_analyses" (
  "id"            TEXT          NOT NULL PRIMARY KEY,
  "userId"        TEXT          NOT NULL,
  "date"          DATE          NOT NULL,
  "calories"      DOUBLE PRECISION NOT NULL DEFAULT 0,
  "protein"       DOUBLE PRECISION NOT NULL DEFAULT 0,
  "carbohydrates" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "fat"           DOUBLE PRECISION NOT NULL DEFAULT 0,
  "fiber"         DOUBLE PRECISION NOT NULL DEFAULT 0,
  "sugar"         DOUBLE PRECISION NOT NULL DEFAULT 0,
  "sodium"        DOUBLE PRECISION NOT NULL DEFAULT 0,
  "cholesterol"   DOUBLE PRECISION NOT NULL DEFAULT 0,
  "saturatedFat"  DOUBLE PRECISION NOT NULL DEFAULT 0,
  "water"         DOUBLE PRECISION NOT NULL DEFAULT 0,
  "calorieTarget" DOUBLE PRECISION,
  "proteinTarget" DOUBLE PRECISION,
  "carbTarget"    DOUBLE PRECISION,
  "fatTarget"     DOUBLE PRECISION,
  "overallScore"  DOUBLE PRECISION,
  "calorieScore"  DOUBLE PRECISION,
  "proteinScore"  DOUBLE PRECISION,
  "sugarScore"    DOUBLE PRECISION,
  "sodiumScore"   DOUBLE PRECISION,
  "fiberScore"    DOUBLE PRECISION,
  "diversityScore" DOUBLE PRECISION,
  "alerts"        JSONB,
  "summary"       TEXT,
  "mealCount"     INTEGER NOT NULL DEFAULT 0,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,
  CONSTRAINT "daily_analyses_userId_date_key" UNIQUE ("userId","date"),
  CONSTRAINT "daily_analyses_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "daily_analyses_userId_idx" ON "daily_analyses"("userId");
CREATE INDEX "daily_analyses_date_idx"   ON "daily_analyses"("date");

-- weekly_analyses
CREATE TABLE "weekly_analyses" (
  "id"              TEXT          NOT NULL PRIMARY KEY,
  "userId"          TEXT          NOT NULL,
  "weekStart"       DATE          NOT NULL,
  "weekEnd"         DATE          NOT NULL,
  "avgCalories"     DOUBLE PRECISION NOT NULL DEFAULT 0,
  "avgProtein"      DOUBLE PRECISION NOT NULL DEFAULT 0,
  "avgCarbs"        DOUBLE PRECISION NOT NULL DEFAULT 0,
  "avgFat"          DOUBLE PRECISION NOT NULL DEFAULT 0,
  "avgFiber"        DOUBLE PRECISION NOT NULL DEFAULT 0,
  "avgSugar"        DOUBLE PRECISION NOT NULL DEFAULT 0,
  "avgSodium"       DOUBLE PRECISION NOT NULL DEFAULT 0,
  "avgWater"        DOUBLE PRECISION NOT NULL DEFAULT 0,
  "daysLogged"      INTEGER NOT NULL DEFAULT 0,
  "streakDays"      INTEGER NOT NULL DEFAULT 0,
  "avgOverallScore" DOUBLE PRECISION,
  "bestDayScore"    DOUBLE PRECISION,
  "worstDayScore"   DOUBLE PRECISION,
  "trends"          JSONB,
  "deficiencies"    JSONB,
  "habits"          JSONB,
  "aiInsight"       TEXT,
  "aiInsightAt"     TIMESTAMP(3),
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,
  CONSTRAINT "weekly_analyses_userId_weekStart_key" UNIQUE ("userId","weekStart"),
  CONSTRAINT "weekly_analyses_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "weekly_analyses_userId_idx"    ON "weekly_analyses"("userId");
CREATE INDEX "weekly_analyses_weekStart_idx" ON "weekly_analyses"("weekStart");

-- user_health_conditions
CREATE TABLE "user_health_conditions" (
  "id"          TEXT              NOT NULL PRIMARY KEY,
  "userId"      TEXT              NOT NULL,
  "condition"   "HealthCondition" NOT NULL,
  "severity"    TEXT,
  "diagnosedAt" TIMESTAMP(3),
  "notes"       TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_health_conditions_userId_condition_key" UNIQUE ("userId","condition"),
  CONSTRAINT "user_health_conditions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "user_health_conditions_userId_idx" ON "user_health_conditions"("userId");
