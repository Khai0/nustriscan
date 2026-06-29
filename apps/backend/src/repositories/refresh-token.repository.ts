import type { RefreshToken } from '@prisma/client'
import { prisma } from '@config/database'

export const refreshTokenRepository = {
  create: (data: {
    userId: string
    token: string
    expiresAt: Date
    userAgent?: string
    ipAddress?: string
  }): Promise<RefreshToken> =>
    prisma.refreshToken.create({ data }),

  findByToken: (token: string): Promise<RefreshToken | null> =>
    prisma.refreshToken.findUnique({ where: { token } }),

  revoke: (token: string): Promise<RefreshToken> =>
    prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true },
    }),

  revokeAllForUser: (userId: string): Promise<{ count: number }> =>
    prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    }),

  deleteExpired: (): Promise<{ count: number }> =>
    prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    }),

  isValidToken: async (token: string): Promise<boolean> => {
    const rt = await prisma.refreshToken.findUnique({ where: { token } })
    if (!rt) return false
    if (rt.isRevoked) return false
    if (rt.expiresAt < new Date()) return false
    return true
  },
}
