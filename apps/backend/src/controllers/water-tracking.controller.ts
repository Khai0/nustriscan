import type { NextFunction, Request, Response } from 'express'
import { waterTrackingService } from '@services/water-tracking.service'
import { sendSuccess, sendCreated, sendNoContent } from '@utils/response'

export const waterTrackingController = {
  async log(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await waterTrackingService.logWater(req.user!.userId, req.body)
      sendCreated(res, entry, 'Đã ghi nhận lượng nước')
    } catch (err) { next(err) }
  },

  async getDailySummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0]
      const summary = await waterTrackingService.getDailySummary(req.user!.userId, date)
      sendSuccess(res, summary, 'Tổng kết nước uống')
    } catch (err) { next(err) }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await waterTrackingService.deleteEntry(req.user!.userId, req.params.id)
      sendNoContent(res)
    } catch (err) { next(err) }
  },
}
