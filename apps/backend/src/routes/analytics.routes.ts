import { Router } from 'express'
import { analyticsController } from '@controllers/analytics.controller'
import { authenticate } from '@middlewares/authenticate'
import { validate } from '@middlewares/validate'
import { PeriodQueryDto, DaysQueryDto } from '@dto/analytics/analytics.dto'

const router = Router()
router.use(authenticate)

// ── Core analytics ───────────────────────────────────────────────────────────
router.get('/period',         validate(PeriodQueryDto, 'query'), analyticsController.getPeriodSummary)
router.get('/trends',         validate(PeriodQueryDto, 'query'), analyticsController.getTrends)
router.get('/meal-frequency', validate(DaysQueryDto, 'query'),   analyticsController.getMealFrequency)
router.get('/weight-trend',   validate(DaysQueryDto, 'query'),   analyticsController.getWeightTrend)
router.get('/insights',       analyticsController.getInsights)
router.get('/streak',         analyticsController.getStreak)

// ── Gamification ─────────────────────────────────────────────────────────────
router.get('/stats',          analyticsController.getStats)
router.get('/achievements',   analyticsController.getAchievements)
router.get('/challenges',     analyticsController.getChallenges)

export default router
