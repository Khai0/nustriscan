import { z } from 'zod'

const passwordRule = z
  .string()
  .min(8, 'Mật khẩu tối thiểu 8 ký tự')
  .max(100, 'Mật khẩu tối đa 100 ký tự')
  .regex(/[A-Z]/, 'Cần ít nhất 1 chữ hoa')
  .regex(/[0-9]/, 'Cần ít nhất 1 số')
  .regex(/[^A-Za-z0-9]/, 'Cần ít nhất 1 ký tự đặc biệt')

export const loginSchema = z.object({
  email:      z.string().email('Email không hợp lệ').toLowerCase().trim(),
  password:   z.string().min(1, 'Vui lòng nhập mật khẩu'),
  rememberMe: z.boolean().default(false),
})
export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    name:            z.string().min(2, 'Tên tối thiểu 2 ký tự').max(100).trim(),
    email:           z.string().email('Email không hợp lệ').toLowerCase().trim(),
    password:        passwordRule,
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine(d => d.password === d.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path:    ['confirmPassword'],
  })
export type RegisterFormValues = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ').toLowerCase().trim(),
})
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    password:        passwordRule,
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine(d => d.password === d.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path:    ['confirmPassword'],
  })
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword:     passwordRule,
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine(d => d.newPassword === d.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path:    ['confirmPassword'],
  })
  .refine(d => d.currentPassword !== d.newPassword, {
    message: 'Mật khẩu mới phải khác mật khẩu cũ',
    path:    ['newPassword'],
  })
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
