// ============================================================
// Health Engine — Constants & Types
// ============================================================

export enum ActivityLevel {
  SEDENTARY = 'SEDENTARY',
  LIGHT = 'LIGHT',
  MODERATE = 'MODERATE',
  ACTIVE = 'ACTIVE',
  ATHLETE = 'ATHLETE',
}

export enum GoalType {
  WEIGHT_LOSS = 'WEIGHT_LOSS',
  MAINTENANCE = 'MAINTENANCE',
  MUSCLE_GAIN = 'MUSCLE_GAIN',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

// ─── PAL (Physical Activity Level) multipliers ─────────────────────────────
// Nguồn: WHO/FAO/UNU (2001), Harris-Benedict revised
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  [ActivityLevel.SEDENTARY]: 1.2,   // Ngồi nhiều, không tập
  [ActivityLevel.LIGHT]:     1.375, // Tập nhẹ 1–3 ngày/tuần
  [ActivityLevel.MODERATE]:  1.55,  // Tập vừa 3–5 ngày/tuần
  [ActivityLevel.ACTIVE]:    1.725, // Tập nặng 6–7 ngày/tuần
  [ActivityLevel.ATHLETE]:   1.9,   // Tập 2 lần/ngày hoặc công việc thể lực nặng
}

// ─── Calorie adjustment by goal ─────────────────────────────────────────────
export const GOAL_CALORIE_DELTA: Record<GoalType, number> = {
  [GoalType.WEIGHT_LOSS]:  -500, // Thâm hụt 500 kcal/ngày → ~0.5 kg/tuần
  [GoalType.MAINTENANCE]:     0,
  [GoalType.MUSCLE_GAIN]:  +300, // Dư thừa 300 kcal/ngày → tăng cơ tối ưu
}

// ─── Macro ratio by goal (protein / carb / fat) ─────────────────────────────
// Tỉ lệ % tổng calo
export const MACRO_RATIOS: Record<GoalType, { protein: number; carb: number; fat: number }> = {
  [GoalType.WEIGHT_LOSS]:  { protein: 0.35, carb: 0.40, fat: 0.25 },
  [GoalType.MAINTENANCE]:  { protein: 0.25, carb: 0.50, fat: 0.25 },
  [GoalType.MUSCLE_GAIN]:  { protein: 0.30, carb: 0.45, fat: 0.25 },
}

// ─── Calories per gram ───────────────────────────────────────────────────────
export const KCAL_PER_GRAM = {
  protein: 4,
  carb: 4,
  fat: 9,
} as const

// ─── Min calories (safety floor) ────────────────────────────────────────────
export const MIN_CALORIES = {
  MALE: 1500,
  FEMALE: 1200,
  OTHER: 1200,
} as const

// ─── Input / Output types ────────────────────────────────────────────────────
export interface BMRInput {
  gender: Gender
  weightKg: number
  heightCm: number
  ageYears: number
}

export interface TDEEInput extends BMRInput {
  activityLevel: ActivityLevel
}

export interface HealthCalculationInput extends TDEEInput {
  goalType: GoalType
}

export interface MacroTargets {
  proteinG: number
  carbG: number
  fatG: number
}

export interface HealthCalculationResult {
  bmr: number
  tdee: number
  calorieTarget: number
  macros: MacroTargets
  weightStatus?: WeightStatus
}

export interface WeightStatus {
  bmi: number
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese'
}
