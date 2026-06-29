import { Router } from 'express'
import { mealController } from '@controllers/meal.controller'
import { authenticate } from '@middlewares/authenticate'
import { validate } from '@middlewares/validate'
import { CreateMealDto, MealQueryDto } from '@dto/meal/meal.dto'

const router = Router()
router.use(authenticate)

// GET  /api/meals/daily?date=2024-01-15
router.get('/daily', mealController.getDailySummary)

// GET  /api/meals/history
router.get('/history', validate(MealQueryDto, 'query'), mealController.getHistory)

// POST /api/meals
router.post('/', validate(CreateMealDto), mealController.create)

// GET  /api/meals/:id
router.get('/:id', mealController.getById)

// DELETE /api/meals/:id
router.delete('/:id', mealController.delete)

export default router
