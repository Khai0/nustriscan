import { weightTrackingRepository } from '@repositories/weight-tracking.repository'
import { healthProfileRepository } from '@repositories/health-profile.repository'
import { NotFoundError } from '@utils/errors'
import { calculateBMI } from '@utils/health-engine'
import type { CreateWeightTrackingDto, WeightQueryDto } from '@dto/weight/weight.dto'

export const weightTrackingService = {
  async logWeight(userId: string, dto: CreateWeightTrackingDto) {
    const profile = await healthProfileRepository.findByUserId(userId)

    // Tính BMI nếu có chiều cao trong hồ sơ
    let bmi: number | null = null
    if (profile) {
      const heightCm = profile.heightUnit === 'INCH'
        ? profile.height * 2.54
        : profile.height
      const weightKg = dto.weightUnit === 'LB'
        ? dto.weight * 0.453592
        : dto.weight
      bmi = calculateBMI(weightKg, heightCm).bmi
    }

    const logDate = new Date(dto.logDate)

    return weightTrackingRepository.upsert(userId, logDate, {
      weight: dto.weight,
      weightUnit: dto.weightUnit as any,
      notes: dto.notes ?? null,
      bodyFat: dto.bodyFat ?? null,
      muscleMass: dto.muscleMass ?? null,
      bmi,
    })
  },

  async getProgress(userId: string, query: WeightQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined
    const endDate = query.endDate ? new Date(query.endDate) : undefined

    const [history, profile] = await Promise.all([
      weightTrackingRepository.findByUserAndDateRange(
        userId, startDate, endDate, query.limit
      ),
      healthProfileRepository.findByUserId(userId),
    ])

    const latest = history[0]
    const oldest = history[history.length - 1]
    const totalChange = latest && oldest ? latest.weight - oldest.weight : null

    const targetWeight = profile?.targetWeight ?? null
    const startWeight = oldest?.weight ?? null
    const progressPercent = targetWeight && startWeight && latest
      ? Math.round(
          (Math.abs(latest.weight - startWeight) / Math.abs(targetWeight - startWeight)) * 100
        )
      : null

    return {
      currentWeight: latest?.weight ?? null,
      targetWeight,
      startWeight,
      totalChange,
      progressPercent,
      history: history.map(w => ({
        id: w.id,
        weight: w.weight,
        weightUnit: w.weightUnit,
        logDate: w.logDate.toISOString().split('T')[0],
        notes: w.notes,
        bodyFat: w.bodyFat,
        muscleMass: w.muscleMass,
        bmi: w.bmi,
        createdAt: w.createdAt.toISOString(),
      })),
    }
  },

  async deleteEntry(userId: string, entryId: string): Promise<void> {
    try {
      await weightTrackingRepository.delete(entryId, userId)
    } catch {
      throw new NotFoundError('Không tìm thấy bản ghi cân nặng')
    }
  },
}
