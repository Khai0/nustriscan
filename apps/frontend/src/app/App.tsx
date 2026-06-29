import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@lib/query-client'
import { AppRouter } from '@routes/AppRouter'
import { Toaster } from '@components/ui/toaster'
import { AuthGuard } from '@features/auth/components/AuthGuard'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard>
        <AppRouter />
        <Toaster />
      </AuthGuard>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
