import { beforeAll, afterAll } from 'vitest'

// Ensure required env vars exist for tests that import @config/env
process.env.NODE_ENV            ??= 'test'
process.env.JWT_ACCESS_SECRET   ??= 'test_access_secret_minimum_32_characters_long'
process.env.JWT_REFRESH_SECRET  ??= 'test_refresh_secret_minimum_32_characters_long'
process.env.COOKIE_SECRET       ??= 'test_cookie_secret_minimum_32_characters_long'
process.env.CSRF_SECRET         ??= 'test_csrf_secret_minimum_32_characters_long_x'
process.env.DATABASE_URL        ??= 'postgresql://test:test@localhost:5432/nutriscan_test'
process.env.AI_PROVIDER         ??= 'mock'
process.env.FRONTEND_URL        ??= 'http://localhost:3000'

beforeAll(() => { /* global setup hook */ })
afterAll(() => { /* global teardown hook */ })
