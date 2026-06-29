import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8000),
  API_PREFIX: z.string().default('/api'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // JWT
  JWT_ACCESS_SECRET:      z.string().min(32),
  JWT_REFRESH_SECRET:     z.string().min(32),
  JWT_ACCESS_EXPIRES_IN:  z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Cookie
  COOKIE_SECRET:   z.string().min(32).default('cookie_secret_change_me_in_production_32c'),
  COOKIE_DOMAIN:   z.string().default('localhost'),
  COOKIE_SECURE:   z.coerce.boolean().default(false),  // true in production (HTTPS)
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),

  // CSRF
  CSRF_SECRET: z.string().min(32).default('csrf_secret_change_me_in_production_32ch'),

  // CORS
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),

  // Uploads
  UPLOAD_DIR:         z.string().default('uploads'),
  MAX_FILE_SIZE_MB:   z.coerce.number().default(10),
  ALLOWED_MIME_TYPES: z.string().default('image/jpeg,image/png,image/webp'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS:  z.coerce.number().default(900_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  AUTH_RATE_LIMIT_MAX:   z.coerce.number().default(10),

  // Account lockout
  MAX_FAILED_LOGINS:   z.coerce.number().default(5),
  LOCKOUT_DURATION_MIN: z.coerce.number().default(15),

  // Email
  SMTP_HOST:     z.string().default('smtp.gmail.com'),
  SMTP_PORT:     z.coerce.number().default(587),
  SMTP_SECURE:   z.coerce.boolean().default(false),
  SMTP_USER:     z.string().default(''),
  SMTP_PASS:     z.string().default(''),
  EMAIL_FROM:    z.string().default('NutriScan AI <noreply@nutriscan.ai>'),

  // App URLs (for email links)
  FRONTEND_URL:             z.string().default('http://localhost:3000'),
  EMAIL_VERIFY_EXPIRES_MIN: z.coerce.number().default(60),     // 1 hour
  PASSWORD_RESET_EXPIRES_MIN: z.coerce.number().default(30),   // 30 minutes

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('debug'),
  LOG_DIR:   z.string().default('logs'),

  // AI
  OPENAI_API_KEY: z.string().optional(),
  AI_MODEL:       z.string().default('gpt-4-vision-preview'),
  // ── Phase 5: Cloudinary ─────────────────────────────────────────────────
  CLOUDINARY_CLOUD_NAME:   z.string().default(''),
  CLOUDINARY_API_KEY:      z.string().default(''),
  CLOUDINARY_API_SECRET:   z.string().default(''),
  CLOUDINARY_UPLOAD_PRESET: z.string().default('nutriscan_foods'),

  // ── Phase 5: Google Vision ──────────────────────────────────────────────
  GOOGLE_VISION_API_KEY: z.string().default(''),

  // ── Phase 5: AI Provider ────────────────────────────────────────────────
  AI_PROVIDER:               z.enum(['google_vision', 'yolov8', 'mock']).default('mock'),
  AI_CONFIDENCE_THRESHOLD:   z.coerce.number().min(0).max(1).default(0.6),
  AI_MAX_LABELS:             z.coerce.number().int().default(10),
  // ── Phase 8: Redis & Monitoring ─────────────────────────────────────────
  REDIS_URL:    z.string().optional(),
  SENTRY_DSN:   z.string().optional(),
  APP_VERSION:  z.string().default('1.0.0'),


})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data

export const isDev  = env.NODE_ENV === 'development'
export const isProd = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'

export const allowedOrigins  = env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
export const allowedMimeTypes = env.ALLOWED_MIME_TYPES.split(',').map(m => m.trim())
export const maxFileSizeBytes = env.MAX_FILE_SIZE_MB * 1024 * 1024
