import type { Meal, MealItem, Prisma } from '@prisma/client'
import { prisma } from '@config/database'
import { getSkip } from '@utils/pagination'

export type MealWithItems = Meal & {
  mealItems: (MealItem & { foodItem: { name: string } })[]
}

export const mealRepository = {
  findById: (id: string, userId: string): Promise<MealWithItems | null> =>
    prisma.meal.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        mealItems: {
          include: { foodItem: { select: { name: true } } },
        },
      },
    }),

  findByUserAndDate: (userId: string, date: Date): Promise<MealWithItems[]> =>
    prisma.meal.findMany({
      where: { userId, mealDate: date, deletedAt: null },
      include: {
        mealItems: {
          include: { foodItem: { select: { name: true } } },
        },
      },
      orderBy: { mealTime: 'asc' },
    }),

  findByUserAndDateRange: async (
    userId: string,
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number
  ): Promise<{ meals: MealWithItems[]; total: number }> => {
    const where: Prisma.MealWhereInput = {
      userId,
      deletedAt: null,
      mealDate: { gte: startDate, lte: endDate },
    }

    const [meals, total] = await prisma.$transaction([
      prisma.meal.findMany({
        where,
        include: {
          mealItems: {
            include: { foodItem: { select: { name: true } } },
          },
        },
        orderBy: [{ mealDate: 'desc' }, { mealTime: 'desc' }],
        skip: getSkip(page, limit),
        take: limit,
      }),
      prisma.meal.count({ where }),
    ])

    return { meals: meals as MealWithItems[], total }
  },

  create: (data: Prisma.MealCreateInput): Promise<MealWithItems> =>
    prisma.meal.create({
      data,
      include: {
        mealItems: {
          include: { foodItem: { select: { name: true } } },
        },
      },
    }) as Promise<MealWithItems>,

  update: (id: string, data: Prisma.MealUpdateInput): Promise<Meal> =>
    prisma.meal.update({ where: { id }, data }),

  softDelete: (id: string): Promise<Meal> =>
    prisma.meal.update({ where: { id }, data: { deletedAt: new Date() } }),

  recalculateTotals: async (mealId: string): Promise<Meal> => {
    const items = await prisma.mealItem.findMany({ where: { mealId } })
    const totals = items.reduce(
      (acc, item) => ({
        totalCalories: acc.totalCalories + item.calories,
        totalProtein: acc.totalProtein + item.protein,
        totalCarbohydrates: acc.totalCarbohydrates + item.carbohydrates,
        totalFat: acc.totalFat + item.fat,
        totalFiber: acc.totalFiber + item.fiber,
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbohydrates: 0, totalFat: 0, totalFiber: 0 }
    )
    return prisma.meal.update({ where: { id: mealId }, data: totals })
  },
}
