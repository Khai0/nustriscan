import { prisma } from '@config/database'
import { logger } from '@utils/logger'

// ── Achievement definitions ───────────────────────────────────────────────────
export interface AchievementDef {
  id:          string
  type:        string
  title:       string
  description: string
  emoji:       string
  xp:          number
  rarity:      'common' | 'rare' | 'epic' | 'legendary'
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: 'FIRST_SCAN',       type: 'FIRST_SCAN',       title: 'Người khám phá',      description: 'Quét ảnh món ăn lần đầu tiên',             emoji: '📸', xp: 50,   rarity: 'common' },
  { id: 'SCAN_10',          type: 'SCAN_10',          title: 'Nghiện scan',          description: 'Quét 10 ảnh món ăn',                       emoji: '🔍', xp: 100,  rarity: 'common' },
  { id: 'SCAN_50',          type: 'SCAN_50',          title: 'Chuyên gia scan',      description: 'Quét 50 ảnh món ăn',                       emoji: '🏆', xp: 300,  rarity: 'rare' },
  { id: 'STREAK_7',         type: 'STREAK_7',         title: '7 ngày liên tiếp 🔥', description: 'Ghi nhận bữa ăn 7 ngày liên tiếp',         emoji: '🔥', xp: 200,  rarity: 'common' },
  { id: 'STREAK_30',        type: 'STREAK_30',        title: 'Kiên trì tháng',       description: 'Ghi nhận bữa ăn 30 ngày liên tiếp',        emoji: '💎', xp: 500,  rarity: 'rare' },
  { id: 'STREAK_100',       type: 'STREAK_100',       title: 'Huyền thoại 💫',       description: '100 ngày không nghỉ',                       emoji: '🌟', xp: 2000, rarity: 'legendary' },
  { id: 'PROTEIN_MASTER',   type: 'PROTEIN_MASTER',   title: 'Protein Master 💪',    description: 'Đạt mục tiêu protein 5 ngày liên tiếp',    emoji: '💪', xp: 300,  rarity: 'rare' },
  { id: 'HEALTHY_WEEK',     type: 'HEALTHY_WEEK',     title: 'Tuần lành mạnh',       description: 'Điểm sức khoẻ >= 80 mỗi ngày trong 7 ngày', emoji: '🥗', xp: 400,  rarity: 'rare' },
  { id: 'FIBER_CHAMPION',   type: 'FIBER_CHAMPION',   title: 'Chất xơ champion',     description: 'Đạt mục tiêu chất xơ 7 ngày liên tiếp',   emoji: '🥦', xp: 250,  rarity: 'rare' },
  { id: 'HYDRATION_HERO',   type: 'HYDRATION_HERO',   title: 'Hydration Hero 💧',    description: 'Đạt mục tiêu nước 7 ngày liên tiếp',       emoji: '💧', xp: 250,  rarity: 'common' },
  { id: 'CALORIE_CONTROL',  type: 'CALORIE_CONTROL',  title: 'Kiểm soát calo',       description: 'Trong vùng calo 5 ngày liên tiếp',          emoji: '⚖️', xp: 300,  rarity: 'rare' },
  { id: 'PERFECT_DAY',      type: 'PERFECT_DAY',      title: 'Ngày hoàn hảo ✨',     description: 'Đạt 100 điểm sức khoẻ trong một ngày',      emoji: '✨', xp: 500,  rarity: 'epic' },
  { id: 'WEIGHT_GOAL',      type: 'WEIGHT_GOAL',      title: 'Đạt mục tiêu cân!',    description: 'Đạt cân nặng mục tiêu đã đặt ra',           emoji: '🎯', xp: 1000, rarity: 'epic' },
]

// ── Weekly challenge templates ─────────────────────────────────────────────────
export interface ChallengeDef {
  id:          string
  title:       string
  description: string
  emoji:       string
  targetValue: number
  unit:        string
  metric:      string
  rewardXp:    number
}

