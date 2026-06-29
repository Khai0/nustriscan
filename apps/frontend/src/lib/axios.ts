import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@store/auth.store'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL:         `${BASE_URL}/api`,
  timeout:         30_000,
  withCredentials: true,   // send httpOnly cookies automatically
  headers: { 'Content-Type': 'application/json' },
})

// ─── Request: attach access token + CSRF ──────────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`

  // Read CSRF token from cookie (set by backend, readable by JS)
  const csrf = document.cookie
    .split('; ')
    .find(r => r.startsWith('csrf_token='))
    ?.split('=')[1]
  if (csrf) config.headers['x-csrf-token'] = csrf

  return config
})

// ─── Response: silent token refresh on 401 ───────────────────────────────────
let isRefreshing = false
let queue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = []

const processQueue = (err: unknown, token: string | null = null) => {
  queue.forEach(p => (err ? p.reject(err) : p.resolve(token!)))
  queue = []
}

apiClient.interceptors.response.use(
  r => r,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    // Don't retry auth endpoints themselves
    const isAuthEndpoint = original.url?.includes('/auth/')
    if (isAuthEndpoint) {
      useAuthStore.getState().clearAuth()
      window.location.href = '/auth/login'
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject })
      }).then(token => {
        original.headers.Authorization = `Bearer ${token}`
        return apiClient(original)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      // Cookies are sent automatically (withCredentials: true)
      const res = await axios.post(
        `${BASE_URL}/api/auth/refresh`,
        {},
        { withCredentials: true }
      )
      const { accessToken, expiresIn, user } = res.data.data
      useAuthStore.getState().setAuth(user, accessToken, expiresIn)
      processQueue(null, accessToken)
      original.headers.Authorization = `Bearer ${accessToken}`
      return apiClient(original)
    } catch (refreshErr) {
      processQueue(refreshErr, null)
      useAuthStore.getState().clearAuth()
      window.location.href = '/auth/login'
      return Promise.reject(refreshErr)
    } finally {
      isRefreshing = false
    }
  }
)

export default apiClient
