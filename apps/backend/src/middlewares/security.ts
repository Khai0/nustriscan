import type { Request, Response, NextFunction } from 'express'

/**
 * Strip keys starting with '$' or containing '.' from request bodies/query/params
 * to prevent NoSQL/Prisma operator injection and prototype pollution.
 */
function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeValue)
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (key.startsWith('$') || key.includes('.') || key === '__proto__' || key === 'constructor') {
        continue
      }
      out[key] = sanitizeValue(val)
    }
    return out
  }
  return value
}

export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  if (req.body)  req.body  = sanitizeValue(req.body)
  if (req.query) req.query = sanitizeValue(req.query) as typeof req.query
  if (req.params) req.params = sanitizeValue(req.params) as typeof req.params
  next()
}

/**
 * Reject requests with suspiciously long header values (header injection / DoS).
 */
export function headerGuard(req: Request, res: Response, next: NextFunction): void {
  const ua = req.headers['user-agent']
  if (typeof ua === 'string' && ua.length > 1000) {
    res.status(400).json({ success: false, message: 'Yêu cầu không hợp lệ', data: null })
    return
  }
  next()
}

/**
 * Adds a request ID header for tracing, used by logger + Sentry.
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = req.headers['x-request-id']?.toString() ?? crypto.randomUUID()
  res.setHeader('x-request-id', id)
  ;(req as Request & { requestId: string }).requestId = id
  next()
}