export const CHALLENGE_POOL: ChallengeDef[] = [
  { id: 'protein_week',     title: 'Protein Tuần',       description: 'Đạt mục tiêu protein mỗi ngày trong tuần',   emoji: '💪', targetValue: 7,    unit: 'ngày',  metric: 'protein_days',  rewardXp: 300 },
  { id: 'fiber_week',       title: 'Chất xơ xanh',       description: 'Đạt 25g chất xơ mỗi ngày trong tuần',        emoji: '🥦', targetValue: 7,    unit: 'ngày',  metric: 'fiber_days',    rewardXp: 250 },
  { id: 'hydration_week',   title: 'Nước 7 ngày',         description: 'Uống đủ 2L nước mỗi ngày trong tuần',        emoji: '💧', targetValue: 7,    unit: 'ngày',  metric: 'water_days',    rewardXp: 200 },
  { id: 'score_challenge',  title: 'Điểm 75+',            description: 'Đạt điểm sức khoẻ >= 75 mỗi ngày',           emoji: '⭐', targetValue: 5,    unit: 'ngày',  metric: 'score_days',    rewardXp: 350 },
  { id: 'sodium_control',   title: 'Ăn nhạt',             description: 'Giữ natri < 2000mg mỗi ngày trong 5 ngày',   emoji: '🧂', targetValue: 5,    unit: 'ngày',  metric: 'sodium_days',   rewardXp: 280 },
  { id: 'no_sugar_spike',   title: 'Kiểm soát đường',     description: 'Giữ đường < 40g mỗi ngày trong 5 ngày',      emoji: '🚫', targetValue: 5,    unit: 'ngày',  metric: 'sugar_days',    rewardXp: 300 },
  { id: 'calorie_range',    title: 'Cân bằng calo',       description: 'Ở trong vùng 90-110% mục tiêu calo 5 ngày',  emoji: '🎯', targetValue: 5,    unit: 'ngày',  metric: 'calorie_days',  rewardXp: 320 },
  { id: 'log_every_day',    title: 'Không nghỉ',          description: 'Ghi nhận bữa ăn tất cả 7 ngày trong tuần',   emoji: '📝', targetValue: 7,    unit: 'ngày',  metric: 'logged_days',   rewardXp: 400 },
]

// ── XP / Level system ─────────────────────────────────────────────────────────
export function xpToLevel(xp: number): number {
  // Level = floor(1 + sqrt(xp / 100))
  return Math.floor(1 + Math.sqrt(xp / 100))
}

export function levelToXpRequired(level: number): number {
  return Math.pow(level - 1, 2) * 100
}

export function nextLevelXp(xp: number): { current: number; needed: number; level: number } {
  const level   = xpToLevel(xp)
  const needed  = levelToXpRequired(level + 1)
  return { current: xp, needed, level }
}

