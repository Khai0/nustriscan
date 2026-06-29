import { Router } from 'express'
import { analysisController } from '@controllers/analysis.controller'
import { authenticate } from '@middlewares/authenticate'
import { validate } from '@middlewares/validate'
import { DailyAnalysisQueryDto, WeeklyAnalysisQueryDto, HealthConditionDto } from '@dto/analysis/analysis.dto'

const router = Router()
router.use(authenticate)

// GET  /api/analysis/daily?date=YYYY-MM-DD
router.get('/daily',  validate(DailyAnalysisQueryDto, 'query'),  analysisController.getDailyAnalysis)

// GET  /api/analysis/weekly?weekStart=YYYY-MM-DD
router.get('/weekly', validate(WeeklyAnalysisQueryDto, 'query'), analysisController.getWeeklyAnalysis)

// GET  /api/analysis/conditions
router.get('/conditions', analysisController.getConditions)

// POST /api/analysis/conditions
router.post('/conditions', validate(HealthConditionDto), analysisController.upsertCondition)

// DELETE /api/analysis/conditions/:condition
router.delete('/conditions/:condition', analysisController.removeCondition)

export default router
