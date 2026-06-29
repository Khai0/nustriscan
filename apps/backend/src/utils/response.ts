// ============================================================
// Response Formatter (Phase 2 — full featured)
// ============================================================
import type { Response } from 'express'
import type { PaginationMeta } from './pagination'

// ─── Standard envelope ────────────────────────────────────────────────────────
export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
  errors?: unknown
  meta?: Record<string, unknown>
}

export interface PaginatedEnvelope<T> {
  success: boolean
  message: string
  data: T[]
  pagination: PaginationMeta
}

// ─── Success responses ────────────────────────────────────────────────────────
export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Thành công',
  statusCode = 200
): Response {
  const body: ApiEnvelope<T> = { success: true, message, data }
  return res.status(statusCode).json(body)
}

export function sendCreated<T>(res: Response, data: T, message = 'Tạo thành công'): Response {
  return sendSuccess(res, data, message, 201)
}

export function sendNoContent(res: Response): Response {
  return res.status(204).send()
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  message = 'Thành công'
): Response {
  const body: PaginatedEnvelope<T> = { success: true, message, data, pagination }
  return res.status(200).json(body)
}

// ─── Error responses ──────────────────────────────────────────────────────────
export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown
): Response {
  const body: ApiEnvelope<null> = { success: false, message, data: null, errors }
  return res.status(statusCode).json(body)
}

export function sendValidationError(
  res: Response,
  errors: unknown,
  message = 'Dữ liệu không hợp lệ'
): Response {
  return sendError(res, message, 422, errors)
}

export function sendUnauthorized(res: Response, message = 'Không có quyền truy cập'): Response {
  return sendError(res, message, 401)
}

export function sendForbidden(res: Response, message = 'Bị từ chối truy cập'): Response {
  return sendError(res, message, 403)
}

export function sendNotFound(res: Response, message = 'Không tìm thấy'): Response {
  return sendError(res, message, 404)
}
