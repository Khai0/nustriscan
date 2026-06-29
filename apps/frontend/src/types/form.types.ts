import type { LoginRequest, RegisterRequest } from '@nutriscan/shared-types'

// Re-export shared request types as form values (they match 1:1 here)
export type LoginFormValues = LoginRequest
export type RegisterFormValues = RegisterRequest & {
  confirmPassword: string
}

export type ForgotPasswordFormValues = {
  email: string
}

export type ResetPasswordFormValues = {
  password: string
  confirmPassword: string
}
