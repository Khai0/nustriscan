import { useNavigate } from 'react-router-dom'
import { Settings, LogOut, ChevronRight, Award, Activity, BarChart2, Target } from 'lucide-react'
import { Card, CardContent } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage, getInitials } from '@components/ui/avatar'
import { Progress } from '@components/ui/progress'
import { useAuthStore } from '@store/auth.store'
import { useAuth } from '@hooks/useAuth'

const stats = [
  { label: 'Ngày theo dõi', value: '28', icon: Activity },
  { label: 'Bữa ăn',        value: '84', icon: Award },
  { label: 'Chuỗi ngày',    value: '7',  icon: BarChart2 },
]

export default function ProfilePage() {
  const user     = useAuthStore(s => s.user)
  const { logout } = useAuth()
  const navigate   = useNavigate()

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary to-emerald-500" />
        <CardContent className="pt-0 pb-5 px-5">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
              <AvatarImage src={user?.avatarUrl ?? ""} />
              <AvatarFallback className="text-2xl">{getInitials(user?.name ?? "U")}</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" className="gap-2 mb-1" onClick={() => navigate("/settings")}>
              <Settings className="h-3.5 w-3.5" /> Chỉnh sửa
            </Button>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{user?.name}</h1>
              {user?.emailVerified
                ? <Badge variant="success" className="text-xs">Đã xác minh</Badge>
                : <Badge variant="warning" className="text-xs">Chưa xác minh</Badge>
              }
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        {stats.map(s => (
          <Card key={s.label} className="p-4 text-center">
            <s.icon className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold tabular-nums">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Tiến trình mục tiêu</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cân nặng</span>
              <span className="font-medium">70.0 / 68.0 kg</span>
            </div>
            <Progress value={60} className="h-2" />
            <p className="text-xs text-muted-foreground">Còn 2.0 kg để đạt mục tiêu</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-2">
          {[
            { label: "Hồ sơ sức khỏe", icon: Activity,  to: "/health" },
            { label: "Thống kê",        icon: BarChart2, to: "/analytics" },
            { label: "Cài đặt",         icon: Settings,  to: "/settings" },
          ].map(item => (
            <button key={item.to}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-accent transition-colors group"
              onClick={() => navigate(item.to)}
            >
              <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full gap-2 text-destructive hover:text-destructive"
        onClick={() => logout.mutate()} disabled={logout.isPending}>
        <LogOut className="h-4 w-4" /> Đăng xuất
      </Button>
    </div>
  )
}
