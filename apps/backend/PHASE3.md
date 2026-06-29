# NutriScan AI — Phase 3: Enterprise Authentication

## Những gì đã thêm trong Phase 3

### Backend

| File | Mô tả |
|------|-------|
| `prisma/schema.prisma` | Thêm `UserRole`, `TokenType` enums; mở rộng `User`; thêm `AuthToken` model |
| `src/config/env.ts` | Thêm cookie, CSRF, SMTP, lockout config |
| `src/utils/token/auth-token.util.ts` | Tạo/xác minh/xoá one-time tokens |
| `src/utils/email/email.service.ts` | Nodemailer + 4 HTML email templates |
| `src/utils/jwt.ts` | JWT payload thêm `role` field |
| `src/utils/cookie.util.ts` | Set/clear httpOnly auth cookies |
| `src/middlewares/csrf.ts` | CSRF token generation + validation |
| `src/middlewares/authenticate.ts` | JWT từ header hoặc cookie |
| `src/middlewares/rbac.ts` | `requireRole()`, `requireAdmin`, `requireOwnerOrAdmin()` |
| `src/middlewares/rateLimiter.ts` | Granular limiters: global, auth, forgotPassword, resend |
| `src/repositories/user.repository.ts` | Thêm lockout, email verification, password update |
| `src/services/auth.service.ts` | Toàn bộ auth flows Phase 3 |
| `src/controllers/auth.controller.ts` | 10 endpoints với cookie + CSRF |
| `src/routes/auth.routes.ts` | Routes đầy đủ với rate limiters |
| `src/app.ts` | Thêm cookie-parser, nâng cấp Helmet |

### Frontend

| File | Mô tả |
|------|-------|
| `src/store/auth.store.ts` | Thêm `expiresAt`, `isTokenExpired()` |
| `src/lib/axios.ts` | withCredentials, CSRF header, silent refresh |
| `src/hooks/useAuth.ts` | Đầy đủ 7 mutations |
| `src/features/auth/schemas/auth.schema.ts` | Zod schemas cho tất cả form |
| `src/features/auth/services/auth.api.ts` | API calls layer |
| `src/features/auth/components/AuthGuard.tsx` | Auto-refresh token khi app load |
| `src/features/auth/components/EmailVerificationBanner.tsx` | Banner nhắc xác minh email |
| `src/features/auth/components/ChangePasswordForm.tsx` | Form đổi mật khẩu |
| `src/pages/auth/LoginPage.tsx` | Login với rememberMe |
| `src/pages/auth/RegisterPage.tsx` | Register với password strength meter |
| `src/pages/auth/ForgotPasswordPage.tsx` | Forgot password với success state |
| `src/pages/auth/ResetPasswordPage.tsx` | Reset với token từ URL |
| `src/pages/auth/VerifyEmailPage.tsx` | Auto-verify từ URL token |
| `src/routes/AppRouter.tsx` | ProtectedRoute, GuestRoute, AdminRoute |
| `src/layouts/DashboardLayout.tsx` | Sidebar + EmailVerificationBanner |

---

## API Endpoints Phase 3

```
POST  /api/auth/register              Đăng ký + gửi email xác minh
POST  /api/auth/login                 Đăng nhập (set httpOnly cookie)
POST  /api/auth/logout                Đăng xuất (xoá cookie + revoke token)
POST  /api/auth/logout-all            Đăng xuất tất cả thiết bị  [auth]
POST  /api/auth/refresh               Refresh access token (từ cookie hoặc body)
GET   /api/auth/me                    Lấy thông tin user hiện tại  [auth]

POST  /api/auth/verify-email          Xác minh email từ token
POST  /api/auth/resend-verification   Gửi lại email xác minh

POST  /api/auth/forgot-password       Yêu cầu đặt lại mật khẩu
POST  /api/auth/reset-password        Đặt lại mật khẩu từ token
POST  /api/auth/change-password       Đổi mật khẩu  [auth + CSRF]
```

---

## Security Features

### 1. Account Lockout
- Sai mật khẩu **5 lần** → tài khoản bị khoá **15 phút**
- Gửi email cảnh báo khi bị khoá
- Cấu hình qua `MAX_FAILED_LOGINS` và `LOCKOUT_DURATION_MIN`

