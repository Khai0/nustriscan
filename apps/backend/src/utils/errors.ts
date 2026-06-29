// ============================================================
// Custom Error Classes (Phase 2)
// ============================================================

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.isOperational = isOperational
    Error.captureStackTrace(this)
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Yêu cầu không hợp lệ') { super(message, 400) }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Không được phép truy cập') { super(message, 401) }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Bị từ chối truy cập') { super(message, 403) }
}

export class NotFoundError extends AppError {
  constructor(message = 'Không tìm thấy') { super(message, 404) }
}

export class ConflictError extends AppError {
  constructor(message = 'Xung đột dữ liệu') { super(message, 409) }
}

export class UnprocessableEntityError extends AppError {
  constructor(message = 'Dữ liệu không thể xử lý') { super(message, 422) }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Quá nhiều yêu cầu') { super(message, 429) }
}

export class InternalServerError extends AppError {
  constructor(message = 'Lỗi máy chủ nội bộ') { super(message, 500, false) }
}
