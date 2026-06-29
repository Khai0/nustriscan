import * as Sentry from '@sentry/node'
import type { Express } from 'express'
import { env, isDev } from './env'

/**
 * Initialize Sentry error monitoring.
 * No-op if SENTRY_DSN is not configured (e.g. local dev).
 */
export function initSentry(app: Express): void {
  if (!env.SENTRY_DSN) return

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: isDev ? 'development' : 'production',
    release: env.APP_VERSION,
    tracesSampleRate: isDev ? 1.0 : 0.1,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
    ],
  })

  app.use(Sentry.Handlers.requestHandler())
  app.use(Sentry.Handlers.tracingHandler())
}

export { Sentry }
