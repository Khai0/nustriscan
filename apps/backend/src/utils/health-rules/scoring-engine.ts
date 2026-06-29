import {
  DRI, SCORE_WEIGHTS, SCORE_THRESHOLDS,
  CONDITION_OVERRIDES, ALERT_RULES, type AlertRule,
} from './health-constants'

export interface NutritionInput {
  calories:      number
  protein:       number
  carbohydrates: number
  fat:           number
  fiber:         number
  sugar:         number
  sodium:        number    // mg
  cholesterol?:  number    // mg
  saturatedFat?: number    // g
  water?:        number    // ml
  mealCount?:    number
}

export interface HealthTargets {
  calorieTarget?: number
  proteinTarget?: number
  carbTarget?:    number
  fatTarget?:     number
}

export interface HealthCondition {
  condition: string
  severity?: string
}

export interface ScoreBreakdown {
  overall:   number
  calorie:   number
  protein:   number
  sugar:     number
  sodium:    number
  fiber:     number
  diversity: number
}

export interface HealthAlert {
  id:             string
  nutrient:       string
  severity:       'INFO' | 'WARNING' | 'DANGER'
  title:          string
  message:        string
  recommendation: string
}

export interface ScoringResult {
  scores:    ScoreBreakdown
  alerts:    HealthAlert[]
  grade:     'excellent' | 'good' | 'fair' | 'poor'
  summary:   string
}

// ── Individual nutrient scorers ───────────────────────────────────────────────

/** Score calorie balance. 100 = hit target exactly. Penalises both over and under. */
function scoreCalories(actual: number, target?: number): number {
  if (!target || target <= 0) return 75  // default when no target
  const ratio = actual / target
  if (ratio >= 0.85 && ratio <= 1.10) return 100
  if (ratio >= 0.75 && ratio <= 1.20) return 85
  if (ratio >= 0.60 && ratio <= 1.35) return 65
  if (ratio >= 0.45 && ratio <= 1.55) return 40
  return 15
}

/** Score protein. 100 = hit target. Low protein penalised heavily. */
function scoreProtein(actual: number, target?: number): number {
  if (!target || target <= 0) {
    // Fallback: 0.8g per kg is absolute minimum; assume 70kg
    const minimum = 56
    const ratio = actual / minimum
    if (ratio >= 1.0) return 100
    if (ratio >= 0.8) return 80
    if (ratio >= 0.6) return 55
    return 25
  }
  const ratio = actual / target
  if (ratio >= 0.90) return 100
  if (ratio >= 0.75) return 80
  if (ratio >= 0.55) return 55
  if (ratio >= 0.40) return 30
  return 10
}

/** Score sugar. Lower is better. */
function scoreSugar(actual: number, conditions: HealthCondition[]): number {
  const isDiabetes = conditions.some(c => c.condition === 'DIABETES')
  const limit = isDiabetes ? CONDITION_OVERRIDES.DIABETES.SUGAR_MAX_G : DRI.SUGAR_MAX_G
  const ideal = isDiabetes ? CONDITION_OVERRIDES.DIABETES.SUGAR_IDEAL_G : DRI.SUGAR_IDEAL_G

  if (actual <= ideal)        return 100
  if (actual <= limit * 0.7)  return 90
  if (actual <= limit)        return 72
  if (actual <= limit * 1.3)  return 50
  if (actual <= limit * 1.7)  return 25
  return 5
}

/** Score sodium. Lower is better. */
function scoreSodium(actual: number, conditions: HealthCondition[]): number {
  const isHypertension = conditions.some(c => c.condition === 'HYPERTENSION')
  const limit = isHypertension ? CONDITION_OVERRIDES.HYPERTENSION.SODIUM_MAX_MG : DRI.SODIUM_MAX_MG
  const ideal = isHypertension ? CONDITION_OVERRIDES.HYPERTENSION.SODIUM_IDEAL_MG : DRI.SODIUM_IDEAL_MG

  if (actual <= ideal)        return 100
  if (actual <= limit * 0.75) return 88
  if (actual <= limit)        return 68
  if (actual <= limit * 1.3)  return 40
  if (actual <= limit * 1.7)  return 18
  return 5
}

