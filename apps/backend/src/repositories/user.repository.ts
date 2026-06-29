import type { Prisma, User } from '@prisma/client'
import { prisma } from '@config/database'
import { env } from '@config/env'

export const userRepository = {
  findById: (id: string): Promise<User | null> =>
    prisma.user.findFirst({ where: { id, deletedAt: null } }),

  findByEmail: (email: string): Promise<User | null> =>
    prisma.user.findFirst({ where: { email, deletedAt: null } }),

  create: (data: Prisma.UserCreateInput): Promise<User> =>
    prisma.user.create({ data }),

  update: (id: string, data: Prisma.UserUpdateInput): Promise<User> =>
    prisma.user.update({ where: { id }, data }),

  softDelete: (id: string): Promise<User> =>
    prisma.user.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } }),

  // ── Account lockout ──────────────────────────────────────────────────────
  incrementFailedLogin: async (id: string): Promise<User> => {
    const user = await prisma.user.update({
      where: { id },
      data:  { failedLoginCount: { increment: 1 } },
    })

    // Khoá tài khoản nếu vượt ngưỡng
    if (user.failedLoginCount >= env.MAX_FAILED_LOGINS) {
      const lockedUntil = new Date(Date.now() + env.LOCKOUT_DURATION_MIN * 60 * 1000)
      return prisma.user.update({ where: { id }, data: { lockedUntil } })
    }

    return user
  },

  resetFailedLogin: (id: string, ip?: string): Promise<User> =>
    prisma.user.update({
      where: { id },
      data: {
        failedLoginCount: 0,
        lockedUntil:      null,
        lastLoginAt:      new Date(),
        lastLoginIp:      ip ?? null,
      },
    }),

  isLocked: (user: User): boolean =>
    !!(user.lockedUntil && user.lockedUntil > new Date()),

  // ── Email verification ───────────────────────────────────────────────────
  markEmailVerified: (id: string): Promise<User> =>
    prisma.user.update({
      where: { id },
      data:  { emailVerified: true, emailVerifiedAt: new Date() },
    }),

  // ── Password ─────────────────────────────────────────────────────────────
  updatePassword: (id: string, hashedPassword: string): Promise<User> =>
    prisma.user.update({ where: { id }, data: { password: hashedPassword } }),

  findMany: (args?: Prisma.UserFindManyArgs): Promise<User[]> =>
    prisma.user.findMany(args),
}
