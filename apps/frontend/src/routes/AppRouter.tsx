import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '@store/auth.store'
import { FullPageSpinner } from '@components/common/FullPageSpinner'

const AuthLayout      = lazy(() => import('@layouts/AuthLayout'))
const DashboardLayout = lazy(() => import('@layouts/DashboardLayout'))

const LandingPage    = lazy(() => import('@pages/landing/LandingPage'))
const OnboardingPage = lazy(() => import('@pages/onboarding/OnboardingPage'))

const LoginPage          = lazy(() => import('@pages/auth/LoginPage'))
const RegisterPage       = lazy(() => import('@pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@pages/auth/ForgotPasswordPage'))
const ResetPasswordPage  = lazy(() => import('@pages/auth/ResetPasswordPage'))
const VerifyEmailPage    = lazy(() => import('@pages/auth/VerifyEmailPage'))

const DashboardPage      = lazy(() => import('@pages/dashboard/DashboardPage'))
const ScanPage           = lazy(() => import('@pages/scan/ScanPage'))
const HistoryPage        = lazy(() => import('@pages/history/HistoryPage'))
const ScanDetailPage     = lazy(() => import('@pages/history/ScanDetailPage'))
const AnalyticsPage      = lazy(() => import('@pages/analytics/AnalyticsPage'))
const DailyAnalysisPage  = lazy(() => import('@pages/analysis/DailyAnalysisPage'))
const WeeklyAnalysisPage = lazy(() => import('@pages/analysis/WeeklyAnalysisPage'))
const HealthProfilePage  = lazy(() => import('@pages/health/HealthProfilePage'))
const ProfilePage        = lazy(() => import('@pages/profile/ProfilePage'))
const SettingsPage       = lazy(() => import('@pages/settings/SettingsPage'))
const NotFoundPage       = lazy(() => import('@pages/NotFoundPage'))

function ProtectedRoute() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />
}
function GuestRoute() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<FullPageSpinner />}>
        <Routes>
          <Route path="/"           element={<LandingPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/auth/login"           element={<LoginPage />} />
              <Route path="/auth/register"        element={<RegisterPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/reset-password"  element={<ResetPasswordPage />} />
            </Route>
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard"          element={<DashboardPage />} />
              <Route path="/scan"               element={<ScanPage />} />
              <Route path="/history"            element={<HistoryPage />} />
              <Route path="/history/:id"        element={<ScanDetailPage />} />
              <Route path="/analytics"          element={<AnalyticsPage />} />
              <Route path="/analytics/daily"    element={<DailyAnalysisPage />} />
              <Route path="/analytics/weekly"   element={<WeeklyAnalysisPage />} />
              <Route path="/health"             element={<HealthProfilePage />} />
              <Route path="/profile"            element={<ProfilePage />} />
              <Route path="/settings"           element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
