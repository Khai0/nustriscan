import { Router } from 'express'
import { waterTrackingController } from '@controllers/water-tracking.controller'
import { weightTrackingController } from '@controllers/weight-tracking.controller'
import { authenticate } from '@middlewares/authenticate'
import { validate } from '@middlewares/validate'
import { CreateWaterTrackingDto, WaterQueryDto } from '@dto/water/water.dto'
import { CreateWeightTrackingDto, WeightQueryDto } from '@dto/weight/weight.dto'

// ─── Water Router ─────────────────────────────────────────────────────────────
export const waterRouter = Router()
waterRouter.use(authenticate)

// GET  /api/water?date=2024-01-15
waterRouter.get('/', validate(WaterQueryDto, 'query'), waterTrackingController.getDailySummary)

// POST /api/water
waterRouter.post('/', validate(CreateWaterTrackingDto), waterTrackingController.log)

// DELETE /api/water/:id
waterRouter.delete('/:id', waterTrackingController.delete)

// ─── Weight Router ────────────────────────────────────────────────────────────
export const weightRouter = Router()
weightRouter.use(authenticate)

// GET  /api/weight/progress
weightRouter.get('/progress', validate(WeightQueryDto, 'query'), weightTrackingController.getProgress)

// POST /api/weight
weightRouter.post('/', validate(CreateWeightTrackingDto), weightTrackingController.log)

// DELETE /api/weight/:id
weightRouter.delete('/:id', weightTrackingController.delete)
