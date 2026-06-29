import nodemailer from 'nodemailer'
import { env, isDev } from '@config/env'
import { logger } from '@utils/logger'

// ─── Transporter singleton ────────────────────────────────────────────────────
let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter

  if (isDev && (!env.SMTP_USER || !env.SMTP_PASS)) {
    // Dùng Ethereal (fake SMTP) khi dev không cấu hình SMTP
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: 'ethereal_user', pass: 'ethereal_pass' },
    })
    logger.warn('⚠️  SMTP chưa cấu hình — email sẽ được log ra console')
  } else {
    transporter = nodemailer.createTransport({
      host:   env.SMTP_HOST,
      port:   env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth:   { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
  }

  return transporter
}

// ─── Base HTML template ───────────────────────────────────────────────────────
function baseTemplate(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f4f5;margin:0;padding:0}
    .wrapper{max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)}
    .header{background:linear-gradient(135deg,#16a34a,#22c55e);padding:32px 40px;text-align:center}
    .header h1{color:#fff;margin:0;font-size:22px;font-weight:700}
    .header p{color:rgba(255,255,255,.85);margin:6px 0 0;font-size:14px}
    .body{padding:36px 40px;color:#374151}
    .body p{line-height:1.7;margin:0 0 16px}
    .btn{display:inline-block;background:#16a34a;color:#fff!important;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:600;font-size:15px;margin:8px 0}
    .code{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;font-size:28px;font-weight:700;letter-spacing:6px;color:#15803d;text-align:center;margin:20px 0}
    .footer{padding:20px 40px;background:#f9fafb;text-align:center;color:#9ca3af;font-size:12px}
    .divider{height:1px;background:#f3f4f6;margin:24px 0}
    .warning{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;font-size:13px;color:#92400e}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🥗 NutriScan AI</h1>
      <p>Theo dõi dinh dưỡng thông minh</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} NutriScan AI · Email này được gửi tự động, vui lòng không reply.</p>
    </div>
  </div>
</body>
</html>`
}

// ─── Email senders ────────────────────────────────────────────────────────────

interface SendOptions {
  to: string
  subject: string
  html: string
}

async function send(opts: SendOptions): Promise<void> {
  if (isDev && (!env.SMTP_USER || !env.SMTP_PASS)) {
    logger.info(`📧 [DEV EMAIL] To: ${opts.to} | Subject: ${opts.subject}`)
    logger.debug(`Email HTML:\n${opts.html.replace(/<[^>]+>/g, '')}`)
    return
  }

  try {
    await getTransporter().sendMail({
      from:    env.EMAIL_FROM,
      to:      opts.to,
      subject: opts.subject,
      html:    opts.html,
    })
    logger.info(`📧 Email sent to ${opts.to}: ${opts.subject}`)
  } catch (err) {
    logger.error('Email send failed', { to: opts.to, err })
    throw new Error('Không thể gửi email. Vui lòng thử lại sau.')
  }
}

// Xác minh email
export async function sendEmailVerification(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const link = `${env.FRONTEND_URL}/auth/verify-email?token=${token}`
  const content = `
    <p>Xin chào <strong>${name}</strong>,</p>
    <p>Cảm ơn bạn đã đăng ký NutriScan AI! Vui lòng xác minh địa chỉ email của bạn bằng cách nhấn vào nút bên dưới:</p>
    <p style="text-align:center"><a href="${link}" class="btn">✅ Xác Minh Email</a></p>
    <div class="divider"></div>
    <div class="warning">⏰ Link này sẽ hết hạn sau <strong>${env.EMAIL_VERIFY_EXPIRES_MIN} phút</strong>.</div>
    <p style="margin-top:16px;font-size:13px;color:#6b7280">Nếu bạn không đăng ký, hãy bỏ qua email này.</p>
  `
  await send({ to, subject: '✅ Xác minh email — NutriScan AI', html: baseTemplate('Xác minh email', content) })
}

// Đặt lại mật khẩu
export async function sendPasswordReset(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const link = `${env.FRONTEND_URL}/auth/reset-password?token=${token}`
  const content = `
    <p>Xin chào <strong>${name}</strong>,</p>
    <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
    <p style="text-align:center"><a href="${link}" class="btn">🔑 Đặt Lại Mật Khẩu</a></p>
    <div class="divider"></div>
    <div class="warning">⏰ Link này sẽ hết hạn sau <strong>${env.PASSWORD_RESET_EXPIRES_MIN} phút</strong>.</div>
    <p style="margin-top:16px;font-size:13px;color:#6b7280">Nếu bạn không yêu cầu, hãy bỏ qua email này. Mật khẩu của bạn vẫn an toàn.</p>
  `
  await send({ to, subject: '🔑 Đặt lại mật khẩu — NutriScan AI', html: baseTemplate('Đặt lại mật khẩu', content) })
}

// Thông báo đổi mật khẩu thành công
export async function sendPasswordChangedNotice(to: string, name: string): Promise<void> {
  const content = `
    <p>Xin chào <strong>${name}</strong>,</p>
    <p>Mật khẩu của bạn đã được thay đổi thành công vào lúc <strong>${new Date().toLocaleString('vi-VN')}</strong>.</p>
    <div class="warning">⚠️ Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ hỗ trợ ngay lập tức.</div>
  `
  await send({ to, subject: '🔒 Mật khẩu đã thay đổi — NutriScan AI', html: baseTemplate('Thay đổi mật khẩu', content) })
}

// Cảnh báo tài khoản bị khoá
export async function sendAccountLockedNotice(to: string, name: string, lockedUntil: Date): Promise<void> {
  const content = `
    <p>Xin chào <strong>${name}</strong>,</p>
    <p>Tài khoản của bạn đã bị <strong>tạm khóa</strong> do đăng nhập sai quá nhiều lần.</p>
    <div class="warning">🔒 Tài khoản sẽ được mở khóa lúc <strong>${lockedUntil.toLocaleString('vi-VN')}</strong>.</div>
    <p style="margin-top:16px">Nếu bạn quên mật khẩu, hãy dùng chức năng <a href="${env.FRONTEND_URL}/auth/forgot-password">Quên mật khẩu</a>.</p>
  `
  await send({ to, subject: '🔒 Tài khoản bị tạm khóa — NutriScan AI', html: baseTemplate('Tài khoản bị khóa', content) })
}
