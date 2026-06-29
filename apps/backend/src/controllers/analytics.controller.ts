import type { NextFunction, Request, Response } from 'express'
import { analyticsService } from '@services/analytics/analytics.service'
import { gamificationService } from '@services/analytics/gamification.service'
import { sendSuccess } from '@utils/response'

const PERIOD_DAYS: Record<string, number> = { daily: 1, weekly: 7, monthly: 30 }

export const analyticsController = {
  async getPeriodSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = (req.query.type as 'daily' | 'weekly' | 'monthly') || 'weekly'
      const result = await analyticsService.getPeriodSummary(req.user!.userId, type)
      sendSuccess(res, result)
    } catch (err) { next(err) }
  },

  async getTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = (req.query.type as 'daily' | 'weekly' | 'monthly') || 'weekly'
      const days = PERIOD_DAYS[type] ?? 7
      const result = await analyticsService.getDailyPoints(req.user!.userId, days)
      sendSuccess(res, result)
    } catch (err) { next(err) }
  },

  async getMealFrequency(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = Number(req.query.days) || 7
      const result = await analyticsService.getMealFrequency(req.user!.userId, days)
      sendSuccess(res, result)
    } catch (err) { next(err) }
  },

  async getWeightTrend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = Number(req.query.days) || 30
      const result = await analyticsService.getWeightTrend(req.user!.userId, days)
      sendSuccess(res, result)
    } catch (err) { next(err) }
  },

  async getInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await analyticsService.getSmartInsights(req.user!.userId)
      sendSuccess(res, result)
    } catch (err) { next(err) }
  },

  async getStreak(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await gamificationService.updateStreak(req.user!.userId)
      const result = await analyticsService.getStreak(req.user!.userId)
      sendSuccess(res, result)
    } catch (err) { next(err) }
  },

  // ── Gamification ─────────────────────────────────────────────────────────────
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await gamificationService.getUserStats(req.user!.userId)
      sendSuccess(res, stats)
    } catch (err) { next(err) }
  },

  async getAchievements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check for new unlocks first
      const newUnlocks = await gamificationService.checkAchievements(req.user!.userId)
      const achievements = await gamificationService.getAchievements(req.user!.userId)
      sendSuccess(res, { achievements, newUnlocks })
    } catch (err) { next(err) }
  },

  async getChallenges(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const challenges = await gamificationService.getCurrentChallenge(req.user!.userId)
      sendSuccess(res, challenges)
    } catch (err) { next(err) }
  },
}
