import { Router } from 'express'
import { authController } from '@controllers/auth.controller'
import { authenticate } from '@middlewares/authenticate'
import { validate } from '@middlewares/validate'
import { csrfProtection } from '@middlewares/csrf'
import {
  authRateLimiter, forgotPasswordLimiter, resendVerificationLimiter,
} from '@middlewares/rateLimiter'
import {
  RegisterDto, LoginDto, RefreshTokenDto,
  ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto,
  VerifyEmailDto, ResendVerificationDto,
} from '@dto/auth/auth.dto'

const router = Router()

// ─── Public ───────────────────────────────────────────────────────────────────
router.post('/register',             authRateLimiter,              validate(RegisterDto),             authController.register)
router.post('/login',                authRateLimiter,              validate(LoginDto),                authController.login)
router.post('/refresh',                                            authController.refresh)
router.post('/logout',                                             authController.logout)

// Email verification
router.post('/verify-email',                                       validate(VerifyEmailDto),           authController.verifyEmail)
router.post('/resend-verification',  resendVerificationLimiter,    validate(ResendVerificationDto),    authController.resendVerification)

// Password reset
router.post('/forgot-password',      forgotPasswordLimiter,        validate(ForgotPasswordDto),        authController.forgotPassword)
router.post('/reset-password',       authRateLimiter,              validate(ResetPasswordDto),         authController.resetPassword)

// ─── Protected ────────────────────────────────────────────────────────────────
router.get ('/me',                   authenticate,                                                     authController.me)
router.post('/logout-all',           authenticate, csrfProtection,                                    authController.logoutAll)
router.post('/change-password',      authenticate, csrfProtection, validate(ChangePasswordDto),       authController.changePassword)

export default router
