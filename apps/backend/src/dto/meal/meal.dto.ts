import { z } from 'zod'

export const MealTypeSchema = z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'])

// ─── Meal Item (1 món trong bữa) ─────────────────────────────────────────────

export const CreateMealItemDto = z.object({
  foodItemId: z.string().min(1),
  quantity: z.number().positive('Số lượng phải > 0'),
  unit: z.string().default('g'),
})
export type CreateMealItemDto = z.infer<typeof CreateMealItemDto>

// ─── Meal ────────────────────────────────────────────────────────────────────

export const CreateMealDto = z.object({
  mealType: MealTypeSchema,
  mealDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'mealDate phải là YYYY-MM-DD'),
  mealTime: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
  items: z.array(CreateMealItemDto).min(1, 'Bữa ăn phải có ít nhất 1 món'),
})
export type CreateMealDto = z.infer<typeof CreateMealDto>

export const UpdateMealDto = z.object({
  mealType: MealTypeSchema.optional(),
  notes: z.string().max(500).optional(),
})
export type UpdateMealDto = z.infer<typeof UpdateMealDto>

export const MealQueryDto = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  mealType: MealTypeSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})
export type MealQueryDto = z.infer<typeof MealQueryDto>

// ─── Response DTOs ────────────────────────────────────────────────────────────

export const MealItemResponseDto = z.object({
  id: z.string(),
  foodItemId: z.string(),
  foodName: z.string(),
  quantity: z.number(),
  unit: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbohydrates: z.number(),
  fat: z.number(),
  fiber: z.number(),
})
export type MealItemResponseDto = z.infer<typeof MealItemResponseDto>

export const MealResponseDto = z.object({
  id: z.string(),
  userId: z.string(),
  mealType: MealTypeSchema,
  mealDate: z.string(),
  mealTime: z.string().nullable(),
  notes: z.string().nullable(),
  totalCalories: z.number(),
  totalProtein: z.number(),
  totalCarbohydrates: z.number(),
  totalFat: z.number(),
  totalFiber: z.number(),
  items: z.array(MealItemResponseDto),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type MealResponseDto = z.infer<typeof MealResponseDto>

export const DailySummaryDto = z.object({
  date: z.string(),
  totalCalories: z.number(),
  totalProtein: z.number(),
  totalCarbohydrates: z.number(),
  totalFat: z.number(),
  totalFiber: z.number(),
  totalWaterMl: z.number(),
  calorieTarget: z.number().nullable(),
  proteinTarget: z.number().nullable(),
  carbTarget: z.number().nullable(),
  fatTarget: z.number().nullable(),
  meals: z.array(MealResponseDto),
})
export type DailySummaryDto = z.infer<typeof DailySummaryDto>
