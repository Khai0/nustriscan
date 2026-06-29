import { Router } from 'express'
import multer from 'multer'
import { scanController } from '@controllers/scan.controller'
import { authenticate } from '@middlewares/authenticate'
import { validate } from '@middlewares/validate'
import { uploadRateLimiter } from '@middlewares/rateLimiter'
import { ConfirmScanDto, ScanQueryDto } from '@dto/scan/scan.dto'
import { allowedMimeTypes, maxFileSizeBytes } from '@config/env'
import { sendError } from '@utils/response'

// Use memoryStorage so buffer is directly available (no temp file read)
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: maxFileSizeBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) cb(null, true)
    else cb(new Error(`File type not allowed. Accepted: ${allowedMimeTypes.join(', ')}`))
  },
})

const router = Router()
router.use(authenticate)

// POST /api/scans/analyze       — upload + full AI pipeline
router.post(
  '/analyze',
  uploadRateLimiter,
  memoryUpload.single('image'),
  scanController.analyzeImage
)

// POST /api/scans/:id/confirm   — confirm result + create Meal
router.post(
  '/:id/confirm',
  validate(ConfirmScanDto),
  scanController.confirmScan
)

// GET  /api/scans/history
router.get('/history', validate(ScanQueryDto, 'query'), scanController.getHistory)

// GET  /api/scans/:id
router.get('/:id', scanController.getScanById)

// DELETE /api/scans/:id
router.delete('/:id', scanController.deleteScan)

export default router
