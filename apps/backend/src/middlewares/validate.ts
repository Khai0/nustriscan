import type { NextFunction, Request, Response } from 'express'
import { type ZodSchema } from 'zod'
import { sendValidationError } from '@utils/response'

type ValidationTarget = 'body' | 'query' | 'params'

/**
 * Middleware Zod validation.
 * Thay thế dữ liệu thô bằng dữ liệu đã được parse + type-safe.
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target])

    if (!result.success) {
      sendValidationError(res, result.error.flatten().fieldErrors)
      return
    }

    // Gắn lại dữ liệu đã coerce/transform
    req[target] = result.data
    next()
  }
}
