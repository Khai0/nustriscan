// ─── Phase 7 — Analytics & Gamification types ─────────────────────────────

export type PeriodType = 'daily' | 'weekly' | 'monthly'

export interface DayPoint {
  date: string; calories: number; protein: number; carbs: number
  fat: number; fiber: number; sugar: number; sodium: number
  water: number; score: number | null; mealCount: number
}

export interface PeriodSummary {
  period: PeriodType; label: string
  avgCalories: number; avgProtein: number; avgCarbs: number; avgFat: number
  avgFiber: number; avgSugar: number; avgSodium: number; avgWater: number
  avgScore: number; daysLogged: number; totalMeals: number
  calorieTarget?: number; proteinTarget?: number
}

export interface MealFrequencyPoint {
  type: string; label: string; count: number; avgCalories: number
}

export interface SmartInsight {
  id: string; type: 'positive' | 'negative' | 'neutral' | 'tip'
  title: string; message: string; metric?: string; value?: number
}

export type AchievementType =
  | 'STREAK_7' | 'STREAK_30' | 'STREAK_100' | 'PROTEIN_MASTER' | 'HEALTHY_WEEK'
  | 'FIBER_CHAMPION' | 'HYDRATION_HERO' | 'CALORIE_CONTROL' | 'FIRST_SCAN'
  | 'SCAN_10' | 'SCAN_50' | 'WEIGHT_GOAL' | 'PERFECT_DAY'

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface Achievement {
  id: string; type: AchievementType; title: string; description: string
  emoji: string; xp: number; rarity: AchievementRarity
  unlocked: boolean; unlockedAt: string | null; progress: number
}

export interface WeeklyChallenge {
  id: string; challengeId: string; title: string; description: string
  targetValue: number; currentValue: number; completed: boolean; rewardXp: number
}

export interface UserStats {
  id: string; userId: string; totalXp: number; level: number
  currentStreak: number; longestStreak: number
  totalMealsLogged: number; totalScans: number; avgDailyScore: number
  lastLoggedAt: string | null
}

export interface StreakResult {
  current: number; longest: number; lastLoggedAt: string | null
}
