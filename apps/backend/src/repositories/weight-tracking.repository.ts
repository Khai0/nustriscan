import type { WeightTracking, Prisma } from '@prisma/client'
import { prisma } from '@config/database'

export const weightTrackingRepository = {
  findByUserAndDate: (userId: string, date: Date): Promise<WeightTracking | null> =>
    prisma.weightTracking.findUnique({
      where: { userId_logDate: { userId, logDate: date } },
    }),

  findLatestByUser: (userId: string): Promise<WeightTracking | null> =>
    prisma.weightTracking.findFirst({
      where: { userId },
      orderBy: { logDate: 'desc' },
    }),

  findByUserAndDateRange: async (
    userId: string,
    startDate: Date | undefined,
    endDate: Date | undefined,
    limit: number
  ): Promise<WeightTracking[]> => {
    const where: Prisma.WeightTrackingWhereInput = {
      userId,
      ...(startDate || endDate
        ? {
            logDate: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    }
    return prisma.weightTracking.findMany({
      where,
      orderBy: { logDate: 'desc' },
      take: limit,
    })
  },

  upsert: (
    userId: string,
    logDate: Date,
    data: Omit<Prisma.WeightTrackingCreateInput, 'user' | 'logDate'>
  ): Promise<WeightTracking> =>
    prisma.weightTracking.upsert({
      where: { userId_logDate: { userId, logDate } },
      create: { ...data, userId, logDate },
      update: data,
    }),

  delete: (id: string, userId: string): Promise<WeightTracking> =>
    prisma.weightTracking.delete({ where: { id, userId } }),
}
