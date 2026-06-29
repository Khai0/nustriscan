// Phase 2: auth validators now live in DTO layer.
// Re-export from DTOs for backward compatibility.
export {
  LoginDto as loginSchema,
  RegisterDto as registerSchema,
  RefreshTokenDto as refreshTokenSchema,
} from '@dto/auth/auth.dto'

export type {
  LoginDto as LoginInput,
  RegisterDto as RegisterInput,
  RefreshTokenDto as RefreshTokenInput,
} from '@dto/auth/auth.dto'
