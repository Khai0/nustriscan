import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { changePasswordSchema, type ChangePasswordFormValues } from '@features/auth/schemas/auth.schema'
import { useAuth } from '@hooks/useAuth'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { cn } from '@lib/utils'

export function ChangePasswordForm() {
  const { changePassword } = useAuth()
  const [show, setShow] = useState({ current: false, new: false, confirm: false })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const onSubmit = async (data: ChangePasswordFormValues) => {
    await changePassword.mutateAsync({
      currentPassword: data.currentPassword,
      newPassword:     data.newPassword,
      confirmPassword: data.confirmPassword,
    })
    reset()
  }

  type ShowKey = 'current' | 'new' | 'confirm'
  const toggle = (k: ShowKey) => setShow(s => ({ ...s, [k]: !s[k] }))

  const fields: { key: ShowKey; id: string; label: string; name: keyof ChangePasswordFormValues; autoComplete: string }[] = [
    { key: 'current', id: 'currentPassword', label: 'Mật khẩu hiện tại', name: 'currentPassword', autoComplete: 'current-password' },
    { key: 'new',     id: 'newPassword',     label: 'Mật khẩu mới',      name: 'newPassword',     autoComplete: 'new-password' },
    { key: 'confirm', id: 'confirmPassword', label: 'Xác nhận mật khẩu mới', name: 'confirmPassword', autoComplete: 'new-password' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 max-w-md">
      {fields.map(f => (
        <div key={f.key} className="space-y-1.5">
          <Label htmlFor={f.id}>{f.label}</Label>
          <div className="relative">
            <Input
              id={f.id}
              type={show[f.key] ? 'text' : 'password'}
              autoComplete={f.autoComplete}
              className={cn('pr-9', errors[f.name] && 'border-destructive')}
              {...register(f.name)}
            />
            <button
              type="button"
              onClick={() => toggle(f.key)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show[f.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors[f.name] && (
            <p className="text-xs text-destructive">{errors[f.name]?.message}</p>
          )}
        </div>
      ))}

      <Button type="submit" disabled={changePassword.isPending}>
        {changePassword.isPending
          ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang đổi…</>
          : 'Đổi mật khẩu'
        }
      </Button>
    </form>
  )
}
