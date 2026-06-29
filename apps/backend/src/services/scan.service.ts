import fs from 'fs/promises'
import { prisma } from '@config/database'
import { AIProviderFactory } from './ai/ai-provider.factory'
import { getStorageService } from './storage/cloudinary.service'
import { FoodMatchingEngine } from '@utils/food-matching/food-matcher'
import { NotFoundError, BadRequestError } from '@utils/errors'
import { buildPaginationMeta } from '@utils/pagination'
import { logger } from '@utils/logger'
import { env } from '@config/env'
import type { FoodMatchResult } from '@utils/food-matching/food-matcher'

// ── Serving size presets ────────────────────────────────────────────────────────
export const SERVING_PRESETS = {
  small:  0.6,   // 60% of standard serving
  medium: 1.0,   // Standard serving
  large:  1.5,   // 150% of standard serving
} as const
export type ServingPreset = keyof typeof SERVING_PRESETS

const matcher = new FoodMatchingEngine()

// ── Main scan pipeline ──────────────────────────────────────────────────────────
export const scanService = {
  /**
   * Full pipeline:
   * Upload image → Store in Cloudinary → Run AI detection → Match foods
   */
  async analyzeImage(
    userId: string,
    imageBuffer: Buffer,
    _originalName: string
  ) {
    // 1. Create scan record (status: UPLOADING)
    const scan = await prisma.foodScan.create({
      data: { userId, imageUrl: '', imagePublicId: '', status: 'UPLOADING' },
    })

    try {
      // 2. Upload to Cloudinary (or local fallback)
      const storage = getStorageService()
      const stored  = await storage.uploadImage(imageBuffer, userId)

      await prisma.foodScan.update({
        where: { id: scan.id },
        data: {
          imageUrl:       stored.url,
          imagePublicId:  stored.publicId,
          imageThumbnail: stored.thumbnailUrl,
          status:         'PROCESSING',
        },
      })

      // 3. Run AI detection
      const aiProvider = AIProviderFactory.getProvider()
      const aiResult   = await aiProvider.detectLabels(imageBuffer, {
        maxLabels:           env.AI_MAX_LABELS,
        confidenceThreshold: env.AI_CONFIDENCE_THRESHOLD,
      })

      await prisma.foodScan.update({
        where: { id: scan.id },
        data: {
          rawLabels:    aiResult.labels    as any,
          rawResponse:  aiResult.rawResponse as any,
          aiProvider:   aiResult.provider,
          processingMs: aiResult.processingMs,
          status:       'MATCHING',
        },
      })

      // 4. Match foods
      const matchStart   = Date.now()
      const matchedFoods = await matcher.matchFoods(aiResult.labels, 5)
      const matchingMs   = Date.now() - matchStart

      const topMatch = matchedFoods[0]

      // 5. Save final result
      const finalScan = await prisma.foodScan.update({
        where: { id: scan.id },
        data: {
          matchedFoods:   matchedFoods as any,
          topFoodItemId:  topMatch?.foodItemId ?? null,
          topFoodName:    topMatch?.foodName   ?? null,
          topConfidence:  topMatch?.confidence ?? null,
          matchingMs,
          status:         'COMPLETED',
        },
      })

      return {
        scanId:       finalScan.id,
        imageUrl:     finalScan.imageUrl,
        thumbnail:    finalScan.imageThumbnail,
        status:       finalScan.status,
        aiProvider:   finalScan.aiProvider,
        processingMs: finalScan.processingMs,
        matchingMs,
        matchedFoods,
        topMatch,
        labels: aiResult.labels,
      }
    } catch (err: any) {
      // Mark scan as failed
      await prisma.foodScan.update({
        where: { id: scan.id },
        data: { status: 'FAILED', errorMessage: err.message ?? 'Unknown error' },
      })
      logger.error('Scan pipeline failed', { scanId: scan.id, error: err.message })
      throw err
    }
  },

  /**
   * User confirms a scan result and creates a Meal entry.
   */
  async confirmScan(
    userId: string,
    scanId: string,
    confirmation: {
      foodItemId:  string
      mealType:    'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
      mealDate:    string
      servingPreset?: ServingPreset
      customGrams?: number
      notes?:      string
    }
  ) {
    const scan = await prisma.foodScan.findFirst({ where: { id: scanId, userId } })
    if (!scan) throw new NotFoundError('Scan không tìm thấy')
    if (scan.status !== 'COMPLETED') throw new BadRequestError('Scan chưa hoàn thành')

    const foodItem = await prisma.foodItem.findUnique({ where: { id: confirmation.foodItemId } })
    if (!foodItem) throw new NotFoundError('Không tìm thấy thực phẩm')

    // Calculate actual quantity
    let quantity: number
    if (confirmation.customGrams) {
      quantity = confirmation.customGrams
    } else {
      const multiplier = SERVING_PRESETS[confirmation.servingPreset ?? 'medium']
      quantity = foodItem.servingSize * multiplier
    }

    const ratio = quantity / foodItem.servingSize
    const calories      = Math.round(foodItem.calories      * ratio * 10) / 10
    const protein       = Math.round(foodItem.protein       * ratio * 10) / 10
    const carbohydrates = Math.round(foodItem.carbohydrates * ratio * 10) / 10
    const fat           = Math.round(foodItem.fat           * ratio * 10) / 10
    const fiber         = Math.round(foodItem.fiber         * ratio * 10) / 10

    const mealDate = new Date(confirmation.mealDate)

    // Create Meal with single MealItem
    const meal = await prisma.meal.create({
      data: {
        userId,
        mealType:            confirmation.mealType as any,
        mealDate,
        notes:               confirmation.notes ?? `Quét AI: ${foodItem.name}`,
        totalCalories:       calories,
        totalProtein:        protein,
        totalCarbohydrates:  carbohydrates,
        totalFat:            fat,
        totalFiber:          fiber,
        mealItems: {
          create: [{
            foodItemId:    foodItem.id,
            quantity,
            unit:          foodItem.servingUnit,
            calories,
            protein,
            carbohydrates,
            fat,
            fiber,
          }],
        },
      },
      include: {
        mealItems: { include: { foodItem: { select: { name: true } } } },
      },
    })

    // Link scan to confirmed meal
    await prisma.foodScan.update({
      where: { id: scanId },
      data:  { confirmedMealId: meal.id },
    })

    return {
      meal,
      scanId,
      confirmedFood: foodItem.name,
      quantity,
      unit:  foodItem.servingUnit,
      nutrition: { calories, protein, carbohydrates, fat, fiber },
    }
  },

  /**
   * Get scan history for a user.
   */
  async getHistory(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit
    const [scans, total] = await prisma.$transaction([
      prisma.foodScan.findMany({
        where:   { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take:    limit,
        select: {
          id: true, imageUrl: true, imageThumbnail: true,
          status: true, topFoodName: true, topConfidence: true,
          aiProvider: true, processingMs: true, createdAt: true,
          confirmedMealId: true,
        },
      }),
      prisma.foodScan.count({ where: { userId } }),
    ])

    return { scans, pagination: buildPaginationMeta(page, limit, total) }
  },

  /**
   * Get a single scan by ID.
   */
  async getScanById(userId: string, scanId: string) {
    const scan = await prisma.foodScan.findFirst({
      where: { id: scanId, userId },
      include: { topFood: { select: { id: true, name: true, nameEn: true, calories: true, protein: true, carbohydrates: true, fat: true, fiber: true, servingSize: true, servingUnit: true } } },
    })
    if (!scan) throw new NotFoundError('Scan không tìm thấy')
    return scan
  },

  /**
   * Delete a scan and its Cloudinary image.
   */
  async deleteScan(userId: string, scanId: string) {
    const scan = await prisma.foodScan.findFirst({ where: { id: scanId, userId } })
    if (!scan) throw new NotFoundError('Scan không tìm thấy')

    // Delete image from storage
    if (scan.imagePublicId) {
      const storage = getStorageService()
      await storage.deleteImage(scan.imagePublicId)
    }

    await prisma.foodScan.delete({ where: { id: scanId } })
  },
}
