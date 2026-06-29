// ─── User ──────────────────────────────────────────────────────────────────
export type UserRole = 'USER' | 'ADMIN'

export interface User {
  id:            string
  email:         string
  name:          string
  avatarUrl:     string | null
  role:          UserRole
  isActive:      boolean
  emailVerified: boolean
  lastLoginAt:   string | null
  createdAt:     string
  updatedAt:     string
}

// ─── Auth ──────────────────────────────────────────────────────────────────
export interface AuthResponse {
  user:         User
  accessToken:  string
  refreshToken: string
  expiresIn:    number   // seconds
}

export interface TokenPair {
  accessToken:  string
  refreshToken: string
}

export interface JwtPayload {
  userId: string
  email:  string
  role:   UserRole
  iat?:   number
  exp?:   number
}

export interface LoginRequest {
  email:      string
  password:   string
  rememberMe?: boolean
}

export interface RegisterRequest {
  email:    string
  password: string
  name:     string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token:           string
  password:        string
  confirmPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword:     string
  confirmPassword: string
}
