import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react'
import { useState } from 'react'
import { registerSchema, type RegisterFormValues } from '@features/auth/schemas/auth.schema'
import { useAuth } from '@hooks/useAuth'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { cn } from '@lib/utils'

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ ký tự',      pass: password.length >= 8 },
    { label: '1 chữ hoa',     pass: /[A-Z]/.test(password) },
    { label: '1 số',          pass: /[0-9]/.test(password) },
    { label: '1 ký tự đặc biệt', pass: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.pass).length
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']
  const labels = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh']

  if (!password) return null

  return (
    <div className="space-y-2 mt-1">
      <div className="flex gap-1">
        {[0,1,2,3].map(i => (
          <div key={i} className={cn('h-1 flex-1 rounded-full transition-all', i < score ? colors[score-1] : 'bg-muted')} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Độ mạnh: <span className="font-medium">{labels[score-1] ?? 'Nhập mật khẩu'}</span></p>
      <div className="grid grid-cols-2 gap-1">
        {checks.map(c => (
          <p key={c.label} className={cn('text-xs flex items-center gap-1', c.pass ? 'text-green-600' : 'text-muted-foreground')}>
            <span>{c.pass ? '✓' : '○'}</span>{c.label}
          </p>
        ))}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const { register: registerUser, isRegistering } = useAuth()
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const password = watch('password')

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Tạo tài khoản</h1>
        <p className="text-sm text-muted-foreground">
          Đã có tài khoản?{' '}
          <Link to="/auth/login" className="text-primary font-medium hover:underline">Đăng nhập</Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(d => registerUser.mutate(d))} noValidate className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Họ và tên</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="name" placeholder="Nguyễn Văn A" autoComplete="name"
              className={cn('pl-9', errors.name && 'border-destructive')} {...register('name')} />
          </div>
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email" type="email" placeholder="ban@email.com" autoComplete="email"
              className={cn('pl-9', errors.email && 'border-destructive')} {...register('email')} />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password">Mật khẩu</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="password" type={showPwd ? 'text' : 'password'} placeholder="Tối thiểu 8 ký tự"
              autoComplete="new-password" className={cn('pl-9 pr-9', errors.password && 'border-destructive')}
              {...register('password')} />
            <button type="button" onClick={() => setShowPwd(p => !p)} tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          <PasswordStrength password={password} />
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="Nhập lại mật khẩu"
              autoComplete="new-password" className={cn('pl-9 pr-9', errors.confirmPassword && 'border-destructive')}
              {...register('confirmPassword')} />
            <button type="button" onClick={() => setShowConfirm(p => !p)} tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isRegistering}>
          {isRegistering ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang đăng ký…</> : 'Tạo tài khoản'}
        </Button>
      </form>

      <p className="text-xs text-center text-muted-foreground">
        Bằng cách đăng ký, bạn đồng ý với{' '}
        <Link to="/terms" className="underline hover:text-foreground">Điều khoản dịch vụ</Link>
        {' '}và{' '}
        <Link to="/privacy" className="underline hover:text-foreground">Chính sách bảo mật</Link>
      </p>
    </div>
  )
}
