import { useState } from 'react'
import { AlertCircle, X, Loader2 } from 'lucide-react'
import { useAuthStore } from '@store/auth.store'
import { authApiService } from '@features/auth/services/auth.api'
import { toast } from '@hooks/useToast'

export function EmailVerificationBanner() {
  const user = useAuthStore(s => s.user)
  const [dismissed, setDismissed] = useState(false)
  const [sending, setSending] = useState(false)

  if (!user || user.emailVerified || dismissed) return null

  const handleResend = async () => {
    setSending(true)
    try {
      await authApiService.resendVerification(user.email)
      toast({ title: 'Email xác minh đã được gửi lại', description: 'Kiểm tra hộp thư của bạn.' })
    } catch {
      toast({ title: 'Không thể gửi email', variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-amber-800 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            Email <strong>{user.email}</strong> chưa được xác minh.{' '}
            <button
              onClick={handleResend}
              disabled={sending}
              className="underline font-medium hover:no-underline disabled:opacity-60 inline-flex items-center gap-1"
            >
              {sending ? <><Loader2 className="h-3 w-3 animate-spin" /> Đang gửi…</> : 'Gửi lại email xác minh'}
            </button>
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-600 hover:text-amber-800 shrink-0"
          aria-label="Đóng"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
