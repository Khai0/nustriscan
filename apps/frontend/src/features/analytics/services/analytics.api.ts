import apiClient from '@lib/axios'

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

export interface WeightTrendEntry { date: string; weight: number; weightUnit: string; bmi: number | null }
export interface WeightTrendResult {
  entries: WeightTrendEntry[]
  targetWeight: number | null
  weightUnit: string
}

export interface SmartInsight {
  id: string; type: 'positive' | 'negative' | 'neutral' | 'tip'
  title: string; message: string; metric?: string; value?: number
}

export interface StreakResult { current: number; longest: number; lastLoggedAt: string | null }

export interface UserStats {
  id: string; userId: string; totalXp: number; level: number
  currentStreak: number; longestStreak: number
  totalMealsLogged: number; totalScans: number; avgDailyScore: number
  lastLoggedAt: string | null
}

export interface Achievement {
  id: string; type: string; title: string; description: string
  emoji: string; xp: number; rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked: boolean; unlockedAt: string | null; progress: number
}

export interface WeeklyChallenge {
  id: string; challengeId: string; title: string; description: string
  targetValue: number; currentValue: number; completed: boolean; rewardXp: number
}

export const analyticsApiService = {
  getPeriodSummary: async (type: PeriodType): Promise<PeriodSummary> => {
    const res = await apiClient.get<{ data: PeriodSummary }>('/analytics/period', { params: { type } })
    return res.data.data
  },

  getTrends: async (type: PeriodType): Promise<DayPoint[]> => {
    const res = await apiClient.get<{ data: DayPoint[] }>('/analytics/trends', { params: { type } })
    return res.data.data
  },

  getMealFrequency: async (days = 7): Promise<MealFrequencyPoint[]> => {
    const res = await apiClient.get<{ data: MealFrequencyPoint[] }>('/analytics/meal-frequency', { params: { days } })
    return res.data.data
  },

  getWeightTrend: async (days = 30): Promise<WeightTrendResult> => {
    const res = await apiClient.get<{ data: WeightTrendResult }>('/analytics/weight-trend', { params: { days } })
    return res.data.data
  },

  getInsights: async (): Promise<SmartInsight[]> => {
    const res = await apiClient.get<{ data: SmartInsight[] }>('/analytics/insights')
    return res.data.data
  },

  getStreak: async (): Promise<StreakResult> => {
    const res = await apiClient.get<{ data: StreakResult }>('/analytics/streak')
    return res.data.data
  },

  getStats: async (): Promise<UserStats> => {
    const res = await apiClient.get<{ data: UserStats }>('/analytics/stats')
    return res.data.data
  },

  getAchievements: async (): Promise<{ achievements: Achievement[]; newUnlocks: Achievement[] }> => {
    const res = await apiClient.get<{ data: { achievements: Achievement[]; newUnlocks: Achievement[] } }>('/analytics/achievements')
    return res.data.data
  },

  getChallenges: async (): Promise<WeeklyChallenge[]> => {
    const res = await apiClient.get<{ data: WeeklyChallenge[] }>('/analytics/challenges')
    return res.data.data
  },
}
