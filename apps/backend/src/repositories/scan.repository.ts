import type { Prisma, FoodScan } from '@prisma/client'
import { prisma } from '@config/database'

export const scanRepository = {
  findById: (id: string, userId: string): Promise<FoodScan | null> =>
    prisma.foodScan.findFirst({ where: { id, userId } }),

  findManyByUser: async (
    userId: string,
    page: number,
    limit: number
  ): Promise<{ scans: FoodScan[]; total: number }> => {
    const skip = (page - 1) * limit
    const [scans, total] = await prisma.$transaction([
      prisma.foodScan.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.foodScan.count({ where: { userId } }),
    ])
    return { scans, total }
  },

  create: (data: Prisma.FoodScanCreateInput): Promise<FoodScan> =>
    prisma.foodScan.create({ data }),

  delete: (id: string, userId: string): Promise<FoodScan> =>
    prisma.foodScan.delete({ where: { id, userId } }),
}