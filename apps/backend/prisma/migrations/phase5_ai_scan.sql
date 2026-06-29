-- ============================================================
-- NutriScan AI — Phase 5 Schema Changes
-- Run via: npm run db:migrate
-- ============================================================

-- New enums
CREATE TYPE "ScanStatus" AS ENUM ('UPLOADING','PROCESSING','MATCHING','COMPLETED','FAILED');

-- food_scans table
CREATE TABLE "food_scans" (
  "id"              TEXT          NOT NULL PRIMARY KEY,
  "userId"          TEXT          NOT NULL,
  "imageUrl"        TEXT          NOT NULL,
  "imagePublicId"   TEXT          NOT NULL,
  "imageThumbnail"  TEXT,
  "status"          "ScanStatus"  NOT NULL DEFAULT 'UPLOADING',
  "aiProvider"      TEXT          NOT NULL DEFAULT 'google_vision',
  "rawLabels"       JSONB,
  "rawResponse"     JSONB,
  "matchedFoods"    JSONB,
  "topFoodItemId"   TEXT,
  "topFoodName"     TEXT,
  "topConfidence"   DOUBLE PRECISION,
  "confirmedMealId" TEXT,
  "errorMessage"    TEXT,
  "retryCount"      INTEGER       NOT NULL DEFAULT 0,
  "processingMs"    INTEGER,
  "matchingMs"      INTEGER,
  "createdAt"       TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3)  NOT NULL,
  CONSTRAINT "food_scans_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "food_scans_topFoodItemId_fkey"
    FOREIGN KEY ("topFoodItemId") REFERENCES "food_items"("id")
);
CREATE INDEX "food_scans_userId_idx"    ON "food_scans"("userId");
CREATE INDEX "food_scans_status_idx"    ON "food_scans"("status");
CREATE INDEX "food_scans_createdAt_idx" ON "food_scans"("createdAt");

-- food_aliases table
CREATE TABLE "food_aliases" (
  "id"         TEXT         NOT NULL PRIMARY KEY,
  "foodItemId" TEXT         NOT NULL,
  "alias"      TEXT         NOT NULL,
  "language"   TEXT         NOT NULL DEFAULT 'vi',
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "food_aliases_foodItemId_alias_key" UNIQUE ("foodItemId", "alias"),
  CONSTRAINT "food_aliases_foodItemId_fkey"
    FOREIGN KEY ("foodItemId") REFERENCES "food_items"("id") ON DELETE CASCADE
);
CREATE INDEX "food_aliases_alias_idx"      ON "food_aliases"("alias");
CREATE INDEX "food_aliases_foodItemId_idx" ON "food_aliases"("foodItemId");
