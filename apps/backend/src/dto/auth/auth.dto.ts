import { z } from 'zod'
import { UserResponseDto } from '../user/user.dto'

// ─── Password rule (tái sử dụng) ─────────────────────────────────────────────
const passwordRule = z
  .string()
  .min(8, 'Mật khẩu tối thiểu 8 ký tự')
  .max(100, 'Mật khẩu tối đa 100 ký tự')
  .regex(/[A-Z]/, 'Cần ít nhất 1 chữ hoa')
  .regex(/[0-9]/, 'Cần ít nhất 1 số')
  .regex(/[^A-Za-z0-9]/, 'Cần ít nhất 1 ký tự đặc biệt')

// ─── Request DTOs ─────────────────────────────────────────────────────────────
export const RegisterDto = z.object({
  email:    z.string().email('Email không hợp lệ').toLowerCase().trim(),
  password: passwordRule,
  name:     z.string().min(2, 'Tên tối thiểu 2 ký tự').max(100).trim(),
})
export type RegisterDto = z.infer<typeof RegisterDto>

export const LoginDto = z.object({
  email:      z.string().email().toLowerCase().trim(),
  password:   z.string().min(1, 'Mật khẩu không được trống'),
  rememberMe: z.boolean().optional().default(false),
})
export type LoginDto = z.infer<typeof LoginDto>

export const RefreshTokenDto = z.object({
  refreshToken: z.string().min(1, 'Refresh token không được trống'),
})
export type RefreshTokenDto = z.infer<typeof RefreshTokenDto>

export const ForgotPasswordDto = z.object({
  email: z.string().email('Email không hợp lệ').toLowerCase().trim(),
})
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordDto>

export const ResetPasswordDto = z.object({
  token:           z.string().min(1, 'Token không hợp lệ'),
  password:        passwordRule,
  confirmPassword: z.string().min(1),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})
export type ResetPasswordDto = z.infer<typeof ResetPasswordDto>

export const ChangePasswordDto = z.object({
  currentPassword: z.string().min(1, 'Mật khẩu hiện tại không được trống'),
  newPassword:     passwordRule,
  confirmPassword: z.string().min(1),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
}).refine(d => d.currentPassword !== d.newPassword, {
  message: 'Mật khẩu mới phải khác mật khẩu cũ',
  path: ['newPassword'],
})
export type ChangePasswordDto = z.infer<typeof ChangePasswordDto>

export const VerifyEmailDto = z.object({
  token: z.string().min(1, 'Token xác minh không hợp lệ'),
})
export type VerifyEmailDto = z.infer<typeof VerifyEmailDto>

export const ResendVerificationDto = z.object({
  email: z.string().email().toLowerCase().trim(),
})
export type ResendVerificationDto = z.infer<typeof ResendVerificationDto>

// ─── Response DTOs ────────────────────────────────────────────────────────────
export const AuthResponseDto = z.object({
  user:         UserResponseDto,
  accessToken:  z.string(),
  refreshToken: z.string(),
  expiresIn:    z.number(), // seconds
})
export type AuthResponseDto = z.infer<typeof AuthResponseDto>
