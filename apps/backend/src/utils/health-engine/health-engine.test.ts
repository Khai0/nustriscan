import { describe, it, expect } from 'vitest'
import { calculateBMR } from './bmr'
import { calculateTDEE, calculateCalorieTarget, calculateMacroTargets, calculateBMI, calculateHealthMetrics } from './tdee'
import { Gender, ActivityLevel, GoalType } from './constants'

const maleSample = {
  gender: Gender.MALE,
  weightKg: 70,
  heightCm: 175,
  ageYears: 30,
}

const femaleSample = {
  gender: Gender.FEMALE,
  weightKg: 55,
  heightCm: 160,
  ageYears: 25,
}

describe('calculateBMR', () => {
  it('tính đúng BMR cho nam', () => {
    // (10×70) + (6.25×175) − (5×30) + 5 = 700 + 1093.75 − 150 + 5 = 1648.75 ≈ 1649
    expect(calculateBMR(maleSample)).toBe(1649)
  })

  it('tính đúng BMR cho nữ', () => {
    // (10×55) + (6.25×160) − (5×25) − 161 = 550 + 1000 − 125 − 161 = 1264
    expect(calculateBMR(femaleSample)).toBe(1264)
  })

  it('ném lỗi khi weight <= 0', () => {
    expect(() => calculateBMR({ ...maleSample, weightKg: 0 })).toThrow()
  })

  it('ném lỗi khi tuổi ngoài khoảng', () => {
    expect(() => calculateBMR({ ...maleSample, ageYears: 10 })).toThrow()
  })
})

describe('calculateTDEE', () => {
  it('SEDENTARY × 1.2', () => {
    const bmr = calculateBMR(maleSample)
    const tdee = calculateTDEE({ ...maleSample, activityLevel: ActivityLevel.SEDENTARY })
    expect(tdee).toBe(Math.round(bmr * 1.2))
  })

  it('ATHLETE × 1.9', () => {
    const bmr = calculateBMR(maleSample)
    const tdee = calculateTDEE({ ...maleSample, activityLevel: ActivityLevel.ATHLETE })
    expect(tdee).toBe(Math.round(bmr * 1.9))
  })
})

describe('calculateCalorieTarget', () => {
  it('WEIGHT_LOSS giảm 500 kcal so với TDEE', () => {
    const tdee = 2000
    const target = calculateCalorieTarget(tdee, GoalType.WEIGHT_LOSS, Gender.MALE)
    expect(target).toBe(1500)
  })

  it('MAINTENANCE bằng TDEE', () => {
    expect(calculateCalorieTarget(2000, GoalType.MAINTENANCE, Gender.MALE)).toBe(2000)
  })

  it('MUSCLE_GAIN tăng 300 kcal so với TDEE', () => {
    expect(calculateCalorieTarget(2000, GoalType.MUSCLE_GAIN, Gender.MALE)).toBe(2300)
  })

  it('không xuống dưới 1200 kcal cho nữ', () => {
    const target = calculateCalorieTarget(1500, GoalType.WEIGHT_LOSS, Gender.FEMALE)
    expect(target).toBeGreaterThanOrEqual(1200)
  })

  it('không xuống dưới 1500 kcal cho nam', () => {
    const target = calculateCalorieTarget(1800, GoalType.WEIGHT_LOSS, Gender.MALE)
    expect(target).toBeGreaterThanOrEqual(1500)
  })
})

describe('calculateMacroTargets', () => {
  it('tổng macro khớp với calo mục tiêu (±5%)', () => {
    const calo = 2000
    const macros = calculateMacroTargets(calo, GoalType.MAINTENANCE)
    const totalCalo = macros.proteinG * 4 + macros.carbG * 4 + macros.fatG * 9
    expect(totalCalo).toBeGreaterThan(calo * 0.95)
    expect(totalCalo).toBeLessThan(calo * 1.05)
  })

  it('WEIGHT_LOSS có protein cao nhất', () => {
    const macros = calculateMacroTargets(2000, GoalType.WEIGHT_LOSS)
    expect(macros.proteinG * 4).toBeGreaterThan(macros.fatG * 9)
  })
})

describe('calculateBMI', () => {
  it('BMI bình thường', () => {
    const result = calculateBMI(70, 175)
    expect(result.bmi).toBeCloseTo(22.9, 1)
    expect(result.category).toBe('Normal')
  })

  it('Thừa cân', () => {
    const result = calculateBMI(90, 175)
    expect(result.category).toBe('Overweight')
  })

  it('Béo phì', () => {
    const result = calculateBMI(110, 175)
    expect(result.category).toBe('Obese')
  })

  it('Thiếu cân', () => {
    const result = calculateBMI(50, 175)
    expect(result.category).toBe('Underweight')
  })
})

describe('calculateHealthMetrics (integration)', () => {
  it('trả về đủ các trường', () => {
    const result = calculateHealthMetrics({
      ...maleSample,
      activityLevel: ActivityLevel.MODERATE,
      goalType: GoalType.WEIGHT_LOSS,
    })
    expect(result.bmr).toBeGreaterThan(0)
    expect(result.tdee).toBeGreaterThan(result.bmr)
    expect(result.calorieTarget).toBeGreaterThan(0)
    expect(result.macros.proteinG).toBeGreaterThan(0)
    expect(result.macros.carbG).toBeGreaterThan(0)
    expect(result.macros.fatG).toBeGreaterThan(0)
    expect(result.weightStatus).toBeDefined()
  })
})
