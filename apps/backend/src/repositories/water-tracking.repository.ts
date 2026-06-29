import type { WaterTracking, Prisma } from '@prisma/client'
import { prisma } from '@config/database'

export const waterTrackingRepository = {
  findByUserAndDate: (userId: string, date: Date): Promise<WaterTracking[]> =>
    prisma.waterTracking.findMany({
      where: { userId, logDate: date },
      orderBy: { createdAt: 'asc' },
    }),

  findByUserAndDateRange: (
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WaterTracking[]> =>
    prisma.waterTracking.findMany({
      where: { userId, logDate: { gte: startDate, lte: endDate } },
      orderBy: { logDate: 'asc' },
    }),

  create: (data: Prisma.WaterTrackingCreateInput): Promise<WaterTracking> =>
    prisma.waterTracking.create({ data }),

  delete: (id: string, userId: string): Promise<WaterTracking> =>
    prisma.waterTracking.delete({ where: { id, userId } }),

  sumByDate: async (userId: string, date: Date): Promise<number> => {
    const result = await prisma.waterTracking.aggregate({
      where: { userId, logDate: date },
      _sum: { amount: true },
    })
    return result._sum.amount ?? 0
  },
}
