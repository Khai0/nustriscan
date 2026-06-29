import type { JwtPayload } from '@nutriscan/shared-types'

// Augment Express Request globally so req.user is typed everywhere
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export {}
