import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@store/auth.store'
import { authApiService } from '@features/auth/services/auth.api'
import { toast } from '@hooks/useToast'
import type { LoginFormValues, RegisterFormValues } from '@features/auth/schemas/auth.schema'

export function useAuth() {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const store       = useAuthStore()

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn:  () => authApiService.getMe(),
    enabled:  store.isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormValues) => authApiService.login(data),
    onSuccess: data => {
      store.setAuth(data.user, data.accessToken, data.expiresIn)
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      toast({ title: 'Đăng nhập thành công' })
      navigate('/dashboard', { replace: true })
    },
    onError: (err: any) => {
      toast({ title: err?.response?.data?.message ?? 'Đăng nhập thất bại', variant: 'destructive' })
    },
  })

  const registerMutation = useMutation({
    mutationFn: ({ confirmPassword: _, ...data }: RegisterFormValues) => authApiService.register(data),
    onSuccess: data => {
      store.setAuth(data.user, data.accessToken, data.expiresIn)
      toast({ title: 'Đăng ký thành công!', description: 'Vui lòng kiểm tra email để xác minh tài khoản.' })
      navigate('/dashboard', { replace: true })
    },
    onError: (err: any) => {
      toast({ title: err?.response?.data?.message ?? 'Đăng ký thất bại', variant: 'destructive' })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => authApiService.logout(),
    onSettled: () => {
      store.clearAuth()
      queryClient.clear()
      navigate('/auth/login', { replace: true })
    },
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authApiService.forgotPassword(email),
    onSuccess: () => toast({ title: 'Email đã được gửi', description: 'Kiểm tra hộp thư và làm theo hướng dẫn.' }),
    onError: (err: any) => toast({ title: err?.response?.data?.message ?? 'Có lỗi xảy ra', variant: 'destructive' }),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, password, confirmPassword }: { token: string; password: string; confirmPassword: string }) =>
      authApiService.resetPassword(token, password, confirmPassword),
    onSuccess: () => {
      toast({ title: 'Đặt lại mật khẩu thành công', description: 'Vui lòng đăng nhập lại.' })
      navigate('/auth/login', { replace: true })
    },
    onError: (err: any) => toast({ title: err?.response?.data?.message ?? 'Có lỗi xảy ra', variant: 'destructive' }),
  })

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
      authApiService.changePassword(data.currentPassword, data.newPassword, data.confirmPassword),
    onSuccess: () => {
      toast({ title: 'Đổi mật khẩu thành công', description: 'Vui lòng đăng nhập lại.' })
      store.clearAuth()
      queryClient.clear()
      navigate('/auth/login', { replace: true })
    },
    onError: (err: any) => toast({ title: err?.response?.data?.message ?? 'Có lỗi xảy ra', variant: 'destructive' }),
  })

  const verifyEmailMutation = useMutation({
    mutationFn: (token: string) => authApiService.verifyEmail(token),
    onSuccess: () => {
      toast({ title: 'Email đã được xác minh!' })
      if (store.user) store.setUser({ ...store.user, emailVerified: true })
    },
    onError: (err: any) => toast({ title: err?.response?.data?.message ?? 'Xác minh thất bại', variant: 'destructive' }),
  })

  return {
    user: store.user, isAuthenticated: store.isAuthenticated,
    isAdmin: store.user?.role === 'ADMIN',
    emailVerified: store.user?.emailVerified ?? false,
    login: loginMutation, register: registerMutation, logout: logoutMutation,
    forgotPassword: forgotPasswordMutation, resetPassword: resetPasswordMutation,
    changePassword: changePasswordMutation, verifyEmail: verifyEmailMutation,
    meQuery,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  }
}