/** Score fiber. Higher is better up to a ceiling. */
function scoreFiber(actual: number, conditions: HealthCondition[]): number {
  const isObesity = conditions.some(c => c.condition === 'OBESITY')
  const target = isObesity ? CONDITION_OVERRIDES.OBESITY.FIBER_MIN_G : DRI.FIBER_MIN_G

  const ratio = actual / target
  if (ratio >= 1.0)  return 100
  if (ratio >= 0.85) return 88
  if (ratio >= 0.65) return 70
  if (ratio >= 0.45) return 48
  if (ratio >= 0.25) return 25
  return 8
}

/** Score meal diversity (0–5 meals scale). */
function scoreDiversity(mealCount = 3): number {
  if (mealCount >= 4) return 100
  if (mealCount === 3) return 85
  if (mealCount === 2) return 60
  if (mealCount === 1) return 30
  return 0
}

// ── Alert generator ───────────────────────────────────────────────────────────
function generateAlerts(
  nutrition: NutritionInput,
  targets: HealthTargets,
  conditions: HealthCondition[]
): HealthAlert[] {
  const alerts: HealthAlert[] = []
  const conditionNames = conditions.map(c => c.condition)

  const isHypertension = conditionNames.includes('HYPERTENSION')
  const isDiabetes     = conditionNames.includes('DIABETES')

  // Sodium checks
  const sodiumLimit = isHypertension ? CONDITION_OVERRIDES.HYPERTENSION.SODIUM_MAX_MG : DRI.SODIUM_MAX_MG
  if (nutrition.sodium > sodiumLimit * 1.5) {
    alerts.push({
      id: 'very_high_sodium', nutrient: 'sodium', severity: 'DANGER',
      title: 'Natri rất cao',
      message: `Bạn đã nạp ${nutrition.sodium.toFixed(0)}mg natri — vượt ${((nutrition.sodium/sodiumLimit-1)*100).toFixed(0)}% giới hạn`,
      recommendation: 'Cần giảm ngay thực phẩm mặn, nước mắm, đồ chế biến sẵn.',
    })
  } else if (nutrition.sodium > sodiumLimit) {
    alerts.push({
      id: 'high_sodium', nutrient: 'sodium',
      severity: isHypertension ? 'DANGER' : 'WARNING',
      title: isHypertension ? 'Natri nguy hiểm (huyết áp cao)' : 'Natri cao',
      message: `${nutrition.sodium.toFixed(0)}mg natri (giới hạn ${sodiumLimit}mg)`,
      recommendation: 'Hạn chế nước mắm, muối, mì ăn liền, đồ hộp.',
    })
  }

  // Sugar checks
  const sugarLimit = isDiabetes ? CONDITION_OVERRIDES.DIABETES.SUGAR_MAX_G : DRI.SUGAR_MAX_G
  if (nutrition.sugar > sugarLimit) {
    alerts.push({
      id: 'high_sugar', nutrient: 'sugar',
      severity: isDiabetes ? 'DANGER' : 'WARNING',
      title: isDiabetes ? 'Đường nguy hiểm (tiểu đường)' : 'Đường cao',
      message: `${nutrition.sugar.toFixed(0)}g đường (giới hạn ${sugarLimit}g)`,
      recommendation: isDiabetes
        ? 'Nguy hiểm! Cần giảm ngay carbohydrate tinh chế và tham khảo bác sĩ.'
        : 'Hạn chế trà sữa, nước ngọt, bánh kẹo.',
    })
  }

  // Fiber check
  const fiberMin = DRI.FIBER_MIN_G
  if (nutrition.fiber < fiberMin * 0.5) {
    alerts.push({
      id: 'low_fiber', nutrient: 'fiber', severity: 'INFO',
      title: 'Chất xơ rất thấp',
      message: `Chỉ ${nutrition.fiber.toFixed(0)}g chất xơ (mục tiêu ${fiberMin}g)`,
      recommendation: 'Ăn thêm rau xanh, trái cây tươi, đậu các loại.',
    })
  }

  // Protein check
  if (targets.proteinTarget && nutrition.protein < targets.proteinTarget * 0.6) {
    alerts.push({
      id: 'low_protein', nutrient: 'protein', severity: 'WARNING',
      title: 'Protein không đủ',
      message: `${nutrition.protein.toFixed(0)}g protein (mục tiêu ${targets.proteinTarget}g)`,
      recommendation: 'Bổ sung thịt nạc, cá, trứng, đậu phụ, sữa chua.',
    })
  }

  // Calorie checks
  if (targets.calorieTarget) {
    const diff = nutrition.calories - targets.calorieTarget
    if (diff > targets.calorieTarget * 0.2) {
      alerts.push({
        id: 'calorie_excess', nutrient: 'calories', severity: 'WARNING',
        title: 'Vượt calo mục tiêu',
        message: `${nutrition.calories.toFixed(0)} kcal — vượt ${diff.toFixed(0)} kcal`,
        recommendation: 'Giảm khẩu phần, tránh đồ chiên xào và nước ngọt.',
      })
    } else if (nutrition.calories < targets.calorieTarget * 0.55 && nutrition.calories > 0) {
      alerts.push({
        id: 'calorie_deficit_extreme', nutrient: 'calories', severity: 'WARNING',
        title: 'Calo quá thấp',
        message: `Chỉ ${nutrition.calories.toFixed(0)} kcal — thiếu ${(targets.calorieTarget - nutrition.calories).toFixed(0)} kcal`,
        recommendation: 'Ăn không đủ calo gây mất cơ. Thêm bữa phụ lành mạnh.',
      })
    }
  }

  return alerts
}

