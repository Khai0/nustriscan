-- ============================================================
-- NutriScan AI — Phase 3 Schema Changes
-- Run via: npm run db:migrate  (prisma migrate dev)
-- ============================================================

-- Add new enums
CREATE TYPE "UserRole"   AS ENUM ('USER', 'ADMIN');
CREATE TYPE "TokenType"  AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'CHANGE_EMAIL');

-- Extend users table
ALTER TABLE "users"
  ADD COLUMN "role"             "UserRole"    NOT NULL DEFAULT 'USER',
  ADD COLUMN "emailVerified"    BOOLEAN       NOT NULL DEFAULT false,
  ADD COLUMN "emailVerifiedAt"  TIMESTAMP(3),
  ADD COLUMN "failedLoginCount" INTEGER       NOT NULL DEFAULT 0,
  ADD COLUMN "lockedUntil"      TIMESTAMP(3),
  ADD COLUMN "lastLoginAt"      TIMESTAMP(3),
  ADD COLUMN "lastLoginIp"      TEXT;

CREATE INDEX "users_role_idx"        ON "users"("role");
CREATE INDEX "users_lockedUntil_idx" ON "users"("lockedUntil");

-- Auth tokens table (email verification, password reset)
CREATE TABLE "auth_tokens" (
  "id"        TEXT          NOT NULL PRIMARY KEY,
  "userId"    TEXT          NOT NULL,
  "token"     TEXT          NOT NULL UNIQUE,
  "type"      "TokenType"   NOT NULL,
  "expiresAt" TIMESTAMP(3)  NOT NULL,
  "usedAt"    TIMESTAMP(3),
  "createdAt" TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "auth_tokens_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX "auth_tokens_userId_idx"    ON "auth_tokens"("userId");
CREATE INDEX "auth_tokens_token_idx"     ON "auth_tokens"("token");
CREATE INDEX "auth_tokens_type_idx"      ON "auth_tokens"("type");
CREATE INDEX "auth_tokens_expiresAt_idx" ON "auth_tokens"("expiresAt");
