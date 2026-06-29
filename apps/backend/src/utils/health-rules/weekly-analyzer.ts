import { DRI, SCORE_THRESHOLDS } from './health-constants'

export interface DayNutrition {
  date:          string
  calories:      number
  protein:       number
  carbohydrates: number
  fat:           number
  fiber:         number
  sugar:         number
  sodium:        number
  water:         number
  mealCount:     number
  score?:        number
}

export interface WeeklyTrend {
  nutrient:  string
  label:     string
  direction: 'improving' | 'declining' | 'stable'
  change:    number     // percentage change vs previous week
  message:   string
}

export interface NutrientDeficiency {
  nutrient:       string
  label:          string
  avgValue:       number
  target:         number
  deficitPct:     number
  daysDeficient:  number
  severity:       'mild' | 'moderate' | 'severe'
  recommendation: string
}

export interface DetectedHabit {
  id:          string
  type:        'positive' | 'negative' | 'neutral'
  title:       string
  description: string
  frequency:   string  // "5 of 7 days"
}

export interface WeeklyInsightData {
  trends:      WeeklyTrend[]
  deficiencies:NutrientDeficiency[]
  habits:      DetectedHabit[]
  avgScore:    number
  daysLogged:  number
  streakDays:  number
  bestDay:     string | null
  worstDay:    string | null
}

