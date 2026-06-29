/**
 * Typed access to Vite environment variables.
 * Centralises all import.meta.env references so they're easy to find and mock in tests.
 */
export const clientEnv = {
  apiUrl: import.meta.env.VITE_API_URL as string,
  appName: (import.meta.env.VITE_APP_NAME as string) ?? 'NutriScan AI',
  appVersion: (import.meta.env.VITE_APP_VERSION as string) ?? '1.0.0',
  enableMockApi: import.meta.env.VITE_ENABLE_MOCK_API === 'true',
  enableDevtools: import.meta.env.VITE_ENABLE_DEVTOOLS !== 'false',
  authTokenKey: (import.meta.env.VITE_AUTH_TOKEN_KEY as string) ?? 'nutriscan_token',
  authRefreshKey: (import.meta.env.VITE_AUTH_REFRESH_KEY as string) ?? 'nutriscan_refresh',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const
