-- ============================================================
-- NutriScan AI — Initial Migration (Phase 2)
-- Generated from: prisma/schema.prisma
-- Run via: npm run db:migrate  (uses prisma migrate dev)
-- ============================================================
-- NOTE: This file is for documentation only.
-- Prisma generates and runs migrations automatically.
-- Do NOT run this file manually.
-- ============================================================

-- Enums
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'ATHLETE');
CREATE TYPE "GoalType" AS ENUM ('WEIGHT_LOSS', 'MAINTENANCE', 'MUSCLE_GAIN');
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');
CREATE TYPE "FoodCategory" AS ENUM (
  'VIETNAMESE', 'ASIAN', 'WESTERN', 'BEVERAGE',
  'FRUIT', 'VEGETABLE', 'PROTEIN', 'GRAIN', 'DAIRY', 'SNACK', 'OTHER'
);
CREATE TYPE "WeightUnit" AS ENUM ('KG', 'LB');
CREATE TYPE "HeightUnit" AS ENUM ('CM', 'INCH');
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- Users
CREATE TABLE "users" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "email"     TEXT NOT NULL UNIQUE,
  "name"      TEXT NOT NULL,
  "password"  TEXT NOT NULL,
  "avatarUrl" TEXT,
  "isActive"  BOOLEAN NOT NULL DEFAULT true,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "users_email_idx"     ON "users"("email");
CREATE INDEX "users_isActive_idx"  ON "users"("isActive");
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- Refresh Tokens
CREATE TABLE "refresh_tokens" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "userId"    TEXT NOT NULL,
  "token"     TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "isRevoked" BOOLEAN NOT NULL DEFAULT false,
  "userAgent" TEXT,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "refresh_tokens_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "refresh_tokens_userId_idx"    ON "refresh_tokens"("userId");
