import {
  ACTIVITY_MULTIPLIERS,
  GOAL_CALORIE_DELTA,
  MACRO_RATIOS,
  KCAL_PER_GRAM,
  MIN_CALORIES,
  type TDEEInput,
  type HealthCalculationInput,
  type HealthCalculationResult,
  type MacroTargets,
  type WeightStatus,
  Gender,
} from './constants'
import { calculateBMR } from './bmr'

// ─── TDEE ────────────────────────────────────────────────────────────────────
/**
 * Tính TDEE (Total Daily Energy Expenditure)
 * TDEE = BMR × PAL (Physical Activity Level)
 *
 * Nguồn: FAO/WHO/UNU (2001). Human energy requirements.
 */
export function calculateTDEE(input: TDEEInput): number {
  const bmr = calculateBMR(input)
  const multiplier = ACTIVITY_MULTIPLIERS[input.activityLevel]
  return Math.round(bmr * multiplier)
}

// ─── Calorie Target ──────────────────────────────────────────────────────────
/**
 * Tính mục tiêu calo hàng ngày dựa trên TDEE và goal.
 * Đảm bảo không xuống dưới mức an toàn tối thiểu.
 */
export function calculateCalorieTarget(
  tdee: number,
  goalType: HealthCalculationInput['goalType'],
  gender: Gender
): number {
  const raw = tdee + GOAL_CALORIE_DELTA[goalType]
  const minFloor = gender === Gender.MALE ? MIN_CALORIES.MALE : MIN_CALORIES.FEMALE
  return Math.max(Math.round(raw), minFloor)
}

// ─── Macro Targets ───────────────────────────────────────────────────────────
/**
 * Tính mục tiêu macro (protein, carb, fat) theo gram.
 *
 * Protein: ratio × calo / 4 kcal/g
 * Carb:    ratio × calo / 4 kcal/g
 * Fat:     ratio × calo / 9 kcal/g
 */
export function calculateMacroTargets(
  calorieTarget: number,
  goalType: HealthCalculationInput['goalType']
): MacroTargets {
  const ratios = MACRO_RATIOS[goalType]
  return {
    proteinG: Math.round((calorieTarget * ratios.protein) / KCAL_PER_GRAM.protein),
    carbG:    Math.round((calorieTarget * ratios.carb)    / KCAL_PER_GRAM.carb),
    fatG:     Math.round((calorieTarget * ratios.fat)     / KCAL_PER_GRAM.fat),
  }
}

// ─── BMI & Weight Status ─────────────────────────────────────────────────────
/**
 * Tính BMI và phân loại theo WHO.
 * BMI = kg / (m²)
 */
export function calculateBMI(weightKg: number, heightCm: number): WeightStatus {
  const heightM = heightCm / 100
  const bmi = weightKg / (heightM * heightM)

  let category: WeightStatus['category']
  if (bmi < 18.5)      category = 'Underweight'
  else if (bmi < 25.0) category = 'Normal'
  else if (bmi < 30.0) category = 'Overweight'
  else                  category = 'Obese'

  return { bmi: Math.round(bmi * 10) / 10, category }
}

// ─── Master calculator — tính tất cả trong 1 lần ────────────────────────────
/**
 * Tính toán hoàn chỉnh: BMR → TDEE → Calo Target → Macro Targets → BMI
 */
export function calculateHealthMetrics(input: HealthCalculationInput): HealthCalculationResult {
  const bmr = calculateBMR(input)
  const multiplier = ACTIVITY_MULTIPLIERS[input.activityLevel]
  const tdee = Math.round(bmr * multiplier)
  const calorieTarget = calculateCalorieTarget(tdee, input.goalType, input.gender)
  const macros = calculateMacroTargets(calorieTarget, input.goalType)
  const weightStatus = calculateBMI(input.weightKg, input.heightCm)

  return {
    bmr,
    tdee,
    calorieTarget,
    macros,
    weightStatus,
  }
}

// ─── Daily water intake recommendation ──────────────────────────────────────
/**
 * Khuyến nghị lượng nước uống hàng ngày (ml)
 * Công thức: 35ml × cân nặng (kg), điều chỉnh theo mức hoạt động
 */
export function calculateWaterTarget(
  weightKg: number,
  activityLevel: TDEEInput['activityLevel']
): number {
  const base = 35 * weightKg // ml
  const activityBonus: Record<string, number> = {
    SEDENTARY: 0,
    LIGHT:     200,
    MODERATE:  400,
    ACTIVE:    600,
    ATHLETE:   900,
  }
  return Math.round(base + (activityBonus[activityLevel] ?? 0))
}
