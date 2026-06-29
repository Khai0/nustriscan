import type { NextFunction, Request, RequestHandler, Response } from 'express'

/**
 * Wraps an async Express handler and forwards any rejected promise
 * to the next() error handler automatically.
 *
 * Usage:
 *   router.get('/foo', asyncHandler(async (req, res) => {
 *     const data = await someService.getData()
 *     res.json(data)
 *   }))
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next)
  }
}