CREATE INDEX "refresh_tokens_token_idx"     ON "refresh_tokens"("token");
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- Health Profiles
CREATE TABLE "health_profiles" (
  "id"            TEXT NOT NULL PRIMARY KEY,
  "userId"        TEXT NOT NULL UNIQUE,
  "gender"        "Gender" NOT NULL,
  "birthDate"     TIMESTAMP(3) NOT NULL,
  "height"        DOUBLE PRECISION NOT NULL,
  "heightUnit"    "HeightUnit" NOT NULL DEFAULT 'CM',
  "weight"        DOUBLE PRECISION NOT NULL,
  "weightUnit"    "WeightUnit" NOT NULL DEFAULT 'KG',
  "targetWeight"  DOUBLE PRECISION,
  "activityLevel" "ActivityLevel" NOT NULL DEFAULT 'MODERATE',
  "goalType"      "GoalType" NOT NULL DEFAULT 'MAINTENANCE',
  "bmr"           DOUBLE PRECISION,
  "tdee"          DOUBLE PRECISION,
  "calorieTarget" DOUBLE PRECISION,
  "proteinTarget" DOUBLE PRECISION,
  "carbTarget"    DOUBLE PRECISION,
  "fatTarget"     DOUBLE PRECISION,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,
  CONSTRAINT "health_profiles_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Food Items
CREATE TABLE "food_items" (
  "id"            TEXT NOT NULL PRIMARY KEY,
  "name"          TEXT NOT NULL,
  "nameEn"        TEXT,
  "category"      "FoodCategory" NOT NULL DEFAULT 'OTHER',
  "brand"         TEXT,
  "description"   TEXT,
  "servingSize"   DOUBLE PRECISION NOT NULL DEFAULT 100,
  "servingUnit"   TEXT NOT NULL DEFAULT 'g',
  "calories"      DOUBLE PRECISION NOT NULL,
  "protein"       DOUBLE PRECISION NOT NULL,
  "carbohydrates" DOUBLE PRECISION NOT NULL,
  "fat"           DOUBLE PRECISION NOT NULL,
  "fiber"         DOUBLE PRECISION NOT NULL DEFAULT 0,
  "sugar"         DOUBLE PRECISION NOT NULL DEFAULT 0,
  "sodium"        DOUBLE PRECISION NOT NULL DEFAULT 0,
  "cholesterol"   DOUBLE PRECISION NOT NULL DEFAULT 0,
  "saturatedFat"  DOUBLE PRECISION NOT NULL DEFAULT 0,
  "transFat"      DOUBLE PRECISION NOT NULL DEFAULT 0,
  "vitaminA"      DOUBLE PRECISION,
  "vitaminC"      DOUBLE PRECISION,
  "vitaminD"      DOUBLE PRECISION,
  "calcium"       DOUBLE PRECISION,
  "iron"          DOUBLE PRECISION,
  "potassium"     DOUBLE PRECISION,
  "isVerified"    BOOLEAN NOT NULL DEFAULT false,
  "isPublic"      BOOLEAN NOT NULL DEFAULT true,
  "createdBy"     TEXT,
  "imageUrl"      TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL
);
CREATE INDEX "food_items_name_idx"       ON "food_items"("name");
CREATE INDEX "food_items_category_idx"   ON "food_items"("category");
CREATE INDEX "food_items_isVerified_idx" ON "food_items"("isVerified");
CREATE INDEX "food_items_isPublic_idx"   ON "food_items"("isPublic");

-- Meals
CREATE TABLE "meals" (
  "id"                 TEXT NOT NULL PRIMARY KEY,
  "userId"             TEXT NOT NULL,
  "mealType"           "MealType" NOT NULL,
  "mealDate"           DATE NOT NULL,
  "mealTime"           TIMESTAMP(3),
  "notes"              TEXT,
  "totalCalories"      DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalProtein"       DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalCarbohydrates" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalFat"           DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalFiber"         DOUBLE PRECISION NOT NULL DEFAULT 0,
  "deletedAt"          TIMESTAMP(3),
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3) NOT NULL,
  CONSTRAINT "meals_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "meals_userId_idx"          ON "meals"("userId");
CREATE INDEX "meals_mealDate_idx"        ON "meals"("mealDate");
CREATE INDEX "meals_userId_mealDate_idx" ON "meals"("userId", "mealDate");
CREATE INDEX "meals_deletedAt_idx"       ON "meals"("deletedAt");

-- Meal Items
CREATE TABLE "meal_items" (
  "id"            TEXT NOT NULL PRIMARY KEY,
  "mealId"        TEXT NOT NULL,
  "foodItemId"    TEXT NOT NULL,
  "quantity"      DOUBLE PRECISION NOT NULL,
  "unit"          TEXT NOT NULL DEFAULT 'g',
  "calories"      DOUBLE PRECISION NOT NULL,
  "protein"       DOUBLE PRECISION NOT NULL,
  "carbohydrates" DOUBLE PRECISION NOT NULL,
  "fat"           DOUBLE PRECISION NOT NULL,
  "fiber"         DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,
  CONSTRAINT "meal_items_mealId_fkey"
    FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE,
  CONSTRAINT "meal_items_foodItemId_fkey"
    FOREIGN KEY ("foodItemId") REFERENCES "food_items"("id")
);
CREATE INDEX "meal_items_mealId_idx"     ON "meal_items"("mealId");
CREATE INDEX "meal_items_foodItemId_idx" ON "meal_items"("foodItemId");

-- Nutrition Analyses
CREATE TABLE "nutrition_analyses" (
  "id"                     TEXT NOT NULL PRIMARY KEY,
  "userId"                 TEXT NOT NULL,
  "imagePath"              TEXT NOT NULL,
  "status"                 "AnalysisStatus" NOT NULL DEFAULT 'PENDING',
  "detectedFoods"          JSONB,
  "rawAiResponse"          JSONB,
  "suggestedMealItems"     JSONB,
  "estimatedCalories"      DOUBLE PRECISION,
  "estimatedProtein"       DOUBLE PRECISION,
  "estimatedCarbohydrates" DOUBLE PRECISION,
  "estimatedFat"           DOUBLE PRECISION,
  "confidence"             DOUBLE PRECISION,
  "errorMessage"           TEXT,
  "confirmedMealId"        TEXT,
  "createdAt"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"              TIMESTAMP(3) NOT NULL,
  CONSTRAINT "nutrition_analyses_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "nutrition_analyses_userId_idx"    ON "nutrition_analyses"("userId");
CREATE INDEX "nutrition_analyses_status_idx"    ON "nutrition_analyses"("status");
CREATE INDEX "nutrition_analyses_createdAt_idx" ON "nutrition_analyses"("createdAt");

-- Water Tracking
CREATE TABLE "water_tracking" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "userId"    TEXT NOT NULL,
  "amount"    DOUBLE PRECISION NOT NULL,
  "logDate"   DATE NOT NULL,
  "logTime"   TIMESTAMP(3),
  "notes"     TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "water_tracking_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "water_tracking_userId_idx"          ON "water_tracking"("userId");
CREATE INDEX "water_tracking_logDate_idx"         ON "water_tracking"("logDate");
CREATE INDEX "water_tracking_userId_logDate_idx"  ON "water_tracking"("userId", "logDate");

-- Weight Tracking
CREATE TABLE "weight_tracking" (
  "id"         TEXT NOT NULL PRIMARY KEY,
  "userId"     TEXT NOT NULL,
  "weight"     DOUBLE PRECISION NOT NULL,
  "weightUnit" "WeightUnit" NOT NULL DEFAULT 'KG',
  "logDate"    DATE NOT NULL,
  "notes"      TEXT,
  "bodyFat"    DOUBLE PRECISION,
  "muscleMass" DOUBLE PRECISION,
  "bmi"        DOUBLE PRECISION,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL,
  CONSTRAINT "weight_tracking_userId_logDate_key" UNIQUE ("userId", "logDate"),
  CONSTRAINT "weight_tracking_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "weight_tracking_userId_idx"  ON "weight_tracking"("userId");
CREATE INDEX "weight_tracking_logDate_idx" ON "weight_tracking"("logDate");

-- Meal History (denormalized for analytics)
CREATE TABLE "meal_history" (
  "id"            TEXT NOT NULL PRIMARY KEY,
  "userId"        TEXT NOT NULL,
  "foodItemId"    TEXT NOT NULL,
  "mealType"      "MealType" NOT NULL,
  "logDate"       DATE NOT NULL,
  "quantity"      DOUBLE PRECISION NOT NULL,
  "unit"          TEXT NOT NULL DEFAULT 'g',
  "foodName"      TEXT NOT NULL,
  "calories"      DOUBLE PRECISION NOT NULL,
  "protein"       DOUBLE PRECISION NOT NULL,
  "carbohydrates" DOUBLE PRECISION NOT NULL,
  "fat"           DOUBLE PRECISION NOT NULL,
  "fiber"         DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "meal_history_foodItemId_fkey"
    FOREIGN KEY ("foodItemId") REFERENCES "food_items"("id")
);
CREATE INDEX "meal_history_userId_idx"          ON "meal_history"("userId");
CREATE INDEX "meal_history_logDate_idx"         ON "meal_history"("logDate");
CREATE INDEX "meal_history_userId_logDate_idx"  ON "meal_history"("userId", "logDate");
CREATE INDEX "meal_history_foodItemId_idx"      ON "meal_history"("foodItemId");
