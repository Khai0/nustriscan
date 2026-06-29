/**
 * Image compression pipeline using Sharp.
 * Runs before Cloudinary upload to reduce transfer size and improve AI accuracy.
 */
import sharp from 'sharp'
import { logger } from '@utils/logger'

export interface CompressOptions {
  maxWidth?:  number   // default 1200
  maxHeight?: number   // default 1200
  quality?:   number   // JPEG quality 1–100, default 82
  format?:    'jpeg' | 'webp' | 'png'
}

export interface CompressResult {
  buffer:      Buffer
  width:       number
  height:      number
  format:      string
  originalSize:number
  compressedSize:number
  savedPercent:number
}

export async function compressImage(
  input: Buffer,
  opts: CompressOptions = {}
): Promise<CompressResult> {
  const {
    maxWidth  = 1200,
    maxHeight = 1200,
    quality   = 82,
    format    = 'jpeg',
  } = opts

  const originalSize = input.length

  const pipeline = sharp(input)
    .rotate()                          // auto-orient from EXIF
    .resize({
      width:  maxWidth,
      height: maxHeight,
      fit:    'inside',               // never upscale
      withoutEnlargement: true,
    })

  let buffer: Buffer
  let info:   sharp.OutputInfo & { width: number; height: number }

  if (format === 'webp') {
    const result = await pipeline.webp({ quality }).toBuffer({ resolveWithObject: true })
    buffer = result.data
    info   = result.info as any
  } else if (format === 'png') {
    const result = await pipeline.png({ compressionLevel: 8 }).toBuffer({ resolveWithObject: true })
    buffer = result.data
    info   = result.info as any
  } else {
    const result = await pipeline.jpeg({ quality, progressive: true, mozjpeg: true }).toBuffer({ resolveWithObject: true })
    buffer = result.data
    info   = result.info as any
  }

  const savedPercent = Math.round((1 - buffer.length / originalSize) * 100)

  logger.debug('Image compressed', {
    originalSize: `${(originalSize / 1024).toFixed(0)}KB`,
    compressedSize: `${(buffer.length / 1024).toFixed(0)}KB`,
    savedPercent: `${savedPercent}%`,
    dimensions: `${info.width}×${info.height}`,
  })

  return {
    buffer,
    width:          info.width  ?? maxWidth,
    height:         info.height ?? maxHeight,
    format:         info.format ?? format,
    originalSize,
    compressedSize: buffer.length,
    savedPercent,
  }
}

/**
 * Validate image buffer before processing.
 * Returns metadata without full decompression.
 */
export async function validateImage(buffer: Buffer): Promise<{
  width: number; height: number; format: string; valid: boolean; error?: string
}> {
  try {
    const meta = await sharp(buffer).metadata()
    if (!meta.width || !meta.height) {
      return { width: 0, height: 0, format: '', valid: false, error: 'Không đọc được kích thước ảnh' }
    }
    if (meta.width < 50 || meta.height < 50) {
      return { width: meta.width, height: meta.height, format: meta.format ?? '', valid: false, error: 'Ảnh quá nhỏ (tối thiểu 50×50px)' }
    }
    return { width: meta.width, height: meta.height, format: meta.format ?? '', valid: true }
  } catch {
    return { width: 0, height: 0, format: '', valid: false, error: 'File không phải ảnh hợp lệ' }
  }
}
