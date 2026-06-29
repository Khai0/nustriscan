import { createClient, type RedisClientType } from 'redis'
import { env, isDev } from './env'
import { logger } from '@utils/logger'

let client: RedisClientType | null = null
let connected = false

export function getRedisClient(): RedisClientType | null {
  if (!env.REDIS_URL) return null

  if (!client) {
    client = createClient({ url: env.REDIS_URL })
    client.on('error', err => logger.warn('Redis error (degrading gracefully)', { err: err.message }))
    client.on('connect', () => { connected = true; logger.info('🔴 Redis connected') })
    client.connect().catch(err => logger.warn('Redis connect failed — caching disabled', { err: err.message }))
  }
  return client
}

/** Get JSON value from cache, or null if missing/unavailable. */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const c = getRedisClient()
  if (!c || !connected) return null
  try {
    const val = await c.get(key)
    return val ? (JSON.parse(val) as T) : null
  } catch { return null }
}

/** Set JSON value with TTL (seconds). No-op if Redis unavailable. */
export async function cacheSet(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  const c = getRedisClient()
  if (!c || !connected) return
  try {
    await c.set(key, JSON.stringify(value), { EX: ttlSeconds })
  } catch { /* ignore */ }
}

/** Delete one or more keys / a key prefix pattern. */
export async function cacheDel(pattern: string): Promise<void> {
  const c = getRedisClient()
  if (!c || !connected) return
  try {
    if (pattern.includes('*')) {
      const keys = await c.keys(pattern)
      if (keys.length) await c.del(keys)
    } else {
      await c.del(pattern)
    }
  } catch { /* ignore */ }
}

/** Wrap an async function with cache-aside pattern. */
export async function cached<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
  const hit = await cacheGet<T>(key)
  if (hit !== null) return hit
  const result = await fn()
  await cacheSet(key, result, ttlSeconds)
  return result
}

export async function closeRedis(): Promise<void> {
  if (client && connected) {
    await client.quit()
    connected = false
  }
}
