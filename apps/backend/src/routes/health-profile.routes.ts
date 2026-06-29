import { Router } from 'express'
import { healthProfileController } from '@controllers/health-profile.controller'
import { authenticate } from '@middlewares/authenticate'
import { validate } from '@middlewares/validate'
import { CreateHealthProfileDto, UpdateHealthProfileDto } from '@dto/user/health-profile.dto'

const router = Router()
router.use(authenticate)

// GET  /api/health-profile
router.get('/', healthProfileController.get)

// POST /api/health-profile  (create or replace)
router.post('/', validate(CreateHealthProfileDto), healthProfileController.upsert)

// PATCH /api/health-profile
router.patch('/', validate(UpdateHealthProfileDto), healthProfileController.update)

export default router
