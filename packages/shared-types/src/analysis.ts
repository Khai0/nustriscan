// ─── Phase 6 — Health Analysis types ───────────────────────────────────────

export type HealthGrade = 'excellent' | 'good' | 'fair' | 'poor'

export type AlertSeverity = 'INFO' | 'WARNING' | 'DANGER'

export type HealthConditionType =
  | 'DIABETES' | 'HYPERTENSION' | 'OBESITY'
  | 'HIGH_CHOLESTEROL' | 'CELIAC' | 'LACTOSE_INTOLERANT' | 'NONE'

export interface ScoreBreakdown {
  overall: number; calorie: number; protein: number
  sugar: number; sodium: number; fiber: number; diversity: number
}

export interface HealthAlert {
  id: string; nutrient: string; severity: AlertSeverity
  title: string; message: string; recommendation: string
}

export interface ScoringResult {
  scores:  ScoreBreakdown
  alerts:  HealthAlert[]
  grade:   HealthGrade
  summary: string
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
