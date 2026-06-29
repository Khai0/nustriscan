import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

import { env, allowedOrigins, isDev } from '@config/env'
import { globalRateLimiter } from '@middlewares/rateLimiter'
import { sanitizeInput, headerGuard, requestId } from '@middlewares/security'
import * as Sentry from '@sentry/node'
import { initSentry } from '@config/sentry'
import { errorHandler, notFoundHandler } from '@middlewares/errorHandler'
import { httpLogStream } from '@utils/logger'
import apiRoutes from '@routes/index'

export function createApp() {
  const app = express()

  initSentry(app)

  // ── Trust proxy (behind Nginx / load balancer in production) ─────────────
  if (!isDev) app.set('trust proxy', 1)

  // ── Security headers via Helmet ───────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc:   ["'self'", "'unsafe-inline'"],
        scriptSrc:  ["'self'"],
        imgSrc:     ["'self'", 'data:', 'blob:'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: isDev ? false : { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }))

  // ── CORS ──────────────────────────────────────────────────────────────────
  app.use(cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) cb(null, true)
      else cb(new Error(`CORS blocked: ${origin}`))
    },
    credentials: true,   // Required for cookies
    methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    exposedHeaders: ['x-csrf-token'],
  }))

  // ── Cookie parser (required for httpOnly auth cookies) ───────────────────
  app.use(cookieParser(env.COOKIE_SECRET))

  // ── Compression ───────────────────────────────────────────────────────────
  app.use(compression())

  // ── Request logging ───────────────────────────────────────────────────────
  app.use(morgan(isDev ? 'dev' : 'combined', { stream: httpLogStream }))

  // ── Body parsers ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // ── Phase 8: security hardening ──────────────────────────────────────────
  app.use(requestId)
  app.use(headerGuard)
  app.use(sanitizeInput)

  // ── Static files ──────────────────────────────────────────────────────────
  app.use('/uploads', express.static(env.UPLOAD_DIR))

  // ── Global rate limiter ───────────────────────────────────────────────────
  app.use(globalRateLimiter)

  // ── API routes ────────────────────────────────────────────────────────────
  app.use(env.API_PREFIX, apiRoutes)

  // ── 404 + error handlers ──────────────────────────────────────────────────
  app.use(notFoundHandler)
  if (env.SENTRY_DSN) app.use(Sentry.Handlers.errorHandler())
  app.use(errorHandler)

  return app
}
