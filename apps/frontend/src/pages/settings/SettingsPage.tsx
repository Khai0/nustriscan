import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Switch } from '@components/ui/switch'
import { Label } from '@components/ui/label'
import { Separator } from '@components/ui/separator'
import { Badge } from '@components/ui/badge'
import { ChangePasswordForm } from '@features/auth/components/ChangePasswordForm'
import { useAuthStore } from '@store/auth.store'
import { useUIStore } from '@store/ui.store'
import {
  Bell, Moon, Globe, Shield, Trash2, LogOut,
  ChevronRight, User, Lock, Smartphone,
} from 'lucide-react'

export default function SettingsPage() {
  const user  = useAuthStore(s => s.user)
  const { theme, setTheme } = useUIStore()
  const [notifications, setNotifications] = useState({
    meals:   true,
    water:   true,
    weekly:  false,
    tips:    true,
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cài đặt</h1>
        <p className="text-sm text-muted-foreground mt-1">Quản lý tài khoản và tuỳ chỉnh ứng dụng</p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> Tài khoản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <div className="flex items-center gap-2">
              {user?.emailVerified
                ? <Badge variant="success" className="text-xs">Đã xác minh</Badge>
                : <Badge variant="warning" className="text-xs">Chưa xác minh</Badge>
              }
              <Badge variant="secondary" className="text-xs capitalize">{user?.role}</Badge>
            </div>
          </div>
          <Separator />
          <button className="w-full flex items-center justify-between py-2 hover:text-primary transition-colors group">
            <span className="text-sm">Chỉnh sửa thông tin</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          </button>
          <button className="w-full flex items-center justify-between py-2 hover:text-primary transition-colors group">
            <span className="text-sm">Đổi ảnh đại diện</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          </button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Moon className="h-4 w-4" /> Giao diện</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'light',  label: '☀️ Sáng' },
              { value: 'dark',   label: '🌙 Tối' },
              { value: 'system', label: '💻 Hệ thống' },
            ].map(t => (
              <button key={t.value} type="button"
                className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${theme === t.value ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40'}`}
                onClick={() => setTheme(t.value as any)}
              >{t.label}</button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" /> Thông báo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'meals',  label: 'Nhắc nhở bữa ăn',     desc: 'Gợi ý ghi nhận bữa ăn' },
            { key: 'water',  label: 'Nhắc uống nước',       desc: 'Mỗi 2 giờ một lần' },
            { key: 'weekly', label: 'Báo cáo hàng tuần',   desc: 'Tóm tắt tiến trình 7 ngày' },
            { key: 'tips',   label: 'Mẹo dinh dưỡng',      desc: 'Lời khuyên từ AI mỗi ngày' },
          ].map((item, i) => (
            <div key={item.key}>
              {i > 0 && <Separator className="mb-4" />}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium cursor-pointer">{item.label}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <Switch
                  checked={notifications[item.key as keyof typeof notifications]}
                  onCheckedChange={v => setNotifications(n => ({ ...n, [item.key]: v }))}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" /> Bảo mật</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Đổi mật khẩu tài khoản của bạn</p>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-destructive flex items-center gap-2"><Shield className="h-4 w-4" /> Vùng nguy hiểm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Xóa tất cả dữ liệu</p>
              <p className="text-xs text-muted-foreground mt-0.5">Xóa toàn bộ lịch sử bữa ăn và thống kê</p>
            </div>
            <Button variant="outline" size="sm" className="text-destructive border-destructive/40 hover:bg-destructive/10 gap-1.5">
              <Trash2 className="h-3.5 w-3.5" /> Xóa
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Xóa tài khoản</p>
              <p className="text-xs text-muted-foreground mt-0.5">Hành động không thể hoàn tác</p>
            </div>
            <Button variant="destructive" size="sm" className="gap-1.5">
              <Trash2 className="h-3.5 w-3.5" /> Xóa tài khoản
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground pb-4">
        NutriScan AI v1.0.0 · © {new Date().getFullYear()}
      </p>
    </div>
  )
}
