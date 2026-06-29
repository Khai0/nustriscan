import type { NextFunction, Request, Response } from 'express'
import { scanService } from '@services/scan.service'
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '@utils/response'
import { BadRequestError } from '@utils/errors'
import type { ConfirmScanDto } from '@dto/scan/scan.dto'

export const scanController = {
  /**
   * POST /api/scans/analyze
   * Upload image → full AI pipeline → return matches
   */
  async analyzeImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) throw new BadRequestError('Không có file ảnh nào được tải lên')

      const imageBuffer = req.file.buffer  // Use memoryStorage for direct buffer access
      const result = await scanService.analyzeImage(
        req.user!.userId,
        imageBuffer,
        req.file.originalname
      )

      sendCreated(res, result, 'Phân tích ảnh thành công')
    } catch (err) { next(err) }
  },

  /**
   * POST /api/scans/:id/confirm
   * User confirms a matched food and creates a meal entry
   */
  async confirmScan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await scanService.confirmScan(
        req.user!.userId,
        req.params.id,
        req.body as ConfirmScanDto
      )
      sendCreated(res, result, `Đã lưu bữa ăn: ${result.confirmedFood}`)
    } catch (err) { next(err) }
  },

  /**
   * GET /api/scans/history
   */
  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page  = Number(req.query.page)  || 1
      const limit = Math.min(Number(req.query.limit) || 20, 50)
      const result = await scanService.getHistory(req.user!.userId, page, limit)
      sendPaginated(res, result.scans, result.pagination, 'Lịch sử quét ảnh')
    } catch (err) { next(err) }
  },

  /**
   * GET /api/scans/:id
   */
  async getScanById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const scan = await scanService.getScanById(req.user!.userId, req.params.id)
      sendSuccess(res, scan)
    } catch (err) { next(err) }
  },

  /**
   * DELETE /api/scans/:id
   */
  async deleteScan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await scanService.deleteScan(req.user!.userId, req.params.id)
      sendNoContent(res)
    } catch (err) { next(err) }
  },
}
