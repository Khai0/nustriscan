import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { AuthUser } from '@features/auth/services/auth.api'

interface AuthState {
  user:          AuthUser | null
  accessToken:   string | null
  expiresAt:     number | null   // unix ms
  isAuthenticated: boolean
  isLoading:     boolean

  // Actions
  setAuth:       (user: AuthUser, accessToken: string, expiresIn: number) => void
  setUser:       (user: AuthUser) => void
  setToken:      (accessToken: string, expiresIn: number) => void
  clearAuth:     () => void
  setLoading:    (v: boolean) => void
  isTokenExpired: () => boolean
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user:            null,
        accessToken:     null,
        expiresAt:       null,
        isAuthenticated: false,
        isLoading:       false,

        setAuth: (user, accessToken, expiresIn) => set({
          user,
          accessToken,
          expiresAt:       Date.now() + expiresIn * 1000,
          isAuthenticated: true,
        }, false, 'auth/setAuth'),

        setUser: user => set({ user }, false, 'auth/setUser'),

        setToken: (accessToken, expiresIn) => set({
          accessToken,
          expiresAt: Date.now() + expiresIn * 1000,
        }, false, 'auth/setToken'),

        clearAuth: () => set({
          user:            null,
          accessToken:     null,
          expiresAt:       null,
          isAuthenticated: false,
        }, false, 'auth/clearAuth'),

        setLoading: v => set({ isLoading: v }, false, 'auth/setLoading'),

        isTokenExpired: () => {
          const { expiresAt } = get()
          if (!expiresAt) return true
          return Date.now() > expiresAt - 30_000  // 30s buffer
        },
      }),
      {
        name: 'nutriscan_auth',
        partialize: state => ({
          user:            state.user,
          accessToken:     state.accessToken,
          expiresAt:       state.expiresAt,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
)
