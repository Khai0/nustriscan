import type { Prisma, HealthProfile } from '@prisma/client'
import { prisma } from '@config/database'

export const healthProfileRepository = {
  findByUserId: (userId: string): Promise<HealthProfile | null> =>
    prisma.healthProfile.findUnique({ where: { userId } }),

  create: (data: Prisma.HealthProfileCreateInput): Promise<HealthProfile> =>
    prisma.healthProfile.create({ data }),

  update: (userId: string, data: Prisma.HealthProfileUpdateInput): Promise<HealthProfile> =>
    prisma.healthProfile.update({ where: { userId }, data }),

  upsert: (
    userId: string,
    create: Prisma.HealthProfileCreateInput,
    update: Prisma.HealthProfileUpdateInput
  ): Promise<HealthProfile> =>
    prisma.healthProfile.upsert({
      where: { userId },
      create,
      update,
    }),
}
