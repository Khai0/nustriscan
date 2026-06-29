import { Gender, type BMRInput } from './constants'

/**
 * Tính BMR (Basal Metabolic Rate) — Lượng calo cơ thể cần khi nghỉ ngơi hoàn toàn.
 *
 * Công thức: Mifflin-St Jeor (1990) — được WHO khuyến nghị, chính xác hơn Harris-Benedict.
 *
 * Nam:  BMR = (10 × kg) + (6.25 × cm) − (5 × tuổi) + 5
 * Nữ:   BMR = (10 × kg) + (6.25 × cm) − (5 × tuổi) − 161
 * Khác: Trung bình nam và nữ
 *
 * Nguồn: Mifflin MD, et al. (1990). Am J Clin Nutr, 51(2):241-7.
 */
export function calculateBMR(input: BMRInput): number {
  const { gender, weightKg, heightCm, ageYears } = input

  // Validate inputs
  if (weightKg <= 0 || heightCm <= 0 || ageYears <= 0) {
    throw new Error('Weight, height và age phải lớn hơn 0')
  }
  if (ageYears < 15 || ageYears > 120) {
    throw new Error('Tuổi phải từ 15 đến 120')
  }

  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears

  let bmr: number
  switch (gender) {
    case Gender.MALE:
      bmr = base + 5
      break
    case Gender.FEMALE:
      bmr = base - 161
      break
    case Gender.OTHER:
      // Lấy trung bình của nam và nữ
      bmr = base - 78
      break
    default:
      bmr = base - 78
  }

  return Math.round(bmr)
}

/**
 * Chuyển đổi đơn vị trước khi tính
 */
export function lbToKg(lb: number): number {
  return lb * 0.453592
}

export function inchToCm(inch: number): number {
  return inch * 2.54
}

export function calculateAgeFromBirthDate(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}
