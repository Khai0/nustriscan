import type { NextFunction, Request, Response } from 'express'
import { ForbiddenError, UnauthorizedError } from '@utils/errors'

type Role = 'USER' | 'ADMIN'

/**
 * Kiểm tra role người dùng.
 * Phải dùng sau middleware `authenticate`.
 *
 * @example
 * router.get('/admin/users', authenticate, requireRole('ADMIN'), handler)
 * router.get('/data',        authenticate, requireRole('USER', 'ADMIN'), handler)
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Yêu cầu đăng nhập'))
      return
    }

    const userRole = req.user.role as Role
    if (!roles.includes(userRole)) {
      next(new ForbiddenError(`Tính năng này yêu cầu quyền: ${roles.join(' hoặc ')}`))
      return
    }

    next()
  }
}

/** Shorthand — chỉ ADMIN */
export const requireAdmin = requireRole('ADMIN')

/** Shorthand — USER hoặc ADMIN */
export const requireUser = requireRole('USER', 'ADMIN')

/**
 * Kiểm tra user chỉ có thể thao tác trên resource của chính mình
 * (trừ ADMIN có thể làm bất cứ điều gì).
 */
export function requireOwnerOrAdmin(getUserId: (req: Request) => string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Yêu cầu đăng nhập'))
      return
    }
    const targetUserId = getUserId(req)
    if (req.user.role !== 'ADMIN' && req.user.userId !== targetUserId) {
      next(new ForbiddenError('Bạn không có quyền thao tác tài nguyên này'))
      return
    }
    next()
  }
}
