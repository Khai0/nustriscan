import { mealRepository } from '@repositories/meal.repository'
import { foodItemRepository } from '@repositories/food-item.repository'
import { waterTrackingRepository } from '@repositories/water-tracking.repository'
import { healthProfileRepository } from '@repositories/health-profile.repository'
import { NotFoundError, BadRequestError } from '@utils/errors'
import { paginate } from '@utils/pagination'
import type { CreateMealDto, MealQueryDto, DailySummaryDto } from '@dto/meal/meal.dto'
import type { Meal } from '@prisma/client'

export const mealService = {
  async create(userId: string, dto: CreateMealDto): Promise<ReturnType<typeof mealRepository.create>> {
    // Validate + fetch all food items upfront
    const foodIds = dto.items.map(i => i.foodItemId)
    const foodItems = await foodItemRepository.findManyByIds(foodIds)

    if (foodItems.length !== foodIds.length) {
      const foundIds = foodItems.map(f => f.id)
      const missing = foodIds.filter(id => !foundIds.includes(id))
      throw new BadRequestError(`Không tìm thấy thực phẩm: ${missing.join(', ')}`)
    }

    const foodMap = new Map(foodItems.map(f => [f.id, f]))

    // Build meal items with nutrition snapshot
    const mealItemsData = dto.items.map(item => {
      const food = foodMap.get(item.foodItemId)!
      const ratio = item.quantity / food.servingSize
      return {
        foodItemId: item.foodItemId,
        quantity: item.quantity,
        unit: item.unit,
        calories: Math.round(food.calories * ratio * 10) / 10,
        protein: Math.round(food.protein * ratio * 10) / 10,
        carbohydrates: Math.round(food.carbohydrates * ratio * 10) / 10,
        fat: Math.round(food.fat * ratio * 10) / 10,
        fiber: Math.round(food.fiber * ratio * 10) / 10,
      }
    })

    // Calculate totals
    const totals = mealItemsData.reduce(
      (acc, item) => ({
        totalCalories: acc.totalCalories + item.calories,
        totalProtein: acc.totalProtein + item.protein,
        totalCarbohydrates: acc.totalCarbohydrates + item.carbohydrates,
        totalFat: acc.totalFat + item.fat,
        totalFiber: acc.totalFiber + item.fiber,
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbohydrates: 0, totalFat: 0, totalFiber: 0 }
    )

    const mealDate = new Date(dto.mealDate)

    return mealRepository.create({
      user: { connect: { id: userId } },
      mealType: dto.mealType as any,
      mealDate,
      mealTime: dto.mealTime ? new Date(dto.mealTime) : null,
      notes: dto.notes ?? null,
      ...totals,
      mealItems: { create: mealItemsData },
    })
  },

  async getDailySummary(userId: string, dateStr: string): Promise<DailySummaryDto> {
    const date = new Date(dateStr)
    const [meals, waterTotal, profile] = await Promise.all([
      mealRepository.findByUserAndDate(userId, date),
      waterTrackingRepository.sumByDate(userId, date),
      healthProfileRepository.findByUserId(userId),
    ])

    const totals = meals.reduce(
      (acc, meal) => ({
        totalCalories: acc.totalCalories + meal.totalCalories,
        totalProtein: acc.totalProtein + meal.totalProtein,
        totalCarbohydrates: acc.totalCarbohydrates + meal.totalCarbohydrates,
        totalFat: acc.totalFat + meal.totalFat,
        totalFiber: acc.totalFiber + meal.totalFiber,
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbohydrates: 0, totalFat: 0, totalFiber: 0 }
    )

    return {
      date: dateStr,
      ...totals,
      totalWaterMl: waterTotal,
      calorieTarget: profile?.calorieTarget ?? null,
      proteinTarget: profile?.proteinTarget ?? null,
      carbTarget: profile?.carbTarget ?? null,
      fatTarget: profile?.fatTarget ?? null,
      meals: meals.map(meal => ({
        id: meal.id,
        userId: meal.userId,
        mealType: meal.mealType,
        mealDate: meal.mealDate.toISOString().split('T')[0],
        mealTime: meal.mealTime?.toISOString() ?? null,
        notes: meal.notes,
        totalCalories: meal.totalCalories,
        totalProtein: meal.totalProtein,
        totalCarbohydrates: meal.totalCarbohydrates,
        totalFat: meal.totalFat,
        totalFiber: meal.totalFiber,
        createdAt: meal.createdAt.toISOString(),
        updatedAt: meal.updatedAt.toISOString(),
        items: meal.mealItems.map(item => ({
          id: item.id,
          foodItemId: item.foodItemId,
          foodName: item.foodItem.name,
          quantity: item.quantity,
          unit: item.unit,
          calories: item.calories,
          protein: item.protein,
          carbohydrates: item.carbohydrates,
          fat: item.fat,
          fiber: item.fiber,
        })),
      })),
    }
  },

  async getMealById(userId: string, mealId: string) {
    const meal = await mealRepository.findById(mealId, userId)
    if (!meal) throw new NotFoundError('Không tìm thấy bữa ăn')
    return meal
  },

  async deleteMeal(userId: string, mealId: string): Promise<void> {
    const meal = await mealRepository.findById(mealId, userId)
    if (!meal) throw new NotFoundError('Không tìm thấy bữa ăn')
    await mealRepository.softDelete(mealId)
  },

  async getMealHistory(userId: string, query: MealQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : (() => {
      const d = new Date(); d.setDate(d.getDate() - 30); return d
    })()
    const endDate = query.endDate ? new Date(query.endDate) : new Date()

    const { meals, total } = await mealRepository.findByUserAndDateRange(
      userId, startDate, endDate, query.page, query.limit
    )
    return paginate(meals, query.page, query.limit, total)
  },
}
