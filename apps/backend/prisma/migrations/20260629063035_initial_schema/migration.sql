-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'ATHLETE');

-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('WEIGHT_LOSS', 'MAINTENANCE', 'MUSCLE_GAIN');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- CreateEnum
CREATE TYPE "FoodCategory" AS ENUM ('VIETNAMESE', 'ASIAN', 'WESTERN', 'BEVERAGE', 'FRUIT', 'VEGETABLE', 'PROTEIN', 'GRAIN', 'DAIRY', 'SNACK', 'OTHER');

-- CreateEnum
CREATE TYPE "WeightUnit" AS ENUM ('KG', 'LB');

-- CreateEnum
CREATE TYPE "HeightUnit" AS ENUM ('CM', 'INCH');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'CHANGE_EMAIL');

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('UPLOADING', 'PROCESSING', 'MATCHING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "HealthCondition" AS ENUM ('DIABETES', 'HYPERTENSION', 'OBESITY', 'HIGH_CHOLESTEROL', 'CELIAC', 'LACTOSE_INTOLERANT', 'NONE');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'DANGER');

-- CreateEnum
CREATE TYPE "AchievementType" AS ENUM ('STREAK_7', 'STREAK_30', 'STREAK_100', 'PROTEIN_MASTER', 'HEALTHY_WEEK', 'FIBER_CHAMPION', 'HYDRATION_HERO', 'CALORIE_CONTROL', 'FIRST_SCAN', 'SCAN_10', 'SCAN_50', 'WEIGHT_GOAL', 'PERFECT_DAY');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIp" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "heightUnit" "HeightUnit" NOT NULL DEFAULT 'CM',
    "weight" DOUBLE PRECISION NOT NULL,
    "weightUnit" "WeightUnit" NOT NULL DEFAULT 'KG',
    "targetWeight" DOUBLE PRECISION,
    "activityLevel" "ActivityLevel" NOT NULL DEFAULT 'MODERATE',
    "goalType" "GoalType" NOT NULL DEFAULT 'MAINTENANCE',
    "bmr" DOUBLE PRECISION,
    "tdee" DOUBLE PRECISION,
    "calorieTarget" DOUBLE PRECISION,
    "proteinTarget" DOUBLE PRECISION,
    "carbTarget" DOUBLE PRECISION,
    "fatTarget" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "category" "FoodCategory" NOT NULL DEFAULT 'OTHER',
    "brand" TEXT,
    "description" TEXT,
    "servingSize" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "servingUnit" TEXT NOT NULL DEFAULT 'g',
    "calories" DOUBLE PRECISION NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbohydrates" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "fiber" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sugar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sodium" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cholesterol" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "saturatedFat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transFat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vitaminA" DOUBLE PRECISION,
    "vitaminC" DOUBLE PRECISION,
    "vitaminD" DOUBLE PRECISION,
    "calcium" DOUBLE PRECISION,
    "iron" DOUBLE PRECISION,
    "potassium" DOUBLE PRECISION,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mealType" "MealType" NOT NULL,
    "mealDate" DATE NOT NULL,
    "mealTime" TIMESTAMP(3),
    "notes" TEXT,
    "totalCalories" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalProtein" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCarbohydrates" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalFat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalFiber" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_items" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "foodItemId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'g',
    "calories" DOUBLE PRECISION NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbohydrates" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "fiber" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_analyses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "detectedFoods" JSONB,
    "rawAiResponse" JSONB,
    "suggestedMealItems" JSONB,
    "estimatedCalories" DOUBLE PRECISION,
    "estimatedProtein" DOUBLE PRECISION,
    "estimatedCarbohydrates" DOUBLE PRECISION,
    "estimatedFat" DOUBLE PRECISION,
    "confidence" DOUBLE PRECISION,
    "errorMessage" TEXT,
    "confirmedMealId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "water_tracking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "logDate" DATE NOT NULL,
    "logTime" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "water_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weight_tracking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "weightUnit" "WeightUnit" NOT NULL DEFAULT 'KG',
    "logDate" DATE NOT NULL,
    "notes" TEXT,
    "bodyFat" DOUBLE PRECISION,
    "muscleMass" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weight_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "foodItemId" TEXT NOT NULL,
    "mealType" "MealType" NOT NULL,
    "logDate" DATE NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'g',
    "foodName" TEXT NOT NULL,
    "calories" DOUBLE PRECISION NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbohydrates" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "fiber" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" "TokenType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_scans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imagePublicId" TEXT NOT NULL,
    "imageThumbnail" TEXT,
    "status" "ScanStatus" NOT NULL DEFAULT 'UPLOADING',
    "aiProvider" TEXT NOT NULL DEFAULT 'google_vision',
    "rawLabels" JSONB,
    "rawResponse" JSONB,
    "matchedFoods" JSONB,
    "topFoodItemId" TEXT,
    "topFoodName" TEXT,
    "topConfidence" DOUBLE PRECISION,
    "confirmedMealId" TEXT,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "processingMs" INTEGER,
    "matchingMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_aliases" (
    "id" TEXT NOT NULL,
    "foodItemId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'vi',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "food_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_analyses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "calories" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "protein" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carbohydrates" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fiber" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sugar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sodium" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cholesterol" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "saturatedFat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "water" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "calorieTarget" DOUBLE PRECISION,
    "proteinTarget" DOUBLE PRECISION,
    "carbTarget" DOUBLE PRECISION,
    "fatTarget" DOUBLE PRECISION,
    "overallScore" DOUBLE PRECISION,
    "calorieScore" DOUBLE PRECISION,
    "proteinScore" DOUBLE PRECISION,
    "sugarScore" DOUBLE PRECISION,
    "sodiumScore" DOUBLE PRECISION,
    "fiberScore" DOUBLE PRECISION,
    "diversityScore" DOUBLE PRECISION,
    "alerts" JSONB,
    "summary" TEXT,
    "mealCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_analyses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "weekEnd" DATE NOT NULL,
    "avgCalories" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgProtein" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgCarbs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgFat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgFiber" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgSugar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgSodium" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgWater" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "daysLogged" INTEGER NOT NULL DEFAULT 0,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "avgOverallScore" DOUBLE PRECISION,
    "bestDayScore" DOUBLE PRECISION,
    "worstDayScore" DOUBLE PRECISION,
    "trends" JSONB,
    "deficiencies" JSONB,
    "habits" JSONB,
    "aiInsight" TEXT,
    "aiInsightAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_health_conditions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "condition" "HealthCondition" NOT NULL,
    "severity" TEXT,
    "diagnosedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_health_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievement" "AchievementType" NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metadata" JSONB,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_challenges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "challengeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "rewardXp" INTEGER NOT NULL DEFAULT 100,

    CONSTRAINT "weekly_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "totalMealsLogged" INTEGER NOT NULL DEFAULT 0,
    "totalScans" INTEGER NOT NULL DEFAULT 0,
    "avgDailyScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastLoggedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE INDEX "users_lockedUntil_idx" ON "users"("lockedUntil");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "health_profiles_userId_key" ON "health_profiles"("userId");

-- CreateIndex
CREATE INDEX "health_profiles_userId_idx" ON "health_profiles"("userId");

-- CreateIndex
CREATE INDEX "food_items_name_idx" ON "food_items"("name");

-- CreateIndex
CREATE INDEX "food_items_category_idx" ON "food_items"("category");

-- CreateIndex
CREATE INDEX "food_items_isVerified_idx" ON "food_items"("isVerified");

-- CreateIndex
CREATE INDEX "food_items_isPublic_idx" ON "food_items"("isPublic");

-- CreateIndex
CREATE INDEX "meals_userId_idx" ON "meals"("userId");

-- CreateIndex
CREATE INDEX "meals_mealDate_idx" ON "meals"("mealDate");

-- CreateIndex
CREATE INDEX "meals_userId_mealDate_idx" ON "meals"("userId", "mealDate");

-- CreateIndex
CREATE INDEX "meals_deletedAt_idx" ON "meals"("deletedAt");

-- CreateIndex
CREATE INDEX "meal_items_mealId_idx" ON "meal_items"("mealId");

-- CreateIndex
CREATE INDEX "meal_items_foodItemId_idx" ON "meal_items"("foodItemId");

-- CreateIndex
CREATE INDEX "nutrition_analyses_userId_idx" ON "nutrition_analyses"("userId");

-- CreateIndex
CREATE INDEX "nutrition_analyses_status_idx" ON "nutrition_analyses"("status");

-- CreateIndex
CREATE INDEX "nutrition_analyses_createdAt_idx" ON "nutrition_analyses"("createdAt");

-- CreateIndex
CREATE INDEX "water_tracking_userId_idx" ON "water_tracking"("userId");

-- CreateIndex
CREATE INDEX "water_tracking_logDate_idx" ON "water_tracking"("logDate");

-- CreateIndex
CREATE INDEX "water_tracking_userId_logDate_idx" ON "water_tracking"("userId", "logDate");

-- CreateIndex
CREATE INDEX "weight_tracking_userId_idx" ON "weight_tracking"("userId");

-- CreateIndex
CREATE INDEX "weight_tracking_logDate_idx" ON "weight_tracking"("logDate");

-- CreateIndex
CREATE UNIQUE INDEX "weight_tracking_userId_logDate_key" ON "weight_tracking"("userId", "logDate");

-- CreateIndex
CREATE INDEX "meal_history_userId_idx" ON "meal_history"("userId");

-- CreateIndex
CREATE INDEX "meal_history_logDate_idx" ON "meal_history"("logDate");

-- CreateIndex
CREATE INDEX "meal_history_userId_logDate_idx" ON "meal_history"("userId", "logDate");

-- CreateIndex
CREATE INDEX "meal_history_foodItemId_idx" ON "meal_history"("foodItemId");

-- CreateIndex
CREATE UNIQUE INDEX "auth_tokens_token_key" ON "auth_tokens"("token");

-- CreateIndex
CREATE INDEX "auth_tokens_userId_idx" ON "auth_tokens"("userId");

-- CreateIndex
CREATE INDEX "auth_tokens_token_idx" ON "auth_tokens"("token");

-- CreateIndex
CREATE INDEX "auth_tokens_type_idx" ON "auth_tokens"("type");

-- CreateIndex
CREATE INDEX "auth_tokens_expiresAt_idx" ON "auth_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "food_scans_userId_status_idx" ON "food_scans"("userId", "status");

-- CreateIndex
CREATE INDEX "food_scans_userId_idx" ON "food_scans"("userId");

-- CreateIndex
CREATE INDEX "food_scans_status_idx" ON "food_scans"("status");

-- CreateIndex
CREATE INDEX "food_scans_createdAt_idx" ON "food_scans"("createdAt");

-- CreateIndex
CREATE INDEX "food_aliases_alias_idx" ON "food_aliases"("alias");

-- CreateIndex
CREATE INDEX "food_aliases_foodItemId_idx" ON "food_aliases"("foodItemId");

-- CreateIndex
CREATE UNIQUE INDEX "food_aliases_foodItemId_alias_key" ON "food_aliases"("foodItemId", "alias");

-- CreateIndex
CREATE UNIQUE INDEX "daily_analyses_date_key" ON "daily_analyses"("date");

-- CreateIndex
CREATE INDEX "daily_analyses_userId_idx" ON "daily_analyses"("userId");

-- CreateIndex
CREATE INDEX "daily_analyses_date_idx" ON "daily_analyses"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_analyses_userId_date_key" ON "daily_analyses"("userId", "date");

-- CreateIndex
CREATE INDEX "weekly_analyses_userId_idx" ON "weekly_analyses"("userId");

-- CreateIndex
CREATE INDEX "weekly_analyses_weekStart_idx" ON "weekly_analyses"("weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_analyses_userId_weekStart_key" ON "weekly_analyses"("userId", "weekStart");

-- CreateIndex
CREATE INDEX "user_health_conditions_userId_idx" ON "user_health_conditions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_health_conditions_userId_condition_key" ON "user_health_conditions"("userId", "condition");

-- CreateIndex
CREATE INDEX "user_achievements_userId_idx" ON "user_achievements"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievement_key" ON "user_achievements"("userId", "achievement");

-- CreateIndex
CREATE INDEX "weekly_challenges_userId_idx" ON "weekly_challenges"("userId");

-- CreateIndex
CREATE INDEX "weekly_challenges_weekStart_idx" ON "weekly_challenges"("weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_challenges_userId_weekStart_challengeId_key" ON "weekly_challenges"("userId", "weekStart", "challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "user_stats_userId_key" ON "user_stats"("userId");

-- CreateIndex
CREATE INDEX "user_stats_userId_idx" ON "user_stats"("userId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_profiles" ADD CONSTRAINT "health_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_items" ADD CONSTRAINT "meal_items_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_items" ADD CONSTRAINT "meal_items_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "food_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_analyses" ADD CONSTRAINT "nutrition_analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "water_tracking" ADD CONSTRAINT "water_tracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_tracking" ADD CONSTRAINT "weight_tracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_history" ADD CONSTRAINT "meal_history_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "food_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_scans" ADD CONSTRAINT "food_scans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_scans" ADD CONSTRAINT "food_scans_topFoodItemId_fkey" FOREIGN KEY ("topFoodItemId") REFERENCES "food_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_aliases" ADD CONSTRAINT "food_aliases_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "food_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_analyses" ADD CONSTRAINT "daily_analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_analyses" ADD CONSTRAINT "weekly_analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_health_conditions" ADD CONSTRAINT "user_health_conditions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_challenges" ADD CONSTRAINT "weekly_challenges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