/** Compute average of an array */
function avg(vals: number[]): number {
  if (!vals.length) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

/** Days with at least 1 meal */
function countLoggedDays(days: DayNutrition[]): number {
  return days.filter(d => d.mealCount > 0).length
}

/** Consecutive streak from today going back */
function computeStreak(days: DayNutrition[]): number {
  const sorted = [...days].sort((a, b) => b.date.localeCompare(a.date))
  let streak = 0
  for (const d of sorted) {
    if (d.mealCount > 0) streak++
    else break
  }
  return streak
}

/** Detect trends in a single nutrient */
function detectTrend(
  values: number[],
  label: string,
  nutrient: string,
  higherIsBetter: boolean
): WeeklyTrend {
  if (values.length < 3) {
    return { nutrient, label, direction: 'stable', change: 0, message: 'Chưa đủ dữ liệu để phân tích xu hướng.' }
  }

  const firstHalf  = values.slice(0, Math.floor(values.length / 2))
  const secondHalf = values.slice(Math.floor(values.length / 2))
  const avgFirst   = avg(firstHalf)
  const avgSecond  = avg(secondHalf)

  if (avgFirst === 0) return { nutrient, label, direction: 'stable', change: 0, message: 'Dữ liệu không đủ.' }

  const changePct = ((avgSecond - avgFirst) / avgFirst) * 100

  let direction: WeeklyTrend['direction']
  if (Math.abs(changePct) < 5) {
    direction = 'stable'
  } else {
    const increasing = changePct > 0
    direction = (increasing === higherIsBetter) ? 'improving' : 'declining'
  }

  const msgs: Record<WeeklyTrend['direction'], string> = {
    improving: `${label} đang cải thiện (+${Math.abs(changePct).toFixed(0)}% so với đầu tuần). Tuyệt vời!`,
    declining: `${label} đang giảm ${Math.abs(changePct).toFixed(0)}% so với đầu tuần. Cần chú ý.`,
    stable:    `${label} khá ổn định trong tuần.`,
  }

  return { nutrient, label, direction, change: Math.round(changePct), message: msgs[direction] }
}

/** Find nutrients that are consistently below target */
function findDeficiencies(
  days: DayNutrition[],
  targets: { protein?: number; fiber?: number; water?: number }
): NutrientDeficiency[] {
  const logged = days.filter(d => d.mealCount > 0)
  if (!logged.length) return []

  const deficiencies: NutrientDeficiency[] = []

  const checks: Array<{
    key:    keyof DayNutrition
    label:  string
    target: number | undefined
    rec:    string
  }> = [
    { key: 'protein', label: 'Protein',    target: targets.protein, rec: 'Thêm thịt nạc, cá, trứng, đậu phụ vào mỗi bữa.' },
    { key: 'fiber',   label: 'Chất xơ',   target: targets.fiber ?? DRI.FIBER_MIN_G, rec: 'Ăn ít nhất 3 phần rau xanh và 1–2 phần trái cây mỗi ngày.' },
    { key: 'water',   label: 'Nước uống', target: targets.water ?? DRI.WATER_MIN_ML, rec: 'Đặt nhắc nhở uống nước mỗi 2 giờ. Mục tiêu 8 ly/ngày.' },
  ]

  for (const check of checks) {
    if (!check.target || check.target <= 0) continue

    const values      = logged.map(d => (d[check.key] as number) ?? 0)
    const avgVal      = avg(values)
    const deficitPct  = Math.max(0, ((check.target - avgVal) / check.target) * 100)
    const daysDeficient = values.filter(v => v < check.target! * 0.8).length

    if (deficitPct >= 15) {
      const severity: NutrientDeficiency['severity'] =
        deficitPct >= 50 ? 'severe' : deficitPct >= 30 ? 'moderate' : 'mild'

      deficiencies.push({
        nutrient:      check.key as string,
        label:         check.label,
        avgValue:      Math.round(avgVal),
        target:        check.target,
        deficitPct:    Math.round(deficitPct),
        daysDeficient,
        severity,
        recommendation: check.rec,
      })
    }
  }

  return deficiencies
}

/** Detect eating habits from daily data */
function detectHabits(days: DayNutrition[]): DetectedHabit[] {
  const habits: DetectedHabit[] = []
  const logged  = days.filter(d => d.mealCount > 0)
  const total   = logged.length
  if (!total) return []

  // Skip breakfast (only 1 meal)
  const singleMealDays = logged.filter(d => d.mealCount === 1).length
  if (singleMealDays >= Math.ceil(total * 0.5)) {
    habits.push({
      id: 'skip_meals', type: 'negative',
      title: 'Hay bỏ bữa',
      description: `${singleMealDays}/${total} ngày chỉ ghi nhận 1 bữa ăn.`,
      frequency:   `${singleMealDays} trong ${total} ngày`,
    })
  }

  // Consistent logging
  if (total >= 6) {
    habits.push({
      id: 'consistent_logger', type: 'positive',
      title: 'Theo dõi đều đặn',
      description: 'Bạn ghi nhận bữa ăn rất đều trong tuần. Tiếp tục phát huy!',
      frequency:   `${total}/7 ngày`,
    })
  }

  // High sodium days
  const highSodiumDays = logged.filter(d => d.sodium > DRI.SODIUM_MAX_MG).length
  if (highSodiumDays >= Math.ceil(total * 0.4)) {
    habits.push({
      id: 'high_sodium_habit', type: 'negative',
      title: 'Ăn mặn thường xuyên',
      description: `${highSodiumDays}/${total} ngày vượt giới hạn natri khuyến nghị.`,
      frequency:   `${highSodiumDays} trong ${total} ngày`,
    })
  }

  // High sugar days
  const highSugarDays = logged.filter(d => d.sugar > DRI.SUGAR_MAX_G).length
  if (highSugarDays >= Math.ceil(total * 0.4)) {
    habits.push({
      id: 'high_sugar_habit', type: 'negative',
      title: 'Tiêu thụ nhiều đường',
      description: `${highSugarDays}/${total} ngày vượt giới hạn đường khuyến nghị.`,
      frequency:   `${highSugarDays} trong ${total} ngày`,
    })
  }

  // Good fiber days
  const goodFiberDays = logged.filter(d => d.fiber >= DRI.FIBER_MIN_G * 0.8).length
  if (goodFiberDays >= Math.ceil(total * 0.6)) {
    habits.push({
      id: 'good_fiber', type: 'positive',
      title: 'Ăn đủ chất xơ',
      description: `${goodFiberDays}/${total} ngày đạt mục tiêu chất xơ.`,
      frequency:   `${goodFiberDays} trong ${total} ngày`,
    })
  }

  return habits
}

// ── Master weekly analyzer ───────────────────────────────────────────────────
export function analyzeWeeklyTrends(
  days: DayNutrition[],
  targets: { calorieTarget?: number; proteinTarget?: number; fiber?: number; water?: number }
): WeeklyInsightData {
  const logged = days.filter(d => d.mealCount > 0)

  const trends: WeeklyTrend[] = [
    detectTrend(logged.map(d => d.protein),  'Protein',   'protein', true),
    detectTrend(logged.map(d => d.fiber),    'Chất xơ',   'fiber',   true),
    detectTrend(logged.map(d => d.sodium),   'Natri',      'sodium',  false),
    detectTrend(logged.map(d => d.sugar),    'Đường',      'sugar',   false),
    detectTrend(logged.map(d => d.calories), 'Calo',       'calories',true),
  ]

  const scores   = logged.filter(d => d.score != null).map(d => d.score!)
  const avgScore = scores.length ? Math.round(avg(scores)) : 0

  const sortedByScore = [...logged].filter(d => d.score != null).sort((a, b) => (b.score ?? 0) - (a.score ?? 0))

  return {
    trends,
    deficiencies: findDeficiencies(days, { protein: targets.proteinTarget, fiber: targets.fiber, water: targets.water }),
    habits:       detectHabits(days),
    avgScore,
    daysLogged:   countLoggedDays(days),
    streakDays:   computeStreak(days),
    bestDay:      sortedByScore[0]?.date   ?? null,
    worstDay:     sortedByScore[sortedByScore.length - 1]?.date ?? null,
  }
}
