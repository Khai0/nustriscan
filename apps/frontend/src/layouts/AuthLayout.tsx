import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-primary flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-1/4 -right-16 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-semibold text-white">NutriScan AI</span>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight">
            Biết rõ bạn<br />đang ăn gì.
          </h2>
          <p className="mt-4 text-white/75 text-lg leading-relaxed">
            Chụp ảnh thức ăn và nhận phân tích dinh dưỡng chính xác từ AI trong vài giây.
          </p>

          {/* Feature list */}
          <ul className="mt-10 space-y-3">
            {[
              '🍜 Nhận diện 1000+ món ăn Việt Nam',
              '📊 Theo dõi calo và macro hàng ngày',
              '💪 Tính BMR/TDEE cá nhân hoá',
              '💧 Nhắc nhở uống nước thông minh',
            ].map(f => (
              <li key={f} className="flex items-center gap-2 text-white/85 text-sm">
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-white/50 text-sm">
          © {new Date().getFullYear()} NutriScan AI
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">N</span>
            </div>
            <span className="font-semibold text-foreground">NutriScan AI</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
