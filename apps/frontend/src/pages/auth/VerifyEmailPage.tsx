import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@hooks/useAuth'
import { Button } from '@components/ui/button'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { verifyEmail } = useAuth()

  useEffect(() => {
    if (token && !verifyEmail.isPending && !verifyEmail.isSuccess && !verifyEmail.isError) {
      verifyEmail.mutate(token)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  if (!token) {
    return (
      <div className="text-center space-y-4 py-4">
        <XCircle className="mx-auto h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">Link không hợp lệ</h1>
        <p className="text-sm text-muted-foreground">Không tìm thấy token xác minh.</p>
        <Link to="/auth/login"><Button className="w-full">Về trang đăng nhập</Button></Link>
      </div>
    )
  }

  if (verifyEmail.isPending) {
    return (
      <div className="text-center space-y-4 py-8">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <h1 className="text-xl font-semibold">Đang xác minh email…</h1>
      </div>
    )
  }

  if (verifyEmail.isSuccess) {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Email đã xác minh!</h1>
          <p className="text-sm text-muted-foreground">
            Tài khoản của bạn đã được kích hoạt đầy đủ. Chào mừng đến với NutriScan AI!
          </p>
        </div>
        <Link to="/dashboard"><Button className="w-full">Vào Dashboard</Button></Link>
      </div>
    )
  }

  return (
    <div className="text-center space-y-6 py-4">
      <div className="flex flex-col items-center gap-3">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Xác minh thất bại</h1>
        <p className="text-sm text-muted-foreground">
          {(verifyEmail.error as any)?.response?.data?.message ?? 'Link không hợp lệ hoặc đã hết hạn.'}
        </p>
      </div>
      <div className="space-y-2">
        <Link to="/auth/login"><Button className="w-full">Đăng nhập</Button></Link>
      </div>
    </div>
  )
}
