import type { Response } from 'express'
import { env, isDev } from '@config/env'

const ACCESS_COOKIE  = 'access_token'
const REFRESH_COOKIE = 'refresh_token'

const baseOptions = {
  httpOnly: true,
  secure:   env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none',
  domain:   isDev ? undefined : env.COOKIE_DOMAIN,
  path:     '/',
}

/** Gắn access + refresh token vào httpOnly cookie */
export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  rememberMe = false
): void {
  // Access token: 15 phút
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...baseOptions,
    maxAge: 15 * 60 * 1000,
  })

  // Refresh token: 7 ngày hoặc 30 ngày nếu rememberMe
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...baseOptions,
    maxAge: rememberMe
      ? 30 * 24 * 60 * 60 * 1000
      :  7 * 24 * 60 * 60 * 1000,
  })
}

/** Xoá tất cả auth cookies khi logout */
export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE,  { ...baseOptions })
  res.clearCookie(REFRESH_COOKIE, { ...baseOptions })
}

/** Đọc refresh token từ cookie hoặc body */
export function extractRefreshToken(
  req: { cookies?: Record<string, string>; body?: Record<string, string> }
): string | undefined {
  return req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken
}
