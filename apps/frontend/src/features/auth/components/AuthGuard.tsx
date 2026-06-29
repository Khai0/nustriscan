import { useEffect, useRef } from 'react'
import { useAuthStore } from '@store/auth.store'
import { authApiService } from '@features/auth/services/auth.api'

/**
 * AuthGuard — mount vào App root.
 * Khi app load, nếu token sắp hết hạn thì tự động refresh.
 * Không render gì, chỉ side-effect.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const store        = useAuthStore()
  const hasRefreshed = useRef(false)

  useEffect(() => {
    if (!store.isAuthenticated || hasRefreshed.current) return

    // Nếu token đã hết hạn — thử refresh ngay khi app load
    if (store.isTokenExpired()) {
      hasRefreshed.current = true
      authApiService
        .refresh()
        .then(data => store.setAuth(data.user, data.accessToken, data.expiresIn))
        .catch(() => store.clearAuth())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}