// ── Grade calculator ──────────────────────────────────────────────────────────
function getGrade(score: number): ScoringResult['grade'] {
  if (score >= SCORE_THRESHOLDS.EXCELLENT) return 'excellent'
  if (score >= SCORE_THRESHOLDS.GOOD)      return 'good'
  if (score >= SCORE_THRESHOLDS.FAIR)      return 'fair'
  return 'poor'
}

// ── Summary generator ─────────────────────────────────────────────────────────
function buildSummary(scores: ScoreBreakdown, alerts: HealthAlert[], mealCount: number): string {
  if (mealCount === 0) return 'Chưa có dữ liệu bữa ăn hôm nay.'

  if (scores.overall >= SCORE_THRESHOLDS.EXCELLENT) {
    return 'Xuất sắc! Chế độ ăn hôm nay rất cân bằng và lành mạnh. 🌟'
  }
  if (scores.overall >= SCORE_THRESHOLDS.GOOD) {
    const weakest = Object.entries(scores)
      .filter(([k]) => k !== 'overall' && k !== 'diversity')
      .sort(([,a],[,b]) => a - b)[0]
    const label: Record<string, string> = { calorie:'calo', protein:'protein', sugar:'đường', sodium:'natri', fiber:'chất xơ' }
    return `Tốt! Hôm nay ăn khá cân bằng. Cần cải thiện thêm về ${label[weakest[0]] ?? weakest[0]}. ✅`
  }
  if (alerts.length > 0) {
    const top = alerts.find(a => a.severity === 'DANGER') ?? alerts[0]
    return `Cần chú ý: ${top.title.toLowerCase()}. ${top.recommendation}`
  }
  return 'Chế độ ăn hôm nay cần cải thiện. Xem chi tiết để biết thêm. ⚠️'
}

// ── Master scoring function ───────────────────────────────────────────────────
export function calculateDailyScore(
  nutrition: NutritionInput,
  targets: HealthTargets,
  conditions: HealthCondition[] = []
): ScoringResult {
  const scores: ScoreBreakdown = {
    calorie:   scoreCalories(nutrition.calories, targets.calorieTarget),
    protein:   scoreProtein(nutrition.protein,   targets.proteinTarget),
    sugar:     scoreSugar(nutrition.sugar, conditions),
    sodium:    scoreSodium(nutrition.sodium, conditions),
    fiber:     scoreFiber(nutrition.fiber, conditions),
    diversity: scoreDiversity(nutrition.mealCount),
    overall:   0,
  }

  // Weighted overall score
  scores.overall = Math.round(
    scores.calorie   * SCORE_WEIGHTS.calorie   +
    scores.protein   * SCORE_WEIGHTS.protein   +
    scores.sugar     * SCORE_WEIGHTS.sugar     +
    scores.sodium    * SCORE_WEIGHTS.sodium    +
    scores.fiber     * SCORE_WEIGHTS.fiber     +
    scores.diversity * SCORE_WEIGHTS.diversity
  )

  const alerts  = generateAlerts(nutrition, targets, conditions)
  const grade   = getGrade(scores.overall)
  const summary = buildSummary(scores, alerts, nutrition.mealCount ?? 0)

  return { scores, alerts, grade, summary }
}
