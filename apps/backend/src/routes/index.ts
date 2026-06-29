import { Router } from 'express'
import authRoutes        from './auth.routes'
import scanRoutes        from './scan.routes'
import healthProfileRoutes from './health-profile.routes'
import foodItemRoutes    from './food-item.routes'
import mealRoutes        from './meal.routes'
import analysisRoutes    from './analysis.routes'
import analyticsRoutes   from './analytics.routes'
import { waterRouter, weightRouter } from './tracking.routes'
import { prisma } from '@config/database'
import { getRedisClient } from '@config/redis'
import { env } from '@config/env'

const router = Router()

// ── Liveness probe — fast, no dependencies ──────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'NutriScan AI API đang chạy',
    timestamp: new Date().toISOString(),
    version: env.APP_VERSION,
    aiProvider: env.AI_PROVIDER,
  })
})

// ── Readiness probe — checks DB + Redis ─────────────────────────────────────
router.get('/health/ready', async (_req, res) => {
  const checks: Record<string, 'ok' | 'error' | 'skipped'> = {
    database: 'skipped',
    redis:    'skipped',
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = 'ok'
  } catch {
    checks.database = 'error'
  }

  const redis = getRedisClient()
  if (redis) {
    try {
      await redis.ping()
      checks.redis = 'ok'
    } catch {
      checks.redis = 'error'
    }
  }

  const healthy = checks.database === 'ok' && checks.redis !== 'error'
  res.status(healthy ? 200 : 503).json({
    success: healthy,
    checks,
    timestamp: new Date().toISOString(),
  })
})

router.use('/auth',            authRoutes)
router.use('/health-profile',  healthProfileRoutes)
router.use('/foods',           foodItemRoutes)
router.use('/meals',           mealRoutes)
router.use('/water',           waterRouter)
router.use('/weight',          weightRouter)
router.use('/scans',           scanRoutes)
router.use('/analysis',        analysisRoutes)
router.use('/analytics',       analyticsRoutes)

export default router
