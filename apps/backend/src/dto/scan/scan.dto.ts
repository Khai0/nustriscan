import { z } from 'zod'

// ─── Request DTOs ──────────────────────────────────────────────────────────────

export const ConfirmScanDto = z.object({
  foodItemId:    z.string().min(1, 'foodItemId không được trống'),
  mealType:      z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
  mealDate:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'mealDate phải là YYYY-MM-DD'),
  servingPreset: z.enum(['small', 'medium', 'large']).optional(),
  customGrams:   z.number().positive().optional(),
  notes:         z.string().max(500).optional(),
}).refine(
  d => d.servingPreset || d.customGrams,
  { message: 'Phải có servingPreset hoặc customGrams', path: ['servingPreset'] }
)
export type ConfirmScanDto = z.infer<typeof ConfirmScanDto>

export const ScanQueryDto = z.object({
  page:  z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
})
export type ScanQueryDto = z.infer<typeof ScanQueryDto>

// ─── Response DTOs ─────────────────────────────────────────────────────────────

export const FoodMatchResultDto = z.object({
  foodItemId:    z.string(),
  foodName:      z.string(),
  nameEn:        z.string().nullable(),
  confidence:    z.number(),
  matchMethod:   z.enum(['exact', 'alias', 'fuzzy', 'keyword']),
  servingSize:   z.number(),
  servingUnit:   z.string(),
  calories:      z.number(),
  protein:       z.number(),
  carbohydrates: z.number(),
  fat:           z.number(),
  fiber:         z.number(),
})
export type FoodMatchResultDto = z.infer<typeof FoodMatchResultDto>

export const ScanResultDto = z.object({
  scanId:       z.string(),
  imageUrl:     z.string(),
  thumbnail:    z.string().nullable(),
  status:       z.enum(['UPLOADING', 'PROCESSING', 'MATCHING', 'COMPLETED', 'FAILED']),
  aiProvider:   z.string(),
  processingMs: z.number().nullable(),
  matchingMs:   z.number(),
  matchedFoods: z.array(FoodMatchResultDto),
  topMatch:     FoodMatchResultDto.nullable(),
  labels:       z.array(z.object({
    description: z.string(),
    score:       z.number(),
    topicality:  z.number(),
  })),
})
export type ScanResultDto = z.infer<typeof ScanResultDto>

// ─── Serving size helpers ──────────────────────────────────────────────────────

export const SERVING_LABELS = {
  small:  { label: 'Nhỏ',   desc: '60% khẩu phần tiêu chuẩn', multiplier: 0.6 },
  medium: { label: 'Vừa',   desc: 'Khẩu phần tiêu chuẩn',     multiplier: 1.0 },
  large:  { label: 'Lớn',   desc: '150% khẩu phần tiêu chuẩn', multiplier: 1.5 },
} as const
