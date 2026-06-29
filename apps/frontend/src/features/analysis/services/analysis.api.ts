import apiClient from '@lib/axios'

export interface ScoreBreakdown {
  overall: number; calorie: number; protein: number
  sugar: number; sodium: number; fiber: number; diversity: number
}

export interface HealthAlert {
  id: string; nutrient: string
  severity: 'INFO' | 'WARNING' | 'DANGER'
  title: string; message: string; recommendation: string
}

export interface ScoringResult {
  scores:  ScoreBreakdown
  alerts:  HealthAlert[]
  grade:   'excellent' | 'good' | 'fair' | 'poor'
  summary: string
}

export interface DailyNutrition {
  calories: number; protein: number; carbohydrates: number
  fat: number; fiber: number; sugar: number; sodium: number
  cholesterol: number; saturatedFat: number; water: number
}

export interface DailyAnalysisResult {
  date:           string
  nutrition:      DailyNutrition
  targets:        { calorieTarget?: number; proteinTarget?: number; carbTarget?: number; fatTarget?: number }
  scoring:        ScoringResult
  recommendation: string
  mealCount:      number
  conditions:     Array<{ condition: string; severity?: string }>
}

export interface WeeklyTrend {
  nutrient: string; label: string
  direction: 'improving' | 'declining' | 'stable'
  change: number; message: string
}

export interface NutrientDeficiency {
  nutrient: string; label: string; avgValue: number; target: number
  deficitPct: number; daysDeficient: number
  severity: 'mild' | 'moderate' | 'severe'; recommendation: string
}

export interface DetectedHabit {
  id: string; type: 'positive' | 'negative' | 'neutral'
  title: string; description: string; frequency: string
}

export interface WeeklyInsight {
  trends: WeeklyTrend[]; deficiencies: NutrientDeficiency[]
  habits: DetectedHabit[]; avgScore: number
  daysLogged: number; streakDays: number
  bestDay: string | null; worstDay: string | null
}

export interface WeeklyAnalysisResult {
  weekStart: string; weekEnd: string
  days:      Array<{ date: string; calories: number; protein: number; fiber: number; sodium: number; sugar: number; water: number; mealCount: number; score?: number }>
  insight:   WeeklyInsight
  avgNutrition: { calories: number; protein: number; fiber: number; sodium: number; sugar: number }
  aiInsight: string
  targets:   { calories?: number; protein?: number }
}

export interface HealthCondition {
  id: string; userId: string; condition: string; severity?: string; createdAt: string
}

export const analysisApiService = {
  getDaily: async (date?: string): Promise<DailyAnalysisResult> => {
    const params = date ? { date } : {}
    const res = await apiClient.get<{ data: DailyAnalysisResult }>('/analysis/daily', { params })
    return res.data.data
  },

  getWeekly: async (weekStart?: string): Promise<WeeklyAnalysisResult> => {
    const params = weekStart ? { weekStart } : {}
    const res = await apiClient.get<{ data: WeeklyAnalysisResult }>('/analysis/weekly', { params })
    return res.data.data
  },

  getConditions: async (): Promise<HealthCondition[]> => {
    const res = await apiClient.get<{ data: HealthCondition[] }>('/analysis/conditions')
    return res.data.data
  },

  upsertCondition: async (condition: string, severity?: string): Promise<HealthCondition> => {
    const res = await apiClient.post<{ data: HealthCondition }>('/analysis/conditions', { condition, severity })
    return res.data.data
  },

  removeCondition: async (condition: string): Promise<void> => {
    await apiClient.delete(`/analysis/conditions/${condition}`)
  },
}
