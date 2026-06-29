import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/__tests__/**', '**/*.config.ts'],
    },
  },
  resolve: {
    alias: {
      '@config':      path.resolve(__dirname, 'src/config'),
      '@controllers': path.resolve(__dirname, 'src/controllers'),
      '@services':    path.resolve(__dirname, 'src/services'),
      '@repositories':path.resolve(__dirname, 'src/repositories'),
      '@middlewares': path.resolve(__dirname, 'src/middlewares'),
      '@validators':  path.resolve(__dirname, 'src/validators'),
      '@routes':      path.resolve(__dirname, 'src/routes'),
      '@utils':       path.resolve(__dirname, 'src/utils'),
      '@dto':         path.resolve(__dirname, 'src/dto'),
      '@types':       path.resolve(__dirname, 'src/types'),
    },
  },
})
