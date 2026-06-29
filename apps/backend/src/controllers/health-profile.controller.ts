import type { NextFunction, Request, Response } from 'express'
import { healthProfileService } from '@services/health-profile.service'
import { sendSuccess, sendCreated } from '@utils/response'

export const healthProfileController = {
  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await healthProfileService.getByUserId(req.user!.userId)
      sendSuccess(res, profile, 'Lấy hồ sơ sức khỏe thành công')
    } catch (err) { next(err) }
  },

  async upsert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await healthProfileService.upsert(req.user!.userId, req.body)
      sendCreated(res, profile, 'Hồ sơ sức khỏe đã được lưu')
    } catch (err) { next(err) }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await healthProfileService.update(req.user!.userId, req.body)
      sendSuccess(res, profile, 'Cập nhật hồ sơ thành công')
    } catch (err) { next(err) }
  },
}
