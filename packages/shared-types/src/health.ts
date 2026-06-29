// ─── Health Profile ────────────────────────────────────────────────────────
export type Gender         = 'MALE' | 'FEMALE' | 'OTHER'
export type ActivityLevel  = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'ATHLETE'
export type GoalType       = 'WEIGHT_LOSS' | 'MAINTENANCE' | 'MUSCLE_GAIN'
export type WeightUnit     = 'KG' | 'LB'
export type HeightUnit     = 'CM' | 'INCH'

export interface HealthProfile {
  id: string
  userId: string
  gender: Gender
  birthDate: string
  height: number
  heightUnit: HeightUnit
  weight: number
  weightUnit: WeightUnit
  targetWeight: number | null
  activityLevel: ActivityLevel
  goalType: GoalType
  bmr: number | null
  tdee: number | null
  calorieTarget: number | null
  proteinTarget: number | null
  carbTarget: number | null
  fatTarget: number | null
  createdAt: string
  updatedAt: string
}

export interface HealthMetrics {
  bmr: number
  tdee: number
  calorieTarget: number
  macros: {
    proteinG: number
    carbG: number
    fatG: number
  }
  bmi?: number
  bmiCategory?: string
}
