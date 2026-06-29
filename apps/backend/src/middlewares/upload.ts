import multer, { type FileFilterCallback } from 'multer'
import path from 'path'
import crypto from 'crypto'
import fs from 'fs'
import type { Request } from 'express'

import { allowedMimeTypes, maxFileSizeBytes, env } from '@config/env'
import { BadRequestError } from '@utils/errors'

// Ensure upload directory exists
const uploadDir = path.resolve(env.UPLOAD_DIR)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const uniqueName = `${crypto.randomUUID()}${ext}`
    cb(null, uniqueName)
  },
})

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new BadRequestError(
        `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`
      )
    )
  }
}

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSizeBytes,
    files: 1,
  },
})

export const uploadSingleImage = uploadMiddleware.single('image')
