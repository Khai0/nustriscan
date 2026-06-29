import bcrypt from 'bcryptjs'
import { userRepository } from '@repositories/user.repository'
import { refreshTokenRepository } from '@repositories/refresh-token.repository'
import { generateTokenPair, verifyRefreshToken } from '@utils/jwt'
import { createAuthToken, consumeAuthToken } from '@utils/token/auth-token.util'
import {
  sendEmailVerification,
  sendPasswordReset,
  sendPasswordChangedNotice,
  sendAccountLockedNotice,
} from '@utils/email/email.service'
import {
  UnauthorizedError, ConflictError, NotFoundError,
  BadRequestError, TooManyRequestsError,
} from '@utils/errors'
import { toUserDto } from '@dto/user/user.dto'
import { env } from '@config/env'
import type { RegisterDto, LoginDto } from '@dto/auth/auth.dto'

const SALT_ROUNDS = 12

function getRefreshExpiry(): Date {
  const str = env.JWT_REFRESH_EXPIRES_IN
  const m = str.match(/^(\d+)([dhms])$/)
  const mult: Record<string, number> = { d: 86400000, h: 3600000, m: 60000, s: 1000 }
  const value = m ? parseInt(m[1], 10) : 7
  const unit  = m ? m[2] : 'd'
  return new Date(Date.now() + value * (mult[unit] ?? 86400000))
}

function getAccessExpiresIn(): number {
  const str = env.JWT_ACCESS_EXPIRES_IN
  const m = str.match(/^(\d+)([dhms])$/)
  const mult: Record<string, number> = { d: 86400, h: 3600, m: 60, s: 1 }
  const value = m ? parseInt(m[1], 10) : 15
  const unit  = m ? m[2] : 'm'
  return value * (mult[unit] ?? 60)
}

