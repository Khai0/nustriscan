import { z } from 'zod'

export const UserResponseDto = z.object({
  id:             z.string(),
  email:          z.string(),
  name:           z.string(),
  avatarUrl:      z.string().nullable(),
  role:           z.enum(['USER', 'ADMIN']),
  isActive:       z.boolean(),
  emailVerified:  z.boolean(),
  lastLoginAt:    z.string().nullable(),
  createdAt:      z.string(),
  updatedAt:      z.string(),
})
export type UserResponseDto = z.infer<typeof UserResponseDto>

export const UpdateUserDto = z.object({
  name:      z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional(),
})
export type UpdateUserDto = z.infer<typeof UpdateUserDto>

export function toUserDto(user: {
  id: string; email: string; name: string
  avatarUrl: string | null; role: string
  isActive: boolean; emailVerified: boolean
  lastLoginAt: Date | null
  createdAt: Date; updatedAt: Date
}): UserResponseDto {
  return {
    id:            user.id,
    email:         user.email,
    name:          user.name,
    avatarUrl:     user.avatarUrl,
    role:          user.role as 'USER' | 'ADMIN',
    isActive:      user.isActive,
    emailVerified: user.emailVerified,
    lastLoginAt:   user.lastLoginAt?.toISOString() ?? null,
    createdAt:     user.createdAt.toISOString(),
    updatedAt:     user.updatedAt.toISOString(),
  }
}
