/**
 * Client-side image utilities for the scan feature.
 * Compresses and validates images before upload.
 */

export interface CompressResult {
  file:         File
  dataUrl:      string
  originalSize: number
  finalSize:    number
  width:        number
  height:       number
}

const MAX_WIDTH  = 1200
const MAX_HEIGHT = 1200
const JPEG_QUALITY = 0.85

/**
 * Compress an image file using Canvas API.
 * Reduces size while maintaining quality for AI recognition.
 */
export async function compressImage(file: File): Promise<CompressResult> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      // Calculate new dimensions (maintain aspect ratio)
      let { width, height } = img
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height)
        width  = Math.round(width  * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width  = width
      canvas.height = height

      const ctx = canvas.getContext('2d')!
      ctx.imageSmoothingEnabled  = true
      ctx.imageSmoothingQuality  = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        blob => {
          if (!blob) { reject(new Error('Canvas compression failed')); return }

          const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
            type: 'image/jpeg',
          })

          // Build data URL for preview
          const reader = new FileReader()
          reader.onload = e => resolve({
            file:         compressedFile,
            dataUrl:      e.target?.result as string,
            originalSize: file.size,
            finalSize:    blob.size,
            width,
            height,
          })
          reader.onerror = reject
          reader.readAsDataURL(blob)
        },
        'image/jpeg',
        JPEG_QUALITY
      )
    }

    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Failed to load image')) }
    img.src = objectUrl
  })
}

/**
 * Read a File and return a dataURL for preview.
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = e => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/** Validate file type and size before upload */
export function validateImageFile(file: File): string | null {
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
  const MAX_SIZE_MB   = 20

  if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|heic|heif)$/i)) {
    return 'Chỉ chấp nhận file JPG, PNG, WebP, hoặc HEIC'
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `File quá lớn. Tối đa ${MAX_SIZE_MB}MB`
  }
  return null
}

/** Format bytes to human readable string */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Access device camera */
export async function openCamera(): Promise<MediaStream | null> {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // rear camera on mobile
        width:  { ideal: 1280 },
        height: { ideal: 720 },
      },
    })
  } catch {
    return null
  }
}

/** Capture a frame from a video stream */
export function captureFrame(video: HTMLVideoElement): Promise<File> {
  return new Promise(resolve => {
    const canvas  = document.createElement('canvas')
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0)
    canvas.toBlob(blob => {
      resolve(new File([blob!], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.9)
  })
}
