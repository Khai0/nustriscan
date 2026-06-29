import type { NextFunction, Request, Response } from 'express'
import { mealService } from '@services/meal.service'
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '@utils/response'

export const mealController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const meal = await mealService.create(req.user!.userId, req.body)
      sendCreated(res, meal, 'Đã ghi nhận bữa ăn')
    } catch (err) { next(err) }
  },

  async getDailySummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0]
      const summary = await mealService.getDailySummary(req.user!.userId, date)
      sendSuccess(res, summary, 'Tổng kết ngày')
    } catch (err) { next(err) }
  },

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await mealService.getMealHistory(req.user!.userId, req.query as any)
      sendPaginated(res, result.data, result.pagination, 'Lịch sử bữa ăn')
    } catch (err) { next(err) }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const meal = await mealService.getMealById(req.user!.userId, req.params.id)
      sendSuccess(res, meal)
    } catch (err) { next(err) }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await mealService.deleteMeal(req.user!.userId, req.params.id)
      sendNoContent(res)
    } catch (err) { next(err) }
  },
}
