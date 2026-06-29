import type { NextFunction, Request, Response } from 'express'
import { analysisService } from '@services/analysis/analysis.service'
import { sendSuccess, sendNoContent } from '@utils/response'
import type { HealthConditionDto } from '@dto/analysis/analysis.dto'

export const analysisController = {
  async getDailyAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0]
      const result = await analysisService.getDailyAnalysis(req.user!.userId, date)
      sendSuccess(res, result, 'Phân tích dinh dưỡng ngày')
    } catch (err) { next(err) }
  },

  async getWeeklyAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const weekStart = req.query.weekStart as string | undefined
      const result = await analysisService.getWeeklyAnalysis(req.user!.userId, weekStart)
      sendSuccess(res, result, 'Phân tích dinh dưỡng tuần')
    } catch (err) { next(err) }
  },

  async getConditions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conditions = await analysisService.getConditions(req.user!.userId)
      sendSuccess(res, conditions)
    } catch (err) { next(err) }
  },

  async upsertCondition(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { condition, severity } = req.body as HealthConditionDto
      const result = await analysisService.upsertCondition(req.user!.userId, condition, severity)
      sendSuccess(res, result, 'Cập nhật tình trạng sức khoẻ')
    } catch (err) { next(err) }
  },

  async removeCondition(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await analysisService.removeCondition(req.user!.userId, req.params.condition)
      sendNoContent(res)
    } catch (err) { next(err) }
  },
}
