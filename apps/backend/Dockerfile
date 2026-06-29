# ============================================================
# NutriScan AI — Backend Dockerfile
# Multi-stage build: deps → build → production runtime
# ============================================================

# ── Stage 1: Dependencies ───────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies for the whole workspace (monorepo)
COPY package.json package-lock.json* ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
RUN npm ci --workspace=apps/backend --workspace=packages/shared-types --include-workspace-root

# ── Stage 2: Build ──────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json* ./
COPY packages/shared-types packages/shared-types
COPY apps/backend apps/backend

# Generate Prisma client + compile TypeScript
RUN npm run build --workspace=packages/shared-types
WORKDIR /app/apps/backend
RUN npx prisma generate
RUN npm run build

# ── Stage 3: Production runtime ────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl curl \
  && addgroup -g 1001 -S nodejs \
  && adduser -S nodejs -u 1001

ENV NODE_ENV=production

# Copy production node_modules + built artifacts
COPY --from=deps  /app/node_modules ./node_modules
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=build /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=build /app/packages/shared-types/src ./packages/shared-types/src
COPY --from=build /app/packages/shared-types/package.json ./packages/shared-types/package.json

# Generate Prisma client in runtime image (matches Alpine's OpenSSL)
WORKDIR /app/apps/backend
RUN npx prisma generate

USER nodejs

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

CMD ["node", "dist/server.js"]
