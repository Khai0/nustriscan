import { Outlet, NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Camera, History, User, BarChart2,
  ChevronLeft, ChevronRight, LogOut, Settings, Bell, TrendingUp,
} from 'lucide-react'
import { useAuthStore } from '@store/auth.store'
import { useUIStore }   from '@store/ui.store'
import { useAuth }      from '@hooks/useAuth'
import { EmailVerificationBanner } from '@features/auth/components/EmailVerificationBanner'
import { BottomNavigation } from '@components/layout/BottomNavigation'
import { Avatar, AvatarFallback, AvatarImage, getInitials } from '@components/ui/avatar'
import { SimpleTooltip } from '@components/ui/tooltip'
import { cn } from '@lib/utils'

const navItems = [
  { to: '/dashboard',        icon: LayoutDashboard, label: 'Tổng quan', end: true },
  { to: '/scan',             icon: Camera,          label: 'Quét món ăn' },
  { to: '/history',          icon: History,         label: 'Lịch sử' },
  { to: '/analytics',        icon: BarChart2,       label: 'Thống kê' },
  { to: '/health',           icon: User,            label: 'Hồ sơ sức khoẻ' },
  { to: '/profile',          icon: User,            label: 'Hồ sơ cá nhân' },
  { to: '/settings',         icon: Settings,        label: 'Cài đặt' },
]

export default function DashboardLayout() {
  const { logout } = useAuth()
  const user   = useAuthStore(s => s.user)
  const { isSidebarOpen, toggleSidebar } = useUIStore()

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={cn(
        'hidden md:flex fixed inset-y-0 left-0 z-50 flex-col bg-card border-r border-border transition-all duration-300 ease-smooth',
        isSidebarOpen ? 'w-60' : 'w-16'
      )}>
        <div className="h-16 flex items-center gap-2.5 px-4 border-b border-border shrink-0">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-glow-sm">
            <span className="text-primary-foreground font-bold text-sm">N</span>
          </div>
          {isSidebarOpen && <span className="font-semibold text-foreground truncate animate-fade-in">NutriScan AI</span>}
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto scrollbar-none">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <SimpleTooltip key={to} content={label} side="right" className={isSidebarOpen ? 'hidden' : ''}>
              <NavLink to={to} end={end}
                className={({ isActive }) => cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-glow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}>
                <Icon className="h-4 w-4 shrink-0" />
                {isSidebarOpen && <span className="truncate">{label}</span>}
              </NavLink>
            </SimpleTooltip>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-1 shrink-0">
          {isSidebarOpen && user && (
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={user.avatarUrl ?? ''} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          )}
          <SimpleTooltip content="Đăng xuất" side="right" className={isSidebarOpen ? 'hidden' : ''}>
            <button onClick={() => logout.mutate()} disabled={logout.isPending}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
              <LogOut className="h-4 w-4 shrink-0" />
              {isSidebarOpen && <span>Đăng xuất</span>}
            </button>
          </SimpleTooltip>
        </div>

        <button onClick={toggleSidebar}
          className="absolute -right-3 top-[72px] h-6 w-6 rounded-full bg-background border border-border flex items-center justify-center shadow-sm hover:bg-accent transition-colors z-10">
          {isSidebarOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
      </aside>

      <div className={cn(
        'flex-1 flex flex-col min-h-screen transition-all duration-300 ease-smooth',
        'md:pl-16', isSidebarOpen && 'md:pl-60'
      )}>
        <EmailVerificationBanner />
        <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">N</span>
            </div>
            <span className="font-semibold text-sm">NutriScan AI</span>
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-2">
            <button className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
              <Bell className="h-4.5 w-4.5" />
            </button>
            {user && (
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={user.avatarUrl ?? ''} />
                <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 animate-fade-in">
          <Outlet />
        </main>
      </div>

      <BottomNavigation />
    </div>
  )
}
