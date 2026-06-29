import rateLimit from 'express-rate-limit'
import { env } from '@config/env'
import { sendError } from '@utils/response'

export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max:      env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true, legacyHeaders: false,
  handler: (_req, res) => sendError(res, 'Quá nhiều yêu cầu, vui lòng thử lại sau.', 429),
})

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true, legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req, res) =>
    sendError(res, 'Quá nhiều lần thử đăng nhập. Vui lòng chờ 15 phút.', 429),
})

export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true, legacyHeaders: false,
  handler: (_req, res) =>
    sendError(res, 'Quá nhiều yêu cầu đặt lại mật khẩu. Thử lại sau 1 giờ.', 429),
})

export const resendVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true, legacyHeaders: false,
  handler: (_req, res) =>
    sendError(res, 'Vui lòng chờ trước khi gửi lại email xác minh.', 429),
})

export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true, legacyHeaders: false,
  handler: (_req, res) =>
    sendError(res, 'Giới hạn upload đạt. Vui lòng chờ trước khi tải lên tiếp.', 429),
})
