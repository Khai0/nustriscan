import type { Prisma, Scan } from '@prisma/client'
import { prisma } from '@config/database'

export const scanRepository = {
  findById: (id: string, userId: string): Promise<Scan | null> =>
    prisma.scan.findFirst({ where: { id, userId } }),

  findManyByUser: async (
    userId: string,
    page: number,
    limit: number
  ): Promise<{ scans: Scan[]; total: number }> => {
    const skip = (page - 1) * limit
    const [scans, total] = await prisma.$transaction([
      prisma.scan.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.scan.count({ where: { userId } }),
    ])
    return { scans, total }
  },

  create: (data: Prisma.ScanCreateInput): Promise<Scan> =>
    prisma.scan.create({ data }),

  delete: (id: string, userId: string): Promise<Scan> =>
    prisma.scan.delete({ where: { id, userId } }),
}
