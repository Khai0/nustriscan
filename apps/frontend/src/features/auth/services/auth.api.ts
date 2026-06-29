import apiClient from '@lib/axios'
import type { LoginFormValues, RegisterFormValues } from '../schemas/auth.schema'

export interface AuthUser {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  role: 'USER' | 'ADMIN'
  isActive: boolean
  emailVerified: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
  expiresIn: number
}

export const authApiService = {
  login: async (data: LoginFormValues): Promise<AuthResponse> => {
    const res = await apiClient.post<{ data: AuthResponse }>('/auth/login', data)
    return res.data.data
  },

  register: async (data: Omit<RegisterFormValues, 'confirmPassword'>): Promise<AuthResponse> => {
    const res = await apiClient.post<{ data: AuthResponse }>('/auth/register', data)
    return res.data.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  logoutAll: async (): Promise<void> => {
    await apiClient.post('/auth/logout-all')
  },

  refresh: async (): Promise<AuthResponse> => {
    const res = await apiClient.post<{ data: AuthResponse }>('/auth/refresh')
    return res.data.data
  },

  getMe: async (): Promise<AuthUser> => {
    const res = await apiClient.get<{ data: AuthUser }>('/auth/me')
    return res.data.data
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email })
  },

  resetPassword: async (token: string, password: string, confirmPassword: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', { token, password, confirmPassword })
  },

  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> => {
    await apiClient.post('/auth/change-password', { currentPassword, newPassword, confirmPassword })
  },

  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.post('/auth/verify-email', { token })
  },

  resendVerification: async (email: string): Promise<void> => {
    await apiClient.post('/auth/resend-verification', { email })
  },
}
