import { waterTrackingRepository } from '@repositories/water-tracking.repository'
import { healthProfileRepository } from '@repositories/health-profile.repository'
import { NotFoundError } from '@utils/errors'
import { calculateWaterTarget } from '@utils/health-engine'
import type { CreateWaterTrackingDto } from '@dto/water/water.dto'
import type { WaterTracking } from '@prisma/client'

export const waterTrackingService = {
  async logWater(userId: string, dto: CreateWaterTrackingDto): Promise<WaterTracking> {
    return waterTrackingRepository.create({
      user: { connect: { id: userId } },
      amount: dto.amount,
      logDate: new Date(dto.logDate),
      logTime: dto.logTime ? new Date(dto.logTime) : null,
      notes: dto.notes ?? null,
    })
  },

  async getDailySummary(userId: string, dateStr: string) {
    const date = new Date(dateStr)
    const [entries, totalMl, profile] = await Promise.all([
      waterTrackingRepository.findByUserAndDate(userId, date),
      waterTrackingRepository.sumByDate(userId, date),
      healthProfileRepository.findByUserId(userId),
    ])

    // Tính nước khuyến nghị nếu có health profile
    let targetMl: number | null = null
    if (profile) {
      const weightKg = profile.weightUnit === 'LB'
        ? profile.weight * 0.453592
        : profile.weight
      targetMl = calculateWaterTarget(weightKg, profile.activityLevel as any)
    }

    const percentageReached = targetMl && targetMl > 0
      ? Math.round((totalMl / targetMl) * 100)
      : null

    return {
      date: dateStr,
      totalMl,
      targetMl,
      percentageReached,
      entries: entries.map(e => ({
        id: e.id,
        amount: e.amount,
        logDate: e.logDate.toISOString().split('T')[0],
        logTime: e.logTime?.toISOString() ?? null,
        notes: e.notes,
        createdAt: e.createdAt.toISOString(),
      })),
    }
  },

  async deleteEntry(userId: string, entryId: string): Promise<void> {
    try {
      await waterTrackingRepository.delete(entryId, userId)
    } catch {
      throw new NotFoundError('Không tìm thấy bản ghi nước uống')
    }
  },
}