### 2. JWT + Refresh Token Rotation
- Access token: **15 phút** (httpOnly cookie + Authorization header)
- Refresh token: **7 ngày** (30 ngày nếu rememberMe)
- Mỗi lần refresh → revoke token cũ, cấp token mới
- Tất cả refresh tokens lưu DB → có thể revoke từng thiết bị

### 3. CSRF Protection
- Backend sinh `csrf_token` cookie (JS-readable) sau khi login
- Client đọc cookie và gắn vào `x-csrf-token` header
- Backend so sánh constant-time (`crypto.timingSafeEqual`)
- Chỉ áp dụng cho các mutation endpoints (POST/PUT/PATCH/DELETE)

### 4. Secure Cookies
```
httpOnly: true      ← JS không đọc được access/refresh token
secure: true        ← Chỉ gửi qua HTTPS (production)
sameSite: lax       ← CSRF protection cơ bản
domain: your.domain ← Giới hạn domain (production)
```

### 5. Rate Limiting
| Endpoint | Window | Max requests |
|----------|--------|--------------|
| Login / Register | 15 phút | 10 lần |
| Forgot password | 1 giờ | 5 lần |
| Resend verification | 15 phút | 3 lần |
| Global | 15 phút | 100 lần |

### 6. RBAC (Role-Based Access Control)
```typescript
// Chỉ USER và ADMIN
router.get('/data', authenticate, requireUser, handler)

// Chỉ ADMIN
router.get('/admin', authenticate, requireAdmin, handler)

// Chỉ chủ sở hữu hoặc ADMIN
router.patch('/users/:id', authenticate, requireOwnerOrAdmin(req => req.params.id), handler)
```

### 7. Email Verification
- Gửi email ngay sau khi đăng ký
- Token hết hạn sau 60 phút
- One-time use (đánh dấu `usedAt` sau khi dùng)
- Tự động xóa tokens cũ khi tạo mới

### 8. Password Security
- bcrypt **12 rounds** (≈ 250ms/hash)
- Yêu cầu: 8+ ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt
- Sau khi đổi mật khẩu → revoke tất cả refresh tokens

---

## Setup Phase 3

### Bước 1: Cập nhật .env
```bash
# Thêm vào apps/backend/.env:
COOKIE_SECRET=your_32_char_secret_here_change_me_now
CSRF_SECRET=another_32_char_secret_here_change_me
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASS=your_app_password

FRONTEND_URL=http://localhost:3000
MAX_FAILED_LOGINS=5
LOCKOUT_DURATION_MIN=15
```

### Bước 2: Chạy migration
```bash
npm run db:migrate
# Tạo thêm: auth_tokens table, UserRole enum, TokenType enum
# Thêm vào users: role, emailVerified, failedLoginCount, lockedUntil, lastLoginAt
```

### Bước 3: Seed lại
```bash
npm run db:seed
# Demo: demo@nutriscan.ai / Password123!
```

### Bước 4: Chạy
```bash
npm run dev
```

---

## Gmail SMTP Setup (nhanh nhất)

1. Bật **2-Factor Authentication** trên Google Account
2. Vào **App Passwords** → tạo password cho "Mail"
3. Dùng password đó làm `SMTP_PASS`

Dev không cần SMTP — email sẽ được **log ra console**.

---

## Test các luồng auth

### Đăng ký mới
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"Test123!"}'
# → Nhận accessToken, cookie được set, email xác minh được log
```

### Đăng nhập
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -c cookies.txt -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@nutriscan.ai","password":"Password123!"}'
```

### Refresh token (dùng cookie)
```bash
curl -X POST http://localhost:8000/api/auth/refresh \
  -b cookies.txt -c cookies.txt
```

### Test account lockout
```bash
# Đăng nhập sai 5 lần → tài khoản bị khoá
for i in {1..6}; do
  curl -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"demo@nutriscan.ai","password":"wrongpass"}'
  echo ""
done
```

### Forgot password
```bash
curl -X POST http://localhost:8000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@nutriscan.ai"}'
# → Token được log ra console trong dev mode
```
