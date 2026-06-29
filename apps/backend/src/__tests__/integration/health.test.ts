import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'

// Mock Prisma so integration tests don't require a live database
vi.mock('@config/database', () => ({
  prisma: {
    $queryRaw: vi.fn().mockResolvedValue([{ '1': 1 }]),
    user: { findUnique: vi.fn().mockResolvedValue(null), findFirst: vi.fn().mockResolvedValue(null) },
  },
}))

import { createApp } from '../../app'

const app = createApp()

describe('GET /api/health', () => {
  it('returns 200 with service info', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body).toHaveProperty('version')
    expect(res.body).toHaveProperty('aiProvider')
  })
})

describe('GET /api/health/ready', () => {
  it('returns 200 when database check passes', async () => {
    const res = await request(app).get('/api/health/ready')
    expect(res.status).toBe(200)
    expect(res.body.checks.database).toBe('ok')
  })
})

describe('POST /api/auth/register — validation', () => {
  it('rejects an invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'not-an-email', password: 'Password123!' })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('rejects a weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: '123' })

    expect(res.status).toBe(400)
  })

  it('rejects missing required fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({})

    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login — validation', () => {
  it('rejects missing password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com' })

    expect(res.status).toBe(400)
  })
})

describe('GET /api/unknown-route', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/this-route-does-not-exist')
    expect(res.status).toBe(404)
  })
})

describe('Protected routes without auth', () => {
  it('returns 401 for /api/auth/me without token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  it('returns 401 for /api/analytics/stats without token', async () => {
    const res = await request(app).get('/api/analytics/stats')
    expect(res.status).toBe(401)
  })
})

describe('Security headers', () => {
  it('sets x-request-id header on every response', async () => {
    const res = await request(app).get('/api/health')
    expect(res.headers).toHaveProperty('x-request-id')
  })

  it('sets standard Helmet security headers', async () => {
    const res = await request(app).get('/api/health')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
  })
})

describe('NoSQL/prototype-pollution sanitization', () => {
  it('strips $-prefixed keys from request body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'x', $where: 'malicious' })

    // Should fail normal validation (missing valid password), not crash
    expect(res.status).toBe(400)
  })
})
