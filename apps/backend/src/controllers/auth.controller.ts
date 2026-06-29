import type { NextFunction, Request, Response } from 'express'
import { authService } from '@services/auth.service'
import { sendSuccess, sendCreated } from '@utils/response'
import { setAuthCookies, clearAuthCookies, extractRefreshToken } from '@utils/cookie.util'
import { generateCsrfToken, clearCsrfToken } from '@middlewares/csrf'
import type {
  RegisterDto, LoginDto, ForgotPasswordDto,
  ResetPasswordDto, ChangePasswordDto,
  VerifyEmailDto, ResendVerificationDto,
} from '@dto/auth/auth.dto'

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await authService.register(req.body as RegisterDto, { userAgent: req.headers['user-agent'], ip: req.ip })
      setAuthCookies(res, data.accessToken, data.refreshToken, false)
      generateCsrfToken(res)
      sendCreated(res, { user: data.user, accessToken: data.accessToken, expiresIn: data.expiresIn },
        'Đăng ký thành công. Vui lòng kiểm tra email để xác minh tài khoản.')
    } catch (err) { next(err) }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as LoginDto
      const data = await authService.login(dto, { userAgent: req.headers['user-agent'], ip: req.ip })
      setAuthCookies(res, data.accessToken, data.refreshToken, dto.rememberMe)
      generateCsrfToken(res)
      sendSuccess(res, { user: data.user, accessToken: data.accessToken, expiresIn: data.expiresIn }, 'Đăng nhập thành công')
    } catch (err) { next(err) }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rt = extractRefreshToken(req)
      await authService.logout(rt)
      clearAuthCookies(res)
      clearCsrfToken(res)
      sendSuccess(res, null, 'Đăng xuất thành công')
    } catch (err) { next(err) }
  },

  async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.logoutAll(req.user!.userId)
      clearAuthCookies(res)
      clearCsrfToken(res)
      sendSuccess(res, null, 'Đã đăng xuất khỏi tất cả thiết bị')
    } catch (err) { next(err) }
  },

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rt = extractRefreshToken(req)
      if (!rt) { res.status(401).json({ success: false, message: 'Refresh token không tìm thấy', data: null }); return }
      const data = await authService.refreshTokens(rt)
      setAuthCookies(res, data.accessToken, data.refreshToken, false)
      generateCsrfToken(res)
      sendSuccess(res, { user: data.user, accessToken: data.accessToken, expiresIn: data.expiresIn }, 'Token đã được làm mới')
    } catch (err) { next(err) }
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, await authService.getMe(req.user!.userId)) }
    catch (err) { next(err) }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.verifyEmail((req.body as VerifyEmailDto).token)
      sendSuccess(res, result, result.message)
    } catch (err) { next(err) }
  },

  async resendVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.resendVerification((req.body as ResendVerificationDto).email)
      sendSuccess(res, null, 'Nếu email tồn tại, link xác minh đã được gửi lại.')
    } catch (err) { next(err) }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.forgotPassword((req.body as ForgotPasswordDto).email)
      sendSuccess(res, null, 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi.')
    } catch (err) { next(err) }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body as ResetPasswordDto
      await authService.resetPassword(token, password)
      sendSuccess(res, null, 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.')
    } catch (err) { next(err) }
  },

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body as ChangePasswordDto
      await authService.changePassword(req.user!.userId, currentPassword, newPassword)
      clearAuthCookies(res)
      sendSuccess(res, null, 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.')
    } catch (err) { next(err) }
  },
}
