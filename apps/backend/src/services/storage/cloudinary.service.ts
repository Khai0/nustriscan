import { v2 as cloudinary } from 'cloudinary'
import type { UploadApiResponse } from 'cloudinary'
import { env } from '@config/env'
import { logger } from '@utils/logger'

// ── Configure singleton ───────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key:    env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure:     true,
})

export interface StoredImage {
  url:          string   // Full resolution URL
  thumbnailUrl: string   // 300×300 thumbnail URL
  publicId:     string   // Cloudinary public_id (used for deletion)
  format:       string
  width:        number
  height:       number
  bytes:        number
}

export interface IStorageService {
  uploadImage(buffer: Buffer, userId: string): Promise<StoredImage>
  deleteImage(publicId: string): Promise<void>
  getOptimizedUrl(publicId: string, width?: number): string
}

export class CloudinaryStorageService implements IStorageService {
  private readonly folder = 'nutriscan/foods'

  async uploadImage(buffer: Buffer, userId: string): Promise<StoredImage> {
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY) {
      throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.')
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder:         this.folder,
          public_id:      `${userId}_${Date.now()}`,
          resource_type:  'image',
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
            { width: 1200, height: 1200, crop: 'limit' },  // max 1200px
          ],
          tags: ['food_scan', `user_${userId}`],
        },
        (error, result) => {
          if (error || !result) {
            logger.error('Cloudinary upload failed', error)
            reject(new Error(`Upload failed: ${error?.message ?? 'unknown error'}`))
            return
          }
          resolve(this.toStoredImage(result))
        }
      )
      uploadStream.end(buffer)
    })
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId)
      logger.info('Cloudinary image deleted', { publicId })
    } catch (err) {
      logger.warn('Cloudinary delete failed (non-fatal)', { publicId, err })
    }
  }

  getOptimizedUrl(publicId: string, width = 400): string {
    return cloudinary.url(publicId, {
      width,
      crop:         'fill',
      quality:      'auto',
      fetch_format: 'auto',
    })
  }

  private toStoredImage(result: UploadApiResponse): StoredImage {
    const thumbnailUrl = cloudinary.url(result.public_id, {
      width: 300, height: 300, crop: 'fill',
      quality: 'auto:eco', fetch_format: 'auto',
    })

    return {
      url:          result.secure_url,
      thumbnailUrl,
      publicId:     result.public_id,
      format:       result.format,
      width:        result.width,
      height:       result.height,
      bytes:        result.bytes,
    }
  }
}

// ── Fallback local storage (when Cloudinary not configured) ───────────────────
import path from 'path'
import fs from 'fs/promises'
import crypto from 'crypto'

export class LocalStorageService implements IStorageService {
  private readonly uploadDir = path.resolve(env.UPLOAD_DIR)

  async uploadImage(buffer: Buffer, userId: string): Promise<StoredImage> {
    await fs.mkdir(this.uploadDir, { recursive: true })

    const filename  = `${userId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.jpg`
    const filePath  = path.join(this.uploadDir, filename)
    await fs.writeFile(filePath, buffer)

    const url = `/uploads/${filename}`
    return {
      url,
      thumbnailUrl: url,
      publicId:     filename,
      format:       'jpg',
      width:        0,
      height:       0,
      bytes:        buffer.length,
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    const filePath = path.join(this.uploadDir, publicId)
    try { await fs.unlink(filePath) } catch { /* ignore */ }
  }

  getOptimizedUrl(publicId: string): string {
    return `/uploads/${publicId}`
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────
export function createStorageService(): IStorageService {
  const hasCloudinary = !!(
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
  )

  if (hasCloudinary) {
    logger.info('☁️  Storage: Cloudinary')
    return new CloudinaryStorageService()
  }

  logger.warn('⚠️  Cloudinary not configured — using local file storage')
  return new LocalStorageService()
}

// Singleton
let _storageService: IStorageService | null = null
export function getStorageService(): IStorageService {
  if (!_storageService) _storageService = createStorageService()
  return _storageService
}
