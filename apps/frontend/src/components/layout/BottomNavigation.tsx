import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Camera, History, User, BarChart2 } from 'lucide-react'
import { cn } from '@lib/utils'

const items = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Trang chủ' },
  { to: '/history',   icon: History,         label: 'Lịch sử' },
  { to: '/scan',      icon: Camera,          label: 'Quét',  primary: true },
  { to: '/analytics', icon: BarChart2,       label: 'Phân tích' },
  { to: '/profile',   icon: User,            label: 'Hồ sơ' },
]

export function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t border-border pb-safe md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map(({ to, icon: Icon, label, primary }) => (
          <NavLink key={to} to={to} end={to === '/dashboard'}
            className={({ isActive }) => cn(
              'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors tap-none',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}>
            {({ isActive }) => primary ? (
              <div className="flex flex-col items-center gap-0.5">
                <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center transition-all -mt-5 shadow-glow', 'bg-primary')}>
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className={cn('text-2xs font-medium', isActive ? 'text-primary' : 'text-muted-foreground')}>{label}</span>
              </div>
            ) : (
              <>
                <div className={cn('h-8 w-8 rounded-xl flex items-center justify-center transition-all', isActive && 'bg-primary/10')}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-2xs font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
