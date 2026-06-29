import type { FoodItem, Prisma } from '@prisma/client'
import { prisma } from '@config/database'
import { getSkip } from '@utils/pagination'

export const foodItemRepository = {
  findById: (id: string): Promise<FoodItem | null> =>
    prisma.foodItem.findUnique({ where: { id } }),

  search: async (
    query: string | undefined,
    category: string | undefined,
    page: number,
    limit: number
  ): Promise<{ items: FoodItem[]; total: number }> => {
    const where: Prisma.FoodItemWhereInput = {
      isPublic: true,
      ...(category && { category: category as FoodItem['category'] }),
      ...(query && {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { nameEn: { contains: query, mode: 'insensitive' } },
        ],
      }),
    }

    const [items, total] = await prisma.$transaction([
      prisma.foodItem.findMany({
        where,
        orderBy: [{ isVerified: 'desc' }, { name: 'asc' }],
        skip: getSkip(page, limit),
        take: limit,
      }),
      prisma.foodItem.count({ where }),
    ])

    return { items, total }
  },

  create: (data: Prisma.FoodItemCreateInput): Promise<FoodItem> =>
    prisma.foodItem.create({ data }),

  update: (id: string, data: Prisma.FoodItemUpdateInput): Promise<FoodItem> =>
    prisma.foodItem.update({ where: { id }, data }),

  findManyByIds: (ids: string[]): Promise<FoodItem[]> =>
    prisma.foodItem.findMany({ where: { id: { in: ids } } }),
}
