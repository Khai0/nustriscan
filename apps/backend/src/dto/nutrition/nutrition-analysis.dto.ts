import { z } from 'zod'

export const AnalysisStatusSchema = z.enum([
  'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED',
])

export const DetectedFoodSchema = z.object({
  name: z.string(),
  nameVi: z.string().optional(),
  confidence: z.number().min(0).max(1),
  foodItemId: z.string().optional(),
})
export type DetectedFood = z.infer<typeof DetectedFoodSchema>

export const SuggestedMealItemSchema = z.object({
  foodItemId: z.string(),
  foodName: z.string(),
  quantity: z.number(),
  unit: z.string(),
  confidence: z.number(),
})
export type SuggestedMealItem = z.infer<typeof SuggestedMealItemSchema>

// ─── Response DTO ─────────────────────────────────────────────────────────────

export const NutritionAnalysisResponseDto = z.object({
  id: z.string(),
  userId: z.string(),
  imagePath: z.string(),
  status: AnalysisStatusSchema,
  detectedFoods: z.array(DetectedFoodSchema).nullable(),
  suggestedMealItems: z.array(SuggestedMealItemSchema).nullable(),
  estimatedCalories: z.number().nullable(),
  estimatedProtein: z.number().nullable(),
  estimatedCarbohydrates: z.number().nullable(),
  estimatedFat: z.number().nullable(),
  confidence: z.number().nullable(),
  errorMessage: z.string().nullable(),
  confirmedMealId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type NutritionAnalysisResponseDto = z.infer<typeof NutritionAnalysisResponseDto>

// ─── Confirm analysis → tạo Meal ─────────────────────────────────────────────
export const ConfirmAnalysisDto = z.object({
  analysisId: z.string().min(1),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
  mealDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  // User có thể điều chỉnh items trước khi confirm
  items: z.array(
    z.object({
      foodItemId: z.string(),
      quantity: z.number().positive(),
      unit: z.string().default('g'),
    })
  ).min(1),
})
export type ConfirmAnalysisDto = z.infer<typeof ConfirmAnalysisDto>
