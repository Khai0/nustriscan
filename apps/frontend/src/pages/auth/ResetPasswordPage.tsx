import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Lock, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@features/auth/schemas/auth.schema'
import { useAuth } from '@hooks/useAuth'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { cn } from '@lib/utils'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { resetPassword } = useAuth()
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  // Token missing — show error
  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Link không hợp lệ</h1>
          <p className="text-sm text-muted-foreground">
            Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
          </p>
        </div>
        <Link to="/auth/forgot-password">
          <Button className="w-full">Yêu cầu link mới</Button>
        </Link>
      </div>
    )
  }

  const onSubmit = (data: ResetPasswordFormValues) => {
    resetPassword.mutate({ token, password: data.password, confirmPassword: data.confirmPassword })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Đặt lại mật khẩu</h1>
        <p className="text-sm text-muted-foreground">Nhập mật khẩu mới cho tài khoản của bạn.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">Mật khẩu mới</Label>
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
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
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

        <Button type="submit" className="w-full" disabled={resetPassword.isPending}>
          {resetPassword.isPending
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang đặt lại…</>
            : 'Đặt lại mật khẩu'
          }
        </Button>
      </form>
    </div>
  )
}
