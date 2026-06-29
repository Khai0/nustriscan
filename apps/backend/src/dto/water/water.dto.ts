import { z } from 'zod'

export const CreateWaterTrackingDto = z.object({
  amount: z.number().positive('Lượng nước phải > 0').max(5000, 'Tối đa 5000ml mỗi lần'),
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'logDate phải là YYYY-MM-DD'),
  logTime: z.string().datetime().optional(),
  notes: z.string().max(200).optional(),
})
export type CreateWaterTrackingDto = z.infer<typeof CreateWaterTrackingDto>

export const WaterQueryDto = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})
export type WaterQueryDto = z.infer<typeof WaterQueryDto>

export const WaterTrackingResponseDto = z.object({
  id: z.string(),
  amount: z.number(),
  logDate: z.string(),
  logTime: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
})
export type WaterTrackingResponseDto = z.infer<typeof WaterTrackingResponseDto>

export const DailyWaterSummaryDto = z.object({
  date: z.string(),
  totalMl: z.number(),
  targetMl: z.number().nullable(),
  percentageReached: z.number().nullable(),
  entries: z.array(WaterTrackingResponseDto),
})
export type DailyWaterSummaryDto = z.infer<typeof DailyWaterSummaryDto>