export const authService = {
  // ── Register ───────────────────────────────────────────────────────────────
  async register(dto: RegisterDto, meta?: { userAgent?: string; ip?: string }) {
    const existing = await userRepository.findByEmail(dto.email)
    if (existing) throw new ConflictError('Email này đã được sử dụng')

    const hashed = await bcrypt.hash(dto.password, SALT_ROUNDS)
    const user = await userRepository.create({
      email: dto.email, name: dto.name, password: hashed,
    })

    // Gửi email xác minh
    const verifyToken = await createAuthToken(
      user.id, 'EMAIL_VERIFICATION', env.EMAIL_VERIFY_EXPIRES_MIN
    )
    await sendEmailVerification(user.email, user.name, verifyToken)

    const tokens = generateTokenPair({ userId: user.id, email: user.email, role: (user as any).role })
    await refreshTokenRepository.create({
      userId: user.id, token: tokens.refreshToken,
      expiresAt: getRefreshExpiry(),
      userAgent: meta?.userAgent, ipAddress: meta?.ip,
    })

    return { user: toUserDto(user), ...tokens, expiresIn: getAccessExpiresIn() }
  },

  // ── Login ──────────────────────────────────────────────────────────────────
  async login(dto: LoginDto, meta?: { userAgent?: string; ip?: string }) {
    const user = await userRepository.findByEmail(dto.email)
    if (!user) throw new UnauthorizedError('Email hoặc mật khẩu không đúng')

    // Kiểm tra tài khoản bị khoá
    if (userRepository.isLocked(user)) {
      const mins = Math.ceil((user.lockedUntil!.getTime() - Date.now()) / 60000)
      throw new TooManyRequestsError(
        `Tài khoản bị tạm khóa. Thử lại sau ${mins} phút.`
      )
    }

    if (!user.isActive) throw new UnauthorizedError('Tài khoản đã bị vô hiệu hóa')

    const isMatch = await bcrypt.compare(dto.password, user.password)
    if (!isMatch) {
      const updated = await userRepository.incrementFailedLogin(user.id)
      // Nếu vừa bị khoá — gửi email cảnh báo
      if (userRepository.isLocked(updated)) {
        await sendAccountLockedNotice(user.email, user.name, updated.lockedUntil!)
      }
      const remaining = env.MAX_FAILED_LOGINS - updated.failedLoginCount
      if (remaining > 0) {
        throw new UnauthorizedError(
          `Email hoặc mật khẩu không đúng. Còn ${remaining} lần thử.`
        )
      }
      throw new TooManyRequestsError('Tài khoản bị tạm khóa do đăng nhập sai nhiều lần.')
    }

    // Login thành công — reset failed count
    await userRepository.resetFailedLogin(user.id, meta?.ip)

    const tokens = generateTokenPair({ userId: user.id, email: user.email, role: (user as any).role })

    // rememberMe: 30 ngày, bình thường: 7 ngày
    const expiry = dto.rememberMe
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : getRefreshExpiry()

    await refreshTokenRepository.create({
      userId: user.id, token: tokens.refreshToken,
      expiresAt: expiry,
      userAgent: meta?.userAgent, ipAddress: meta?.ip,
    })

    return { user: toUserDto(user), ...tokens, expiresIn: getAccessExpiresIn() }
  },

  // ── Refresh ────────────────────────────────────────────────────────────────
  async refreshTokens(refreshToken: string) {
    let payload
    try { payload = verifyRefreshToken(refreshToken) }
    catch { throw new UnauthorizedError('Refresh token không hợp lệ hoặc đã hết hạn') }

    const isValid = await refreshTokenRepository.isValidToken(refreshToken)
    if (!isValid) throw new UnauthorizedError('Refresh token đã bị thu hồi')

    const user = await userRepository.findById(payload.userId)
    if (!user || !user.isActive) throw new UnauthorizedError('Tài khoản không tồn tại')

    // Token rotation — revoke cũ, cấp mới
    await refreshTokenRepository.revoke(refreshToken)
    const newTokens = generateTokenPair({ userId: user.id, email: user.email, role: (user as any).role })
    await refreshTokenRepository.create({
      userId: user.id, token: newTokens.refreshToken, expiresAt: getRefreshExpiry(),
    })

    return { user: toUserDto(user), ...newTokens, expiresIn: getAccessExpiresIn() }
  },

  // ── Logout ─────────────────────────────────────────────────────────────────
  async logout(refreshToken?: string): Promise<void> {
    if (refreshToken) {
      try { await refreshTokenRepository.revoke(refreshToken) } catch { /* ignore */ }
    }
  },

  async logoutAll(userId: string): Promise<void> {
    await refreshTokenRepository.revokeAllForUser(userId)
  },

  // ── Verify email ───────────────────────────────────────────────────────────
  async verifyEmail(token: string) {
    let userId: string
    try { userId = await consumeAuthToken(token, 'EMAIL_VERIFICATION') }
    catch (e: any) {
      const msgs: Record<string, string> = {
        TOKEN_NOT_FOUND:    'Link xác minh không hợp lệ',
        TOKEN_EXPIRED:      'Link xác minh đã hết hạn. Vui lòng yêu cầu gửi lại.',
        TOKEN_ALREADY_USED: 'Email đã được xác minh trước đó',
      }
      throw new BadRequestError(msgs[e.message] ?? 'Token không hợp lệ')
    }
    await userRepository.markEmailVerified(userId)
    return { message: 'Xác minh email thành công' }
  },

  // ── Resend verification ────────────────────────────────────────────────────
  async resendVerification(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email)
    // Trả về thành công dù user không tồn tại (tránh email enumeration)
    if (!user || user.emailVerified) return

    const token = await createAuthToken(user.id, 'EMAIL_VERIFICATION', env.EMAIL_VERIFY_EXPIRES_MIN)
    await sendEmailVerification(user.email, user.name, token)
  },

  // ── Forgot password ────────────────────────────────────────────────────────
  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email)
    // Luôn trả về thành công (tránh email enumeration attack)
    if (!user || !user.isActive) return

    const token = await createAuthToken(user.id, 'PASSWORD_RESET', env.PASSWORD_RESET_EXPIRES_MIN)
    await sendPasswordReset(user.email, user.name, token)
  },

  // ── Reset password ─────────────────────────────────────────────────────────
  async resetPassword(token: string, newPassword: string): Promise<void> {
    let userId: string
    try { userId = await consumeAuthToken(token, 'PASSWORD_RESET') }
    catch (e: any) {
      const msgs: Record<string, string> = {
        TOKEN_NOT_FOUND: 'Link đặt lại mật khẩu không hợp lệ',
        TOKEN_EXPIRED:   'Link đặt lại mật khẩu đã hết hạn',
        TOKEN_ALREADY_USED: 'Link này đã được sử dụng',
      }
      throw new BadRequestError(msgs[e.message] ?? 'Token không hợp lệ')
    }

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS)
    await userRepository.updatePassword(userId, hashed)
    await refreshTokenRepository.revokeAllForUser(userId) // logout tất cả thiết bị

    const user = await userRepository.findById(userId)
    if (user) await sendPasswordChangedNotice(user.email, user.name)
  },

  // ── Change password ────────────────────────────────────────────────────────
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await userRepository.findById(userId)
    if (!user) throw new NotFoundError('Người dùng không tồn tại')

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) throw new BadRequestError('Mật khẩu hiện tại không đúng')

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS)
    await userRepository.updatePassword(userId, hashed)
    await refreshTokenRepository.revokeAllForUser(userId)
    await sendPasswordChangedNotice(user.email, user.name)
  },

  // ── Get current user ───────────────────────────────────────────────────────
  async getMe(userId: string) {
    const user = await userRepository.findById(userId)
    if (!user) throw new NotFoundError('Không tìm thấy người dùng')
    return toUserDto(user)
  },
}
