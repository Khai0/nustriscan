import { prisma } from '@config/database'
import { cached, cacheDel } from '@config/redis'

// ── Date helpers ──────────────────────────────────────────────────────────────
function dateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

function avg(arr: number[]): number {
  if (!arr.length) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface DayPoint {
  date:     string
  calories: number
  protein:  number
  carbs:    number
  fat:      number
  fiber:    number
  sugar:    number
  sodium:   number
  water:    number
  score:    number | null
  mealCount:number
}

export interface MealFrequencyPoint {
  type:  string   // BREAKFAST | LUNCH | DINNER | SNACK
  label: string
  count: number
  avgCalories: number
}

export interface SmartInsight {
  id:       string
  type:     'positive' | 'negative' | 'neutral' | 'tip'
  title:    string
  message:  string
  metric?:  string
  value?:   number
}

export interface PeriodSummary {
  period:        'daily' | 'weekly' | 'monthly'
  label:         string
  avgCalories:   number
  avgProtein:    number
  avgCarbs:      number
  avgFat:        number
  avgFiber:      number
  avgSugar:      number
  avgSodium:     number
  avgWater:      number
  avgScore:      number
  daysLogged:    number
  totalMeals:    number
  calorieTarget? :number
  proteinTarget? :number
}

// ── Main analytics service ────────────────────────────────────────────────────
export const analyticsService = {
  // ── Fetch day-level data for N days ────────────────────────────────────────
  async getDailyPoints(userId: string, days: number): Promise<DayPoint[]> {
    const start = daysAgo(days - 1)
    const records = await prisma.dailyAnalysis.findMany({
      where:   { userId, date: { gte: start } },
      orderBy: { date: 'asc' },
    })

    // Build a full array including days with no data
    const map = new Map(records.map(r => [dateStr(r.date), r]))
    const result: DayPoint[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d  = daysAgo(i)
      const ds = dateStr(d)
      const r  = map.get(ds)
      result.push({
        date:      ds,
        calories:  r?.calories  ?? 0,
        protein:   r?.protein   ?? 0,
        carbs:     r?.carbohydrates ?? 0,
        fat:       r?.fat       ?? 0,
        fiber:     r?.fiber     ?? 0,
        sugar:     r?.sugar     ?? 0,
        sodium:    r?.sodium    ?? 0,
        water:     r?.water     ?? 0,
        score:     r?.overallScore ?? null,
        mealCount: r?.mealCount ?? 0,
      })
    }
    return result
  },

  // ── Period summary ──────────────────────────────────────────────────────────
  async getPeriodSummary(
    userId: string,
    period: 'daily' | 'weekly' | 'monthly'
  ): Promise<PeriodSummary> {
    return cached(`analytics:period:${userId}:${period}`, 300, () => analyticsService._getPeriodSummary(userId, period))
  },

  async _getPeriodSummary(
    userId: string,
    period: 'daily' | 'weekly' | 'monthly'
  ): Promise<PeriodSummary> {
    const daysMap = { daily: 1, weekly: 7, monthly: 30 }
    const days    = daysMap[period]
    const points  = await analyticsService.getDailyPoints(userId, days)
    const logged  = points.filter(p => p.mealCount > 0)

    const [profile] = await Promise.all([
      prisma.healthProfile.findUnique({ where: { userId } }),
    ])

    const labels = { daily: 'Hôm nay', weekly: '7 ngày qua', monthly: '30 ngày qua' }

    return {
      period,
      label:         labels[period],
      avgCalories:   Math.round(avg(logged.map(p => p.calories))),
      avgProtein:    Math.round(avg(logged.map(p => p.protein)) * 10) / 10,
      avgCarbs:      Math.round(avg(logged.map(p => p.carbs))   * 10) / 10,
      avgFat:        Math.round(avg(logged.map(p => p.fat))     * 10) / 10,
      avgFiber:      Math.round(avg(logged.map(p => p.fiber))   * 10) / 10,
      avgSugar:      Math.round(avg(logged.map(p => p.sugar))   * 10) / 10,
      avgSodium:     Math.round(avg(logged.map(p => p.sodium))),
      avgWater:      Math.round(avg(logged.map(p => p.water))),
      avgScore:      Math.round(avg(logged.filter(p => p.score != null).map(p => p.score!))),
      daysLogged:    logged.length,
      totalMeals:    logged.reduce((s, p) => s + p.mealCount, 0),
      calorieTarget: profile?.calorieTarget ?? undefined,
      proteinTarget: profile?.proteinTarget ?? undefined,
    }
  },

  // ── Meal frequency by type ──────────────────────────────────────────────────
  async getMealFrequency(userId: string, days: number): Promise<MealFrequencyPoint[]> {
    const start = daysAgo(days - 1)
    const meals = await prisma.meal.findMany({
      where:   { userId, mealDate: { gte: start }, deletedAt: null },
      select:  { mealType: true, totalCalories: true },
    })

    const typeMap: Record<string, { count: number; totalCal: number; label: string }> = {
      BREAKFAST: { count: 0, totalCal: 0, label: 'Bữa sáng' },
      LUNCH:     { count: 0, totalCal: 0, label: 'Bữa trưa' },
      DINNER:    { count: 0, totalCal: 0, label: 'Bữa tối' },
      SNACK:     { count: 0, totalCal: 0, label: 'Bữa phụ' },
    }

    for (const m of meals) {
      const key = m.mealType as string
      if (typeMap[key]) {
        typeMap[key].count++
        typeMap[key].totalCal += m.totalCalories
      }
    }

    return Object.entries(typeMap).map(([type, data]) => ({
      type,
      label:       data.label,
      count:       data.count,
      avgCalories: data.count > 0 ? Math.round(data.totalCal / data.count) : 0,
    }))
  },

  // ── Weight trend ────────────────────────────────────────────────────────────
  async getWeightTrend(userId: string, days: number) {
    const start = daysAgo(days - 1)
    const entries = await prisma.weightTracking.findMany({
      where:   { userId, logDate: { gte: start } },
      orderBy: { logDate: 'asc' },
      select:  { logDate: true, weight: true, weightUnit: true, bmi: true },
    })

    const profile = await prisma.healthProfile.findUnique({
      where:  { userId },
      select: { targetWeight: true, weightUnit: true },
    })

    return {
      entries: entries.map(e => ({
        date:       dateStr(e.logDate),
        weight:     e.weight,
        weightUnit: e.weightUnit,
        bmi:        e.bmi,
      })),
      targetWeight: profile?.targetWeight ?? null,
      weightUnit:   profile?.weightUnit   ?? 'KG',
    }
  },

  // ── Smart insights ──────────────────────────────────────────────────────────
  async getSmartInsights(userId: string): Promise<SmartInsight[]> {
    const points  = await analyticsService.getDailyPoints(userId, 7)
    const logged  = points.filter(p => p.mealCount > 0)
    const profile = await prisma.healthProfile.findUnique({ where: { userId } })
    const insights: SmartInsight[] = []

    if (!logged.length) {
      insights.push({
        id: 'no_data', type: 'tip',
        title: 'Chưa có dữ liệu',
        message: 'Hãy ghi nhận bữa ăn để xem phân tích thông minh.',
      })
      return insights
    }

    // Sugar excess
    const highSugarDays = logged.filter(p => p.sugar > 50).length
    if (highSugarDays >= 3) {
      insights.push({
        id: 'high_sugar_freq', type: 'negative',
        title: 'Đường vượt mức thường xuyên',
        message: `Bạn vượt giới hạn đường ${highSugarDays} ngày trong 7 ngày qua. Hạn chế trà sữa, nước ngọt và bánh kẹo.`,
        metric: 'sugar', value: highSugarDays,
      })
    }

    // Protein consistency
    if (profile?.proteinTarget) {
      const lowProteinDays = logged.filter(p => p.protein < profile.proteinTarget! * 0.7).length
      if (lowProteinDays >= 4) {
        insights.push({
          id: 'low_protein_consistent', type: 'negative',
          title: 'Protein liên tục thấp',
          message: `Protein dưới mục tiêu ${lowProteinDays}/7 ngày. Thêm thịt nạc, cá, trứng hoặc đậu phụ vào mỗi bữa.`,
          metric: 'protein', value: lowProteinDays,
        })
      }
    }

    // Sodium
    const highSodiumDays = logged.filter(p => p.sodium > 2300).length
    if (highSodiumDays >= 3) {
      insights.push({
        id: 'high_sodium_freq', type: 'negative',
        title: 'Natri cao thường xuyên',
        message: `Natri vượt 2300mg trong ${highSodiumDays}/7 ngày. Giảm nước mắm, mì ăn liền, đồ hộp.`,
        metric: 'sodium', value: highSodiumDays,
      })
    }

    // Meal type analysis
    const mealFreq = await analyticsService.getMealFrequency(userId, 7)
    const lunchData = mealFreq.find(m => m.type === 'LUNCH')
    const dinnerData = mealFreq.find(m => m.type === 'DINNER')
    if (lunchData && dinnerData && lunchData.avgCalories > dinnerData.avgCalories * 1.4) {
      insights.push({
        id: 'lunch_highest', type: 'neutral',
        title: 'Bữa trưa cao calo nhất',
        message: `Bữa trưa trung bình ${lunchData.avgCalories} kcal — cao nhất trong ngày. Cân nhắc phân bổ đều hơn.`,
        metric: 'calories', value: lunchData.avgCalories,
      })
    }

    // Water intake
    const goodWaterDays = logged.filter(p => p.water >= 2000).length
    if (goodWaterDays >= 5) {
      insights.push({
        id: 'good_hydration', type: 'positive',
        title: 'Uống nước tốt 💧',
        message: `Bạn đạt mục tiêu nước ${goodWaterDays}/7 ngày. Tiếp tục duy trì!`,
        metric: 'water', value: goodWaterDays,
      })
    } else if (goodWaterDays <= 2) {
      insights.push({
        id: 'low_hydration', type: 'negative',
        title: 'Uống nước chưa đủ',
        message: `Chỉ đạt mục tiêu nước ${goodWaterDays}/7 ngày. Đặt nhắc nhở uống nước mỗi 2 giờ.`,
        metric: 'water', value: goodWaterDays,
      })
    }

    // Score trend
    const scores = logged.filter(p => p.score != null).map(p => p.score!)
    if (scores.length >= 4) {
      const firstHalf  = avg(scores.slice(0, Math.ceil(scores.length / 2)))
      const secondHalf = avg(scores.slice(Math.ceil(scores.length / 2)))
      if (secondHalf > firstHalf + 8) {
        insights.push({
          id: 'score_improving', type: 'positive',
          title: 'Điểm sức khoẻ cải thiện! 📈',
          message: `Điểm trung bình nửa cuối tuần (${Math.round(secondHalf)}) tốt hơn nửa đầu (${Math.round(firstHalf)}). Tiến bộ rõ rệt!`,
        })
      }
    }

    // Good fiber days
    const goodFiberDays = logged.filter(p => p.fiber >= 25).length
    if (goodFiberDays >= 5) {
      insights.push({
        id: 'good_fiber', type: 'positive',
        title: 'Chất xơ xuất sắc 🥦',
        message: `Đạt mục tiêu chất xơ ${goodFiberDays}/7 ngày. Rau xanh là bạn của bạn!`,
        metric: 'fiber', value: goodFiberDays,
      })
    }

    // Skip breakfast habit
    const meals7 = await prisma.meal.findMany({
      where:  { userId, mealDate: { gte: daysAgo(6) }, mealType: 'BREAKFAST', deletedAt: null },
    })
    const breakfastDays = meals7.length
    if (breakfastDays <= 2 && logged.length >= 4) {
      insights.push({
        id: 'skip_breakfast', type: 'tip',
        title: 'Hay bỏ bữa sáng',
        message: `Chỉ có ${breakfastDays}/7 ngày có bữa sáng. Bữa sáng giúp kiểm soát calo và tăng năng lượng cả ngày.`,
        metric: 'meals', value: breakfastDays,
      })
    }

    return insights.slice(0, 6)
  },

  // ── Streak tracking ─────────────────────────────────────────────────────────
  async getStreak(userId: string): Promise<{ current: number; longest: number; lastLoggedAt: string | null }> {
    const stats = await prisma.userStats.findUnique({ where: { userId } })
    if (stats) {
      return {
        current:      stats.currentStreak,
        longest:      stats.longestStreak,
        lastLoggedAt: stats.lastLoggedAt?.toISOString() ?? null,
      }
    }
    // Compute from scratch
    const analyses = await prisma.dailyAnalysis.findMany({
      where:   { userId, mealCount: { gt: 0 } },
      orderBy: { date: 'desc' },
      select:  { date: true },
    })
    let current = 0
    let longest = 0
    let prev    = new Date()
    prev.setHours(0, 0, 0, 0)
    for (const a of analyses) {
      const d = new Date(a.date)
      d.setHours(0, 0, 0, 0)
      const diff = Math.round((prev.getTime() - d.getTime()) / 86400000)
      if (diff <= 1) { current++; if (current > longest) longest = current }
      else break
      prev = d
    }
    return { current, longest, lastLoggedAt: analyses[0]?.date?.toISOString() ?? null }
  },
}


/** Call after a meal/water/weight is logged to invalidate cached analytics for the user. */
export async function invalidateAnalyticsCache(userId: string): Promise<void> {
  await cacheDel(`analytics:period:${userId}:*`)
}
