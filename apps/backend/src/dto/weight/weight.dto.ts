import { z } from 'zod'

export const WeightUnitSchema = z.enum(['KG', 'LB'])

export const CreateWeightTrackingDto = z.object({
  weight: z.number().positive('Cân nặng phải > 0').max(500),
  weightUnit: WeightUnitSchema.default('KG'),
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'logDate phải là YYYY-MM-DD'),
  notes: z.string().max(200).optional(),
  bodyFat: z.number().min(1).max(70).optional(),
  muscleMass: z.number().positive().optional(),
})
export type CreateWeightTrackingDto = z.infer<typeof CreateWeightTrackingDto>

export const WeightQueryDto = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.coerce.number().int().positive().max(365).default(30),
})
export type WeightQueryDto = z.infer<typeof WeightQueryDto>

export const WeightTrackingResponseDto = z.object({
  id: z.string(),
  weight: z.number(),
  weightUnit: WeightUnitSchema,
  logDate: z.string(),
  notes: z.string().nullable(),
  bodyFat: z.number().nullable(),
  muscleMass: z.number().nullable(),
  bmi: z.number().nullable(),
  createdAt: z.string(),
})
export type WeightTrackingResponseDto = z.infer<typeof WeightTrackingResponseDto>

export const WeightProgressDto = z.object({
  currentWeight: z.number(),
  targetWeight: z.number().nullable(),
  startWeight: z.number().nullable(),
  totalChange: z.number().nullable(),
  progressPercent: z.number().nullable(),
  history: z.array(WeightTrackingResponseDto),
})
export type WeightProgressDto = z.infer<typeof WeightProgressDto>
