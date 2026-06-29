import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import path from 'path'
import { env, isDev } from '@config/env'

const { combine, timestamp, printf, colorize, errors, json } = winston.format

// ─── Human-readable format for development ──────────────────────────────────
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
    return `${timestamp} [${level}]: ${stack ?? message}${metaStr}`
  })
)

// ─── JSON format for production (structured for log aggregators) ─────────────
const prodFormat = combine(timestamp(), errors({ stack: true }), json())

// ─── Daily rotating file transport ───────────────────────────────────────────
const fileRotateTransport = new DailyRotateFile({
  filename: path.join(env.LOG_DIR, 'app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  zippedArchive: true,
})

const errorFileTransport = new DailyRotateFile({
  filename: path.join(env.LOG_DIR, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d',
  zippedArchive: true,
})

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: isDev ? devFormat : prodFormat,
  transports: [
    new winston.transports.Console(),
    fileRotateTransport,
    errorFileTransport,
  ],
  exitOnError: false,
})

// ─── HTTP request logger stream (for morgan) ─────────────────────────────────
export const httpLogStream = {
  write: (message: string) => {
    logger.http(message.trim())
  },
}
