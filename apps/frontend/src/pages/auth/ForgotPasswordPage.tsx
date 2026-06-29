import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@features/auth/schemas/auth.schema'
import { useAuth } from '@hooks/useAuth'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { cn } from '@lib/utils'

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    await forgotPassword.mutateAsync(data.email)
    setSubmittedEmail(data.email)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center space-y-3 py-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Kiểm tra email</h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            Chúng tôi đã gửi link đặt lại mật khẩu đến{' '}
            <span className="font-medium text-foreground">{submittedEmail}</span>.
            Link sẽ hết hạn sau 30 phút.
          </p>
        </div>

        <div className="rounded-lg border bg-muted/40 p-4 space-y-2 text-sm">
          <p className="font-medium">Không nhận được email?</p>
          <ul className="text-muted-foreground space-y-1 list-disc list-inside">
            <li>Kiểm tra thư mục spam / junk mail</li>
            <li>Đảm bảo địa chỉ email chính xác</li>
            <li>Chờ vài phút rồi thử lại</li>
          </ul>
        </div>

        <div className="space-y-2">
          <Button variant="outline" className="w-full" onClick={() => setSubmitted(false)}>
            Thử lại với email khác
          </Button>
          <Link to="/auth/login">
            <Button variant="ghost" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" /> Quay lại đăng nhập
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Quay lại đăng nhập
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Quên mật khẩu?</h1>
        <p className="text-sm text-muted-foreground">
          Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Địa chỉ email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="ban@email.com"
              autoComplete="email"
              autoFocus
              className={cn('pl-9', errors.email && 'border-destructive')}
              {...register('email')}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={forgotPassword.isPending}>
          {forgotPassword.isPending
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang gửi…</>
            : 'Gửi link đặt lại mật khẩu'
          }
        </Button>
      </form>
    </div>
  )
}
