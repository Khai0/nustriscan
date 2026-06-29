import { describe, it, expect } from 'vitest'
import { calculateDailyScore, type NutritionInput, type HealthTargets } from '@utils/health-rules/scoring-engine'

const baseNutrition: NutritionInput = {
  calories: 2000, protein: 150, carbohydrates: 220,
  fat: 60, fiber: 25, sugar: 30, sodium: 1800, mealCount: 3,
}

const targets: HealthTargets = {
  calorieTarget: 2100, proteinTarget: 160, carbTarget: 260, fatTarget: 65,
}

describe('calculateDailyScore', () => {
  it('returns a score between 0 and 100', () => {
    const result = calculateDailyScore(baseNutrition, targets)
    expect(result.scores.overall).toBeGreaterThanOrEqual(0)
    expect(result.scores.overall).toBeLessThanOrEqual(100)
  })

  it('grades "good" or "excellent" for a balanced day near targets', () => {
    const result = calculateDailyScore(baseNutrition, targets)
    expect(['good', 'excellent']).toContain(result.grade)
  })

  it('produces a calorie excess alert when over target by >20%', () => {
    const result = calculateDailyScore(
      { ...baseNutrition, calories: 2700 },
      targets
    )
    const alert = result.alerts.find(a => a.id === 'calorie_excess')
    expect(alert).toBeDefined()
    expect(alert?.severity).toBe('WARNING')
  })

  it('produces a low_protein alert when protein is far below target', () => {
    const result = calculateDailyScore(
      { ...baseNutrition, protein: 60 },
      targets
    )
    expect(result.alerts.some(a => a.id === 'low_protein')).toBe(true)
    expect(result.scores.protein).toBeLessThan(60)
  })

  it('applies stricter sugar limit and DANGER severity for DIABETES', () => {
    const nutrition = { ...baseNutrition, sugar: 30 }
    const normal   = calculateDailyScore(nutrition, targets, [])
    const diabetic = calculateDailyScore(nutrition, targets, [{ condition: 'DIABETES' }])

    // 30g exceeds the 25g diabetic limit but is under the 50g normal limit
    expect(normal.alerts.some(a => a.id === 'high_sugar')).toBe(false)
    const diabeticAlert = diabetic.alerts.find(a => a.id === 'high_sugar')
    expect(diabeticAlert).toBeDefined()
    expect(diabeticAlert?.severity).toBe('DANGER')
    expect(diabetic.scores.sugar).toBeLessThan(normal.scores.sugar)
  })

  it('applies stricter sodium limit for HYPERTENSION', () => {
    const nutrition = { ...baseNutrition, sodium: 1800 }
    const normal       = calculateDailyScore(nutrition, targets, [])
    const hypertensive = calculateDailyScore(nutrition, targets, [{ condition: 'HYPERTENSION' }])

    expect(hypertensive.scores.sodium).toBeLessThan(normal.scores.sodium)
  })

  it('returns zero scores and a "no data" summary when no meals logged', () => {
    const result = calculateDailyScore(
      { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, mealCount: 0 },
      targets
    )
    expect(result.summary).toContain('Chưa có dữ liệu')
  })

  it('rewards higher meal diversity', () => {
    const oneMeal  = calculateDailyScore({ ...baseNutrition, mealCount: 1 }, targets)
    const fourMeal = calculateDailyScore({ ...baseNutrition, mealCount: 4 }, targets)
    expect(fourMeal.scores.diversity).toBeGreaterThan(oneMeal.scores.diversity)
  })
})
