import { z } from 'zod'

// ─── Enums (mirror Prisma enums) ─────────────────────────────────────────────
export const GenderSchema = z.enum(['MALE', 'FEMALE', 'OTHER'])
export const ActivityLevelSchema = z.enum(['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'ATHLETE'])
export const GoalTypeSchema = z.enum(['WEIGHT_LOSS', 'MAINTENANCE', 'MUSCLE_GAIN'])
export const WeightUnitSchema = z.enum(['KG', 'LB'])
export const HeightUnitSchema = z.enum(['CM', 'INCH'])

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export const CreateHealthProfileDto = z.object({
  gender: GenderSchema,
  birthDate: z.string().datetime({ message: 'birthDate phải là ISO 8601' }),
  height: z.number().positive('Chiều cao phải > 0').max(300),
  heightUnit: HeightUnitSchema.default('CM'),
  weight: z.number().positive('Cân nặng phải > 0').max(500),
  weightUnit: WeightUnitSchema.default('KG'),
  targetWeight: z.number().positive().max(500).optional(),
  activityLevel: ActivityLevelSchema.default('MODERATE'),
  goalType: GoalTypeSchema.default('MAINTENANCE'),
})
export type CreateHealthProfileDto = z.infer<typeof CreateHealthProfileDto>

export const UpdateHealthProfileDto = CreateHealthProfileDto.partial()
export type UpdateHealthProfileDto = z.infer<typeof UpdateHealthProfileDto>

// ─── Response DTO ─────────────────────────────────────────────────────────────

export const HealthProfileResponseDto = z.object({
  id: z.string(),
  userId: z.string(),
  gender: GenderSchema,
  birthDate: z.string(),
  height: z.number(),
  heightUnit: HeightUnitSchema,
  weight: z.number(),
  weightUnit: WeightUnitSchema,
  targetWeight: z.number().nullable(),
  activityLevel: ActivityLevelSchema,
  goalType: GoalTypeSchema,
  // Calculated
  bmr: z.number().nullable(),
  tdee: z.number().nullable(),
  calorieTarget: z.number().nullable(),
  proteinTarget: z.number().nullable(),
  carbTarget: z.number().nullable(),
  fatTarget: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type HealthProfileResponseDto = z.infer<typeof HealthProfileResponseDto>
