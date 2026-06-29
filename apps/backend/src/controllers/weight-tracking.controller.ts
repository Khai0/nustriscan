import type { NextFunction, Request, Response } from 'express'
import { weightTrackingService } from '@services/weight-tracking.service'
import { sendSuccess, sendCreated, sendNoContent } from '@utils/response'

export const weightTrackingController = {
  async log(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await weightTrackingService.logWeight(req.user!.userId, req.body)
      sendCreated(res, entry, 'Đã ghi nhận cân nặng')
    } catch (err) { next(err) }
  },

  async getProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const progress = await weightTrackingService.getProgress(req.user!.userId, req.query as any)
      sendSuccess(res, progress, 'Tiến trình cân nặng')
    } catch (err) { next(err) }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await weightTrackingService.deleteEntry(req.user!.userId, req.params.id)
      sendNoContent(res)
    } catch (err) { next(err) }
  },
}
