import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { AppError } from '@utils/errors'
import { sendError, sendValidationError } from '@utils/response'
import { logger } from '@utils/logger'
import { isDev } from '@config/env'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // ── Zod validation errors ──────────────────────────────────────────────────
  if (err instanceof ZodError) {
    sendValidationError(res, err.flatten().fieldErrors)
    return
  }

  // ── Prisma known request errors ────────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        sendError(res, 'Dữ liệu đã tồn tại (vi phạm ràng buộc duy nhất)', 409)
        return
      case 'P2025':
        sendError(res, 'Không tìm thấy bản ghi', 404)
        return
      case 'P2003':
        sendError(res, 'Vi phạm ràng buộc khóa ngoại', 400)
        return
      case 'P2014':
        sendError(res, 'Quan hệ không hợp lệ', 400)
        return
      default:
        logger.error('Prisma error', { code: err.code, meta: err.meta })
        sendError(res, 'Lỗi cơ sở dữ liệu', 500)
        return
    }
  }

  // ── Prisma validation errors ───────────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientValidationError) {
    logger.error('Prisma validation error', { message: err.message })
    sendError(res, 'Dữ liệu không hợp lệ cho cơ sở dữ liệu', 400)
    return
  }

  // ── Operational application errors ────────────────────────────────────────
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(err.message, { stack: err.stack })
    }
    sendError(res, err.message, err.statusCode)
    return
  }

  // ── Multer file upload errors ─────────────────────────────────────────────
  if (err.name === 'MulterError') {
    const multerMsg: Record<string, string> = {
      LIMIT_FILE_SIZE: 'File quá lớn. Kích thước tối đa cho phép đã bị vượt quá.',
      LIMIT_FILE_COUNT: 'Quá nhiều file được tải lên.',
      LIMIT_UNEXPECTED_FILE: 'Trường file không mong đợi.',
    }
    const msg = multerMsg[(err as any).code] ?? 'Lỗi tải file lên'
    sendError(res, msg, 400)
    return
  }

  // ── JWT errors ────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Token không hợp lệ', 401)
    return
  }
  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token đã hết hạn', 401)
    return
  }

  // ── Unknown / programming errors ──────────────────────────────────────────
  logger.error('Lỗi không xử lý được', { message: err.message, stack: err.stack })
  const message = isDev ? err.message : 'Đã xảy ra lỗi không mong đợi. Vui lòng thử lại sau.'
  sendError(res, message, 500)
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Không tìm thấy route ${req.method} ${req.path}`, 404)
}