// ── Gamification service ───────────────────────────────────────────────────────
export const gamificationService = {
  // ── Get user stats ──────────────────────────────────────────────────────────
  async getUserStats(userId: string) {
    const stats = await prisma.userStats.findUnique({ where: { userId } })
    if (!stats) {
      // Create defaults
      return prisma.userStats.create({
        data: { userId, totalXp: 0, level: 1, currentStreak: 0, longestStreak: 0 },
      })
    }
    return stats
  },

  // ── Award XP and update level ───────────────────────────────────────────────
  async awardXp(userId: string, xp: number): Promise<{ newXp: number; newLevel: number; leveledUp: boolean }> {
    const stats = await gamificationService.getUserStats(userId)
    const newXp    = stats.totalXp + xp
    const oldLevel = stats.level
    const newLevel = xpToLevel(newXp)

    await prisma.userStats.update({
      where: { userId },
      data:  { totalXp: newXp, level: newLevel, updatedAt: new Date() },
    })

    return { newXp, newLevel, leveledUp: newLevel > oldLevel }
  },

  // ── Check & unlock achievements ─────────────────────────────────────────────
  async checkAchievements(userId: string): Promise<AchievementDef[]> {
    const [stats, existingAchievements, scanCount, profile] = await Promise.all([
      gamificationService.getUserStats(userId),
      prisma.userAchievement.findMany({ where: { userId }, select: { achievement: true } }),
      prisma.foodScan.count({ where: { userId } }),
      prisma.healthProfile.findUnique({ where: { userId } }),
    ])

    const unlocked = new Set(existingAchievements.map(a => a.achievement))
    const toUnlock: AchievementDef[] = []

    // Check each achievement
    const checks: Array<{ type: string; condition: boolean }> = [
      { type: 'FIRST_SCAN',      condition: scanCount >= 1 },
      { type: 'SCAN_10',         condition: scanCount >= 10 },
      { type: 'SCAN_50',         condition: scanCount >= 50 },
      { type: 'STREAK_7',        condition: stats.currentStreak >= 7 },
      { type: 'STREAK_30',       condition: stats.currentStreak >= 30 },
      { type: 'STREAK_100',      condition: stats.currentStreak >= 100 },
    ]

    // Check score-based achievements from last 7 days
    const analyses = await prisma.dailyAnalysis.findMany({
      where:   { userId, date: { gte: new Date(Date.now() - 7 * 86400000) }, mealCount: { gt: 0 } },
      orderBy: { date: 'desc' },
    })

    const perfectDay = analyses.some(a => (a.overallScore ?? 0) >= 99)
    checks.push({ type: 'PERFECT_DAY', condition: perfectDay })

    const healthyWeek = analyses.length >= 7 && analyses.every(a => (a.overallScore ?? 0) >= 80)
    checks.push({ type: 'HEALTHY_WEEK', condition: healthyWeek })

    // Protein target hit 5 days in a row
    if (profile?.proteinTarget) {
      const proteinStreak = analyses
        .slice(0, 5)
        .filter(a => a.protein >= profile.proteinTarget! * 0.9).length
      checks.push({ type: 'PROTEIN_MASTER', condition: proteinStreak >= 5 })
    }

    // Weight goal
    if (profile?.targetWeight) {
      const latest = await prisma.weightTracking.findFirst({
        where:   { userId },
        orderBy: { logDate: 'desc' },
      })
      if (latest) {
        const goalReached = Math.abs(latest.weight - profile.targetWeight) <= 0.5
        checks.push({ type: 'WEIGHT_GOAL', condition: goalReached })
      }
    }

    // Unlock qualifying achievements
    for (const check of checks) {
      if (check.condition && !unlocked.has(check.type as any)) {
        const def = ACHIEVEMENT_DEFS.find(d => d.type === check.type)
        if (!def) continue

        await prisma.userAchievement.create({
          data: { userId, achievement: check.type as any, progress: 100 },
        })
        await gamificationService.awardXp(userId, def.xp)
        toUnlock.push(def)
        logger.info(`Achievement unlocked: ${check.type} for user ${userId}`)
      }
    }

    return toUnlock
  },

  // ── Get all achievements with unlock status ─────────────────────────────────
  async getAchievements(userId: string) {
    const unlocked = await prisma.userAchievement.findMany({
      where:   { userId },
      orderBy: { unlockedAt: 'desc' },
    })
    const unlockedMap = new Map(unlocked.map(u => [u.achievement as string, u]))

    return ACHIEVEMENT_DEFS.map(def => ({
      ...def,
      unlocked:   unlockedMap.has(def.type),
      unlockedAt: unlockedMap.get(def.type)?.unlockedAt?.toISOString() ?? null,
      progress:   unlockedMap.get(def.type)?.progress ?? 0,
    }))
  },

  // ── Weekly challenges ───────────────────────────────────────────────────────
  async getCurrentChallenge(userId: string) {
    const monday = new Date()
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
    monday.setHours(0, 0, 0, 0)

    // Pick 3 challenges for this week (deterministic based on week number)
    const weekNumber = Math.floor(monday.getTime() / (7 * 86400000))
    const pool       = [...CHALLENGE_POOL]
    const selected   = [0, 1, 2].map(i => pool[(weekNumber + i) % pool.length])

    // Upsert challenges for this week
    const challenges = await Promise.all(
      selected.map(async def => {
        const existing = await prisma.weeklyChallenge.findUnique({
          where: { userId_weekStart_challengeId: { userId, weekStart: monday, challengeId: def.id } },
        })
        if (existing) return existing

        return prisma.weeklyChallenge.create({
          data: {
            userId,
            weekStart:   monday,
            challengeId: def.id,
            title:       def.title,
            description: def.description,
            targetValue: def.targetValue,
            rewardXp:    def.rewardXp,
          },
        })
      })
    )

    // Update progress for each challenge
    const analyses = await prisma.dailyAnalysis.findMany({
      where:   { userId, date: { gte: monday }, mealCount: { gt: 0 } },
    })
    const profile = await prisma.healthProfile.findUnique({ where: { userId } })

    for (const challenge of challenges) {
      if (challenge.completed) continue

      const def = CHALLENGE_POOL.find(d => d.id === challenge.challengeId)
      if (!def) continue

      let currentValue = 0
      switch (def.metric) {
        case 'protein_days':
          currentValue = profile?.proteinTarget
            ? analyses.filter(a => a.protein >= profile.proteinTarget! * 0.9).length
            : 0
          break
        case 'fiber_days':
          currentValue = analyses.filter(a => a.fiber >= 25).length
          break
        case 'water_days':
          currentValue = analyses.filter(a => a.water >= 2000).length
          break
        case 'score_days':
          currentValue = analyses.filter(a => (a.overallScore ?? 0) >= 75).length
          break
        case 'sodium_days':
          currentValue = analyses.filter(a => a.sodium <= 2000).length
          break
        case 'sugar_days':
          currentValue = analyses.filter(a => a.sugar <= 40).length
          break
        case 'calorie_days':
          currentValue = profile?.calorieTarget
            ? analyses.filter(a => {
                const pct = a.calories / profile.calorieTarget!
                return pct >= 0.9 && pct <= 1.1
              }).length
            : 0
          break
        case 'logged_days':
          currentValue = analyses.length
          break
      }

      const completed = currentValue >= challenge.targetValue
      await prisma.weeklyChallenge.update({
        where: { id: challenge.id },
        data: {
          currentValue,
          completed,
          completedAt: completed && !challenge.completed ? new Date() : undefined,
        },
      })

      // Award XP on first completion
      if (completed && !challenge.completed) {
        await gamificationService.awardXp(userId, challenge.rewardXp)
        logger.info(`Challenge completed: ${challenge.challengeId} for ${userId}`)
      }
    }

    return prisma.weeklyChallenge.findMany({
      where:   { userId, weekStart: monday },
      orderBy: { challengeId: 'asc' },
    })
  },

  // ── Update streak ───────────────────────────────────────────────────────────
  async updateStreak(userId: string): Promise<void> {
    const analyses = await prisma.dailyAnalysis.findMany({
      where:   { userId, mealCount: { gt: 0 } },
      orderBy: { date: 'desc' },
      take:    100,
      select:  { date: true },
    })

    let current = 0
    let prev    = new Date()
    prev.setHours(0, 0, 0, 0)

    for (const a of analyses) {
      const d = new Date(a.date)
      d.setHours(0, 0, 0, 0)
      const diff = Math.round((prev.getTime() - d.getTime()) / 86400000)
      if (diff <= 1) { current++; prev = d }
      else break
    }

    const stats = await gamificationService.getUserStats(userId)
    await prisma.userStats.update({
      where: { userId },
      data: {
        currentStreak: current,
        longestStreak: Math.max(stats.longestStreak, current),
        lastLoggedAt:  analyses[0]?.date ?? undefined,
        totalMealsLogged: await prisma.meal.count({ where: { userId, deletedAt: null } }),
        totalScans:    await prisma.foodScan.count({ where: { userId } }),
        updatedAt:     new Date(),
      },
    })
  },
}
