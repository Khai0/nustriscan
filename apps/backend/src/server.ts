import { createApp } from './app'
import { env } from '@config/env'
import { connectDatabase, disconnectDatabase } from '@config/database'
import { logger } from '@utils/logger'

async function main() {
  // ── Connect to DB ─────────────────────────────────────────────────────────
  await connectDatabase()
  logger.info('✅ Database connected')

  // ── Start HTTP server ─────────────────────────────────────────────────────
  const app = createApp()
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 NutriScan API running on port ${env.PORT} [${env.NODE_ENV}]`)
    logger.info(`📖 Health check: http://localhost:${env.PORT}${env.API_PREFIX}/health`)
  })

  // ── Graceful shutdown ─────────────────────────────────────────────────────
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully…`)
    server.close(async () => {
      await disconnectDatabase()
      logger.info('Database disconnected. Process exiting.')
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))

  // ── Unhandled errors ──────────────────────────────────────────────────────
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Promise Rejection', { reason })
    process.exit(1)
  })
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', { message: err.message, stack: err.stack })
    process.exit(1)
  })
}

main().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
