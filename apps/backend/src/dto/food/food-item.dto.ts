import { z } from 'zod'

export const FoodCategorySchema = z.enum([
  'VIETNAMESE', 'ASIAN', 'WESTERN', 'BEVERAGE',
  'FRUIT', 'VEGETABLE', 'PROTEIN', 'GRAIN', 'DAIRY', 'SNACK', 'OTHER',
])

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export const CreateFoodItemDto = z.object({
  name: z.string().min(1).max(200).trim(),
  nameEn: z.string().max(200).optional(),
  category: FoodCategorySchema.default('OTHER'),
  brand: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  servingSize: z.number().positive().default(100),
  servingUnit: z.string().default('g'),
  // Nutrition per serving
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbohydrates: z.number().nonnegative(),
  fat: z.number().nonnegative(),
  fiber: z.number().nonnegative().default(0),
  sugar: z.number().nonnegative().default(0),
  sodium: z.number().nonnegative().default(0),
  cholesterol: z.number().nonnegative().default(0),
  saturatedFat: z.number().nonnegative().default(0),
  transFat: z.number().nonnegative().default(0),
  // Optional vitamins/minerals
  vitaminA: z.number().nonnegative().optional(),
  vitaminC: z.number().nonnegative().optional(),
  vitaminD: z.number().nonnegative().optional(),
  calcium: z.number().nonnegative().optional(),
  iron: z.number().nonnegative().optional(),
  potassium: z.number().nonnegative().optional(),
  imageUrl: z.string().url().optional(),
})
export type CreateFoodItemDto = z.infer<typeof CreateFoodItemDto>

export const UpdateFoodItemDto = CreateFoodItemDto.partial()
export type UpdateFoodItemDto = z.infer<typeof UpdateFoodItemDto>

export const FoodSearchQueryDto = z.object({
  q: z.string().min(1).max(100).optional(),
  category: FoodCategorySchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})
export type FoodSearchQueryDto = z.infer<typeof FoodSearchQueryDto>

// ─── Response DTO ─────────────────────────────────────────────────────────────

export const FoodItemResponseDto = z.object({
  id: z.string(),
  name: z.string(),
  nameEn: z.string().nullable(),
  category: FoodCategorySchema,
  brand: z.string().nullable(),
  description: z.string().nullable(),
  servingSize: z.number(),
  servingUnit: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbohydrates: z.number(),
  fat: z.number(),
  fiber: z.number(),
  sugar: z.number(),
  sodium: z.number(),
  cholesterol: z.number(),
  saturatedFat: z.number(),
  transFat: z.number(),
  vitaminA: z.number().nullable(),
  vitaminC: z.number().nullable(),
  vitaminD: z.number().nullable(),
  calcium: z.number().nullable(),
  iron: z.number().nullable(),
  potassium: z.number().nullable(),
  isVerified: z.boolean(),
  imageUrl: z.string().nullable(),
  createdAt: z.string(),
})
export type FoodItemResponseDto = z.infer<typeof FoodItemResponseDto>
