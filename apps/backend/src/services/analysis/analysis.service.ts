import { prisma } from '@config/database'
import { calculateDailyScore } from '@utils/health-rules/scoring-engine'
import { analyzeWeeklyTrends, type DayNutrition } from '@utils/health-rules/weekly-analyzer'
import { recommendationService } from './recommendation.service'
import { NotFoundError } from '@utils/errors'
import { logger } from '@utils/logger'

// ── Helpers ───────────────────────────────────────────────────────────────────
function dateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

function startOfDay(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`)
}

function endOfDay(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59.999Z`)
}

// ── Analysis service ──────────────────────────────────────────────────────────
export const analysisService = {
  /**
   * Compute (or refresh) daily analysis for a given date.
   * Aggregates all meals + water for the day, scores them, generates AI rec.
   */
  async getDailyAnalysis(userId: string, date: string) {
    const dayStart = startOfDay(date)
    const dayEnd   = endOfDay(date)

    // Fetch health profile + conditions
    const [profile, conditions, meals, waterEntries] = await Promise.all([
      prisma.healthProfile.findUnique({ where: { userId } }),
      prisma.userHealthCondition.findMany({ where: { userId } }),
      prisma.meal.findMany({
        where: { userId, mealDate: { gte: dayStart, lte: dayEnd }, deletedAt: null },
        include: { mealItems: { include: { foodItem: true } } },
      }),
      prisma.waterTracking.findMany({
        where: { userId, logDate: { gte: dayStart, lte: dayEnd } },
      }),
    ])

    // Aggregate nutrition from all meal items
    const nutrition = {
      calories:      0, protein:  0, carbohydrates: 0,
      fat:           0, fiber:    0, sugar:  0,
      sodium:        0, cholesterol: 0, saturatedFat: 0,
      water:         0, mealCount: meals.length,
    }

    for (const meal of meals) {
      nutrition.calories      += meal.totalCalories
      nutrition.protein       += meal.totalProtein
      nutrition.carbohydrates += meal.totalCarbohydrates
      nutrition.fat           += meal.totalFat
      nutrition.fiber         += meal.totalFiber
      // Aggregate micronutrients from food items
      for (const item of meal.mealItems) {
        const ratio = item.quantity / item.foodItem.servingSize
        nutrition.sugar        += item.foodItem.sugar        * ratio
        nutrition.sodium       += item.foodItem.sodium       * ratio
        nutrition.cholesterol  += item.foodItem.cholesterol  * ratio
        nutrition.saturatedFat += item.foodItem.saturatedFat * ratio
      }
    }
    nutrition.water = waterEntries.reduce((s, w) => s + w.amount, 0)

    // Targets
    const targets = {
      calorieTarget: profile?.calorieTarget ?? undefined,
      proteinTarget: profile?.proteinTarget ?? undefined,
      carbTarget:    profile?.carbTarget    ?? undefined,
      fatTarget:     profile?.fatTarget     ?? undefined,
    }

    // Score it
    const conditionList = conditions.map(c => ({ condition: c.condition as string, severity: c.severity ?? undefined }))
    const scoring = calculateDailyScore(nutrition, targets, conditionList)

    // Build meal list for AI rec
    const mealList = meals.map(m => ({
      name:      m.mealItems[0]?.foodItem.name ?? 'Bữa ăn',
      calories:  m.totalCalories,
      mealType:  m.mealType,
    }))

    // AI recommendation (async, non-blocking for cache)
    let recommendation = scoring.summary
    try {
      recommendation = await recommendationService.getDailyRecommendation({
        userName:   'bạn',
        date,
        nutrition: {
          calories: nutrition.calories, protein: nutrition.protein,
          carbs: nutrition.carbohydrates, fat: nutrition.fat,
          fiber: nutrition.fiber, sugar: nutrition.sugar, sodium: nutrition.sodium,
        },
        targets:    { calories: targets.calorieTarget, protein: targets.proteinTarget },
        scoring,
        conditions: conditionList.map(c => c.condition),
        meals:      mealList,
      })
    } catch (err) {
      logger.warn('AI rec failed, using rule-based', err)
    }

    // Upsert daily analysis in DB
    const analysisData = {
      calories:      Math.round(nutrition.calories),
      protein:       Math.round(nutrition.protein  * 10) / 10,
      carbohydrates: Math.round(nutrition.carbohydrates * 10) / 10,
      fat:           Math.round(nutrition.fat      * 10) / 10,
      fiber:         Math.round(nutrition.fiber    * 10) / 10,
      sugar:         Math.round(nutrition.sugar    * 10) / 10,
      sodium:        Math.round(nutrition.sodium),
      cholesterol:   Math.round(nutrition.cholesterol),
      saturatedFat:  Math.round(nutrition.saturatedFat * 10) / 10,
      water:         Math.round(nutrition.water),
      calorieTarget: targets.calorieTarget ?? null,
      proteinTarget: targets.proteinTarget ?? null,
      carbTarget:    targets.carbTarget    ?? null,
      fatTarget:     targets.fatTarget     ?? null,
      overallScore:  scoring.scores.overall,
      calorieScore:  scoring.scores.calorie,
      proteinScore:  scoring.scores.protein,
      sugarScore:    scoring.scores.sugar,
      sodiumScore:   scoring.scores.sodium,
      fiberScore:    scoring.scores.fiber,
      diversityScore:scoring.scores.diversity,
      alerts:        scoring.alerts     as any,
      summary:       recommendation,
      mealCount:     meals.length,
    }

    await prisma.dailyAnalysis.upsert({
      where:  { userId_date: { userId, date: dayStart } },
      create: { userId, date: dayStart, ...analysisData },
      update: analysisData,
    })

    return {
      date,
      nutrition: {
        calories:      nutrition.calories,
        protein:       nutrition.protein,
        carbohydrates: nutrition.carbohydrates,
        fat:           nutrition.fat,
        fiber:         nutrition.fiber,
        sugar:         nutrition.sugar,
        sodium:        nutrition.sodium,
        cholesterol:   nutrition.cholesterol,
        saturatedFat:  nutrition.saturatedFat,
        water:         nutrition.water,
      },
      targets,
      scoring,
      recommendation,
      mealCount: meals.length,
      conditions: conditionList,
    }
  },

  /**
   * Generate weekly analysis for the last 7 days (or a given week).
   */
  async getWeeklyAnalysis(userId: string, weekStartDate?: string) {
    // Default: last 7 days
    const endDate   = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 6)

    if (weekStartDate) {
      const ws = new Date(weekStartDate)
      startDate.setTime(ws.getTime())
      endDate.setTime(ws.getTime())
      endDate.setDate(endDate.getDate() + 6)
    }

    // Fetch daily analyses for the week
    const [dailyAnalyses, profile, conditions] = await Promise.all([
      prisma.dailyAnalysis.findMany({
        where: { userId, date: { gte: startDate, lte: endDate } },
        orderBy: { date: 'asc' },
      }),
      prisma.healthProfile.findUnique({ where: { userId } }),
      prisma.userHealthCondition.findMany({ where: { userId } }),
    ])

    // Build DayNutrition array for analyzer
    const days: DayNutrition[] = []
    for (let i = 0; i <= 6; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      const ds = dateStr(d)
      const da = dailyAnalyses.find(a => dateStr(a.date) === ds)
      days.push({
        date:          ds,
        calories:      da?.calories      ?? 0,
        protein:       da?.protein       ?? 0,
        carbohydrates: da?.carbohydrates ?? 0,
        fat:           da?.fat           ?? 0,
        fiber:         da?.fiber         ?? 0,
        sugar:         da?.sugar         ?? 0,
        sodium:        da?.sodium        ?? 0,
        water:         da?.water         ?? 0,
        mealCount:     da?.mealCount     ?? 0,
        score:         da?.overallScore  ?? undefined,
      })
    }

    const insight = analyzeWeeklyTrends(days, {
      calorieTarget: profile?.calorieTarget ?? undefined,
      proteinTarget: profile?.proteinTarget ?? undefined,
    })

    // Averages
    const logged = days.filter(d => d.mealCount > 0)
    const avgNutrition = {
      calories: logged.reduce((s, d) => s + d.calories, 0) / (logged.length || 1),
      protein:  logged.reduce((s, d) => s + d.protein,  0) / (logged.length || 1),
      fiber:    logged.reduce((s, d) => s + d.fiber,    0) / (logged.length || 1),
      sodium:   logged.reduce((s, d) => s + d.sodium,   0) / (logged.length || 1),
      sugar:    logged.reduce((s, d) => s + d.sugar,    0) / (logged.length || 1),
    }

    const conditionList = conditions.map(c => c.condition as string)

    // AI weekly insight
    let aiInsight = ''
    try {
      aiInsight = await recommendationService.getWeeklyRecommendation({
        userName:    'bạn',
        weekLabel:   `${dateStr(startDate)} – ${dateStr(endDate)}`,
        insight,
        conditions:  conditionList,
        avgNutrition,
        targets: {
          calories: profile?.calorieTarget ?? undefined,
          protein:  profile?.proteinTarget ?? undefined,
        },
      })
    } catch (err) {
      logger.warn('Weekly AI insight failed', err)
    }

    // Save to DB
    await prisma.weeklyAnalysis.upsert({
      where:  { userId_weekStart: { userId, weekStart: startDate } },
      create: {
        userId, weekStart: startDate, weekEnd: endDate,
        avgCalories:     avgNutrition.calories,
        avgProtein:      avgNutrition.protein,
        avgFiber:        avgNutrition.fiber,
        avgSodium:       avgNutrition.sodium,
        avgSugar:        avgNutrition.sugar,
        daysLogged:      insight.daysLogged,
        streakDays:      insight.streakDays,
        avgOverallScore: insight.avgScore,
        trends:          insight.trends      as any,
        deficiencies:    insight.deficiencies as any,
        habits:          insight.habits       as any,
        aiInsight,
        aiInsightAt:     aiInsight ? new Date() : null,
      },
      update: {
        avgCalories:     avgNutrition.calories,
        avgProtein:      avgNutrition.protein,
        daysLogged:      insight.daysLogged,
        streakDays:      insight.streakDays,
        avgOverallScore: insight.avgScore,
        trends:          insight.trends      as any,
        deficiencies:    insight.deficiencies as any,
        habits:          insight.habits       as any,
        aiInsight:       aiInsight || undefined,
        aiInsightAt:     aiInsight ? new Date() : undefined,
        weekEnd:         endDate,
      },
    })

    return {
      weekStart:   dateStr(startDate),
      weekEnd:     dateStr(endDate),
      days,
      insight,
      avgNutrition,
      aiInsight,
      targets: {
        calories: profile?.calorieTarget,
        protein:  profile?.proteinTarget,
      },
    }
  },

  // ── User health conditions ──────────────────────────────────────────────────
  async getConditions(userId: string) {
    return prisma.userHealthCondition.findMany({ where: { userId } })
  },

  async upsertCondition(userId: string, condition: string, severity?: string) {
    return prisma.userHealthCondition.upsert({
      where:  { userId_condition: { userId, condition: condition as any } },
      create: { userId, condition: condition as any, severity },
      update: { severity },
    })
  },

  async removeCondition(userId: string, condition: string) {
    await prisma.userHealthCondition.deleteMany({
      where: { userId, condition: condition as any },
    })
  },
}
