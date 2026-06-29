import { z } from 'zod'

// ─── Request DTOs ──────────────────────────────────────────────────────────────
export const DailyAnalysisQueryDto = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date phải là YYYY-MM-DD').optional(),
})
export type DailyAnalysisQueryDto = z.infer<typeof DailyAnalysisQueryDto>

export const WeeklyAnalysisQueryDto = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})
export type WeeklyAnalysisQueryDto = z.infer<typeof WeeklyAnalysisQueryDto>

export const HealthConditionDto = z.object({
  condition: z.enum([
    'DIABETES', 'HYPERTENSION', 'OBESITY',
    'HIGH_CHOLESTEROL', 'CELIAC', 'LACTOSE_INTOLERANT', 'NONE',
  ]),
  severity: z.enum(['mild', 'moderate', 'severe']).optional(),
})
export type HealthConditionDto = z.infer<typeof HealthConditionDto>

// ─── Response shapes ───────────────────────────────────────────────────────────
export const ScoreBreakdownDto = z.object({
  overall:   z.number(),
  calorie:   z.number(),
  protein:   z.number(),
  sugar:     z.number(),
  sodium:    z.number(),
  fiber:     z.number(),
  diversity: z.number(),
})

export const HealthAlertDto = z.object({
  id:             z.string(),
  nutrient:       z.string(),
  severity:       z.enum(['INFO', 'WARNING', 'DANGER']),
  title:          z.string(),
  message:        z.string(),
  recommendation: z.string(),
})

// Vietnamese condition labels for UI
export const CONDITION_LABELS: Record<string, { label: string; emoji: string; description: string }> = {
  DIABETES:          { label: 'Tiểu đường',      emoji: '🩸', description: 'Theo dõi đường huyết, hạn chế đường và tinh bột' },
  HYPERTENSION:      { label: 'Huyết áp cao',    emoji: '💓', description: 'Giảm muối, tăng kali, hạn chế chất béo bão hoà' },
  OBESITY:           { label: 'Béo phì',          emoji: '⚖️', description: 'Kiểm soát calo, tăng chất xơ, giảm chất béo' },
  HIGH_CHOLESTEROL:  { label: 'Mỡ máu cao',       emoji: '🫀', description: 'Hạn chế chất béo bão hoà và cholesterol' },
  CELIAC:            { label: 'Không dung nạp gluten', emoji: '🌾', description: 'Tránh lúa mì, lúa mạch, lúa mạch đen' },
  LACTOSE_INTOLERANT:{ label: 'Không dung nạp lactose', emoji: '🥛', description: 'Hạn chế sữa và sản phẩm từ sữa' },
  NONE:              { label: 'Bình thường',       emoji: '✅', description: 'Không có điều kiện sức khoẻ đặc biệt' },
}
