import { healthProfileRepository } from '@repositories/health-profile.repository'
import { weightTrackingRepository } from '@repositories/weight-tracking.repository'
import {
  calculateHealthMetrics,
  Gender,
  ActivityLevel,
  GoalType,
  calculateAgeFromBirthDate,
  lbToKg,
  inchToCm,
} from '@utils/health-engine'
import { NotFoundError } from '@utils/errors'
import type { CreateHealthProfileDto, UpdateHealthProfileDto } from '@dto/user/health-profile.dto'
import type { HealthProfile } from '@prisma/client'

export const healthProfileService = {
  async getByUserId(userId: string): Promise<HealthProfile> {
    const profile = await healthProfileRepository.findByUserId(userId)
    if (!profile) throw new NotFoundError('Chưa có hồ sơ sức khỏe. Vui lòng tạo mới.')
    return profile
  },

  async upsert(userId: string, dto: CreateHealthProfileDto): Promise<HealthProfile> {
    // Chuẩn hoá về kg + cm
    const weightKg = dto.weightUnit === 'LB' ? lbToKg(dto.weight) : dto.weight
    const heightCm = dto.heightUnit === 'INCH' ? inchToCm(dto.height) : dto.height
    const ageYears = calculateAgeFromBirthDate(new Date(dto.birthDate))

    // Tính toán health metrics
    const metrics = calculateHealthMetrics({
      gender: dto.gender as Gender,
      weightKg,
      heightCm,
      ageYears,
      activityLevel: dto.activityLevel as ActivityLevel,
      goalType: dto.goalType as GoalType,
    })

    const data = {
      gender: dto.gender as any,
      birthDate: new Date(dto.birthDate),
      height: dto.height,
      heightUnit: dto.heightUnit as any,
      weight: dto.weight,
      weightUnit: dto.weightUnit as any,
      targetWeight: dto.targetWeight ?? null,
      activityLevel: dto.activityLevel as any,
      goalType: dto.goalType as any,
      bmr: metrics.bmr,
      tdee: metrics.tdee,
      calorieTarget: metrics.calorieTarget,
      proteinTarget: metrics.macros.proteinG,
      carbTarget: metrics.macros.carbG,
      fatTarget: metrics.macros.fatG,
    }

    const profile = await healthProfileRepository.upsert(
      userId,
      { ...data, user: { connect: { id: userId } } },
      data
    )

    // Ghi nhận cân nặng ban đầu vào weight tracking
    const today = new Date(new Date().toISOString().split('T')[0])
    await weightTrackingRepository.upsert(userId, today, {
      weight: dto.weight,
      weightUnit: dto.weightUnit as any,
      bmi: metrics.weightStatus?.bmi ?? null,
    })

    return profile
  },

  async update(userId: string, dto: UpdateHealthProfileDto): Promise<HealthProfile> {
    const existing = await healthProfileRepository.findByUserId(userId)
    if (!existing) throw new NotFoundError('Chưa có hồ sơ sức khỏe.')

    // Merge với data hiện tại rồi tính lại
    const merged = { ...existing, ...dto }
    const weightKg =
      (merged.weightUnit === 'LB' ? lbToKg(merged.weight) : merged.weight)
    const heightCm =
      (merged.heightUnit === 'INCH' ? inchToCm(merged.height) : merged.height)
    const ageYears = calculateAgeFromBirthDate(
      dto.birthDate ? new Date(dto.birthDate) : existing.birthDate
    )

    const metrics = calculateHealthMetrics({
      gender: merged.gender as Gender,
      weightKg,
      heightCm,
      ageYears,
      activityLevel: merged.activityLevel as ActivityLevel,
      goalType: merged.goalType as GoalType,
    })

    return healthProfileRepository.update(userId, {
      ...dto,
      ...(dto.birthDate && { birthDate: new Date(dto.birthDate) }),
      bmr: metrics.bmr,
      tdee: metrics.tdee,
      calorieTarget: metrics.calorieTarget,
      proteinTarget: metrics.macros.proteinG,
      carbTarget: metrics.macros.carbG,
      fatTarget: metrics.macros.fatG,
    })
  },
}
