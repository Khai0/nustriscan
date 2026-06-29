import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    css: true,
    exclude: ['**/node_modules/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
  resolve: {
    alias: {
      '@':            path.resolve(__dirname, 'src'),
      '@app':         path.resolve(__dirname, 'src/app'),
      '@features':    path.resolve(__dirname, 'src/features'),
      '@components':  path.resolve(__dirname, 'src/components'),
      '@hooks':       path.resolve(__dirname, 'src/hooks'),
      '@services':    path.resolve(__dirname, 'src/services'),
      '@store':       path.resolve(__dirname, 'src/store'),
      '@routes':      path.resolve(__dirname, 'src/routes'),
      '@layouts':     path.resolve(__dirname, 'src/layouts'),
      '@pages':       path.resolve(__dirname, 'src/pages'),
      '@lib':         path.resolve(__dirname, 'src/lib'),
    },
  },
})
