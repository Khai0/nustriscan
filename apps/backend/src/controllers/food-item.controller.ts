import type { NextFunction, Request, Response } from 'express'
import { foodItemService } from '@services/food-item.service'
import { sendSuccess, sendCreated, sendPaginated } from '@utils/response'

export const foodItemController = {
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await foodItemService.search(req.query as any)
      sendPaginated(res, result.data, result.pagination, 'Tìm kiếm thành công')
    } catch (err) { next(err) }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await foodItemService.findById(req.params.id)
      sendSuccess(res, item)
    } catch (err) { next(err) }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await foodItemService.create(req.body, req.user?.userId)
      sendCreated(res, item, 'Thêm thực phẩm thành công')
    } catch (err) { next(err) }
  },
}
