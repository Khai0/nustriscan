import type { NextFunction, Request, Response } from 'express'
import crypto from 'crypto'
import { env, isDev } from '@config/env'
import { ForbiddenError } from '@utils/errors'

const CSRF_HEADER = 'x-csrf-token'
const CSRF_COOKIE = 'csrf_token'
const CSRF_TOKEN_BYTES = 32

// Phương thức an toàn — không cần CSRF check
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

/**
 * Phát sinh CSRF token và gắn vào cookie.
 * Gọi sau khi user đăng nhập thành công.
 */
export function generateCsrfToken(res: Response): string {
  const token = crypto.randomBytes(CSRF_TOKEN_BYTES).toString('hex')
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,        // Client JS phải đọc được để gắn vào header
    secure:   env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE as any,
    domain:   isDev ? undefined : env.COOKIE_DOMAIN,
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 ngày
    path:     '/',
  })
  return token
}

/**
 * Xoá CSRF cookie khi logout.
 */
export function clearCsrfToken(res: Response): void {
  res.clearCookie(CSRF_COOKIE)
}

/**
 * Middleware: xác minh CSRF token trên các request thay đổi dữ liệu.
 * Skip trong môi trường test/dev nếu header không có.
 */
export function csrfProtection(req: Request, _res: Response, next: NextFunction): void {
  // Safe methods không cần check
  if (SAFE_METHODS.has(req.method)) { next(); return }

  // Trong dev — bỏ qua nếu không có cookie (Postman, curl)
  if (isDev && !req.cookies?.[CSRF_COOKIE]) { next(); return }

  const cookieToken  = req.cookies?.[CSRF_COOKIE] as string | undefined
  const headerToken  = req.headers[CSRF_HEADER] as string | undefined

  if (!cookieToken || !headerToken) {
    next(new ForbiddenError('CSRF token bị thiếu'))
    return
  }

  // So sánh constant-time để chống timing attack
  const a = Buffer.from(cookieToken,  'utf8')
  const b = Buffer.from(headerToken,  'utf8')

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    next(new ForbiddenError('CSRF token không hợp lệ'))
    return
  }

  next()
}
