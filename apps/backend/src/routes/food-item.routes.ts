import { Router } from 'express'
import { foodItemController } from '@controllers/food-item.controller'
import { authenticate, optionalAuthenticate } from '@middlewares/authenticate'
import { validate } from '@middlewares/validate'
import { CreateFoodItemDto, FoodSearchQueryDto } from '@dto/food/food-item.dto'

const router = Router()

// GET /api/foods?q=pho&category=VIETNAMESE&page=1&limit=20
router.get('/', optionalAuthenticate, validate(FoodSearchQueryDto, 'query'), foodItemController.search)

// GET /api/foods/:id
router.get('/:id', optionalAuthenticate, foodItemController.getById)

// POST /api/foods  (authenticated users can suggest new foods)
router.post('/', authenticate, validate(CreateFoodItemDto), foodItemController.create)

export default router
