import { z } from 'zod'

// ─── Query DTOs ────────────────────────────────────────────────────────────────
export const PeriodQueryDto = z.object({
  type: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
})
export type PeriodQueryDto = z.infer<typeof PeriodQueryDto>

export const DaysQueryDto = z.object({
  days: z.coerce.number().int().min(1).max(90).default(7),
})
export type DaysQueryDto = z.infer<typeof DaysQueryDto>

// ─── Response shapes (for documentation) ───────────────────────────────────────
export const DayPointDto = z.object({
  date:      z.string(),
  calories:  z.number(),
  protein:   z.number(),
  carbs:     z.number(),
  fat:       z.number(),
  fiber:     z.number(),
  sugar:     z.number(),
  sodium:    z.number(),
  water:     z.number(),
  score:     z.number().nullable(),
  mealCount: z.number(),
})

export const SmartInsightDto = z.object({
  id:      z.string(),
  type:    z.enum(['positive', 'negative', 'neutral', 'tip']),
  title:   z.string(),
  message: z.string(),
  metric:  z.string().optional(),
  value:   z.number().optional(),
})

export const AchievementDto = z.object({
  id:          z.string(),
  type:        z.string(),
  title:       z.string(),
  description: z.string(),
  emoji:       z.string(),
  xp:          z.number(),
  rarity:      z.enum(['common', 'rare', 'epic', 'legendary']),
  unlocked:    z.boolean(),
  unlockedAt:  z.string().nullable(),
  progress:    z.number(),
})

export const ChallengeDto = z.object({
  id:           z.string(),
  challengeId:  z.string(),
  title:        z.string(),
  description:  z.string(),
  targetValue:  z.number(),
  currentValue: z.number(),
  completed:    z.boolean(),
  rewardXp:     z.number(),
})

// Vietnamese rarity labels
export const RARITY_LABELS: Record<string, { label: string; color: string }> = {
  common:    { label: 'Phổ biến',  color: 'text-muted-foreground' },
  rare:      { label: 'Hiếm',      color: 'text-info' },
  epic:      { label: 'Sử thi',    color: 'text-purple-500' },
  legendary: { label: 'Huyền thoại', color: 'text-warning' },
}
