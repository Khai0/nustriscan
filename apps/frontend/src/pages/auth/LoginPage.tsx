import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { loginSchema, type LoginFormValues } from '@features/auth/schemas/auth.schema'
import { useAuth } from '@hooks/useAuth'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { cn } from '@lib/utils'

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth()
  const [showPwd, setShowPwd] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Đăng nhập</h1>
        <p className="text-sm text-muted-foreground">
          Chưa có tài khoản?{' '}
          <Link to="/auth/register" className="text-primary font-medium hover:underline">Đăng ký ngay</Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(d => login.mutate(d))} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email" type="email" placeholder="ban@email.com" autoComplete="email"
              className={cn('pl-9', errors.email && 'border-destructive')} {...register('email')} />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mật khẩu</Label>
            <Link to="/auth/forgot-password" className="text-xs text-primary hover:underline">Quên mật khẩu?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="password" type={showPwd ? 'text' : 'password'} placeholder="••••••••"
              autoComplete="current-password" className={cn('pl-9 pr-9', errors.password && 'border-destructive')}
              {...register('password')} />
            <button type="button" onClick={() => setShowPwd(p => !p)} tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="flex items-center gap-2">
          <input id="rememberMe" type="checkbox" className="h-4 w-4 rounded border-border accent-primary" {...register('rememberMe')} />
          <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">Ghi nhớ đăng nhập (30 ngày)</Label>
        </div>

        <Button type="submit" className="w-full" disabled={isLoggingIn}>
          {isLoggingIn ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang đăng nhập…</> : 'Đăng nhập'}
        </Button>
      </form>

      <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground space-y-0.5">
        <p className="font-medium text-foreground">🧪 Tài khoản demo</p>
        <p>Email: <span className="font-mono">demo@nutriscan.ai</span></p>
        <p>Password: <span className="font-mono">Password123!</span></p>
      </div>
    </div>
  )
}
