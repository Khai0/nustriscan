import type { NextFunction, Request, Response } from 'express'
import { UnauthorizedError } from '@utils/errors'
import { verifyAccessToken, type JwtPayload } from '@utils/jwt'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

/** JWT từ Authorization header hoặc httpOnly cookie */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = extractToken(req)
    if (!token) throw new UnauthorizedError('Yêu cầu đăng nhập')
    req.user = verifyAccessToken(token)
    next()
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Phiên đăng nhập hết hạn'))
    } else if (err.name === 'JsonWebTokenError') {
      next(new UnauthorizedError('Token không hợp lệ'))
    } else {
      next(err)
    }
  }
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = extractToken(req)
    if (token) req.user = verifyAccessToken(token)
  } catch { /* ignore */ }
  next()
}

function extractToken(req: Request): string | null {
  // 1. Authorization: Bearer <token>
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  // 2. httpOnly cookie
  if (req.cookies?.access_token) {
    return req.cookies.access_token as string
  }
  return null
}
