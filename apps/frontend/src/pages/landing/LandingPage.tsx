import { Link } from 'react-router-dom'
import { ArrowRight, Camera, BarChart2, Target, Zap, Shield, Apple, Check } from 'lucide-react'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { cn } from '@lib/utils'

// ── Feature card ───────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, color }: { icon: any; title: string; desc: string; color: string }) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
      <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center mb-4', color)}>
        <Icon className="h-6 w-6 text-foreground" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  )
}

// ── Pricing card ───────────────────────────────────────────────────────────────
function PricingCard({ name, price, desc, features, highlighted }: {
  name: string; price: string; desc: string; features: string[]; highlighted?: boolean
}) {
  return (
    <div className={cn(
      'p-7 rounded-2xl border transition-all duration-200',
      highlighted
        ? 'bg-primary text-primary-foreground border-primary shadow-glow scale-[1.02]'
        : 'bg-card border-border hover:shadow-card'
    )}>
      {highlighted && (
        <Badge className="mb-4 bg-primary-foreground/20 text-primary-foreground border-0 text-xs">
          Phổ biến nhất
        </Badge>
      )}
      <h3 className={cn('text-xl font-bold', highlighted ? 'text-primary-foreground' : 'text-foreground')}>{name}</h3>
      <div className="mt-3 mb-1">
        <span className={cn('text-4xl font-bold tabular-nums', highlighted ? 'text-primary-foreground' : 'text-foreground')}>
          {price}
        </span>
        {price !== 'Miễn phí' && (
          <span className={cn('text-sm ml-1', highlighted ? 'text-primary-foreground/75' : 'text-muted-foreground')}>/tháng</span>
        )}
      </div>
      <p className={cn('text-sm mb-6', highlighted ? 'text-primary-foreground/75' : 'text-muted-foreground')}>{desc}</p>
      <ul className="space-y-3 mb-8">
        {features.map(f => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <Check className={cn('h-4 w-4 mt-0.5 shrink-0', highlighted ? 'text-primary-foreground' : 'text-primary')} />
            <span className={highlighted ? 'text-primary-foreground/90' : 'text-foreground/80'}>{f}</span>
          </li>
        ))}
      </ul>
      <Link to="/auth/register">
        <Button
          className={cn('w-full', highlighted ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90' : '')}
          variant={highlighted ? 'secondary' : 'outline'}
        >
          Bắt đầu {highlighted ? 'ngay' : 'miễn phí'}
        </Button>
      </Link>
    </div>
  )
}

// ── Main landing page ──────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur border-b border-border/50">
        <div className="page-container h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shadow-glow-sm">
              <span className="text-primary-foreground font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-foreground">NutriScan AI</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Tính năng</a>
            <a href="#pricing"  className="hover:text-foreground transition-colors">Giá cả</a>
            <a href="#faq"      className="hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth/login">
              <Button variant="ghost" size="sm">Đăng nhập</Button>
            </Link>
            <Link to="/onboarding">
              <Button size="sm" className="gap-1.5 shadow-glow-sm">
                Bắt đầu <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="page-container pt-20 pb-24 text-center">
        <Badge variant="secondary" className="mb-5 gap-1.5 text-xs px-3 py-1.5">
          <Zap className="h-3 w-3 text-primary" /> AI-powered · Hơn 1,000 món Việt Nam
        </Badge>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
          Biết rõ dinh dưỡng{' '}
          <span className="gradient-text">trong mỗi bữa ăn</span>
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Chụp ảnh món ăn và nhận phân tích dinh dưỡng chính xác chỉ trong vài giây. Theo dõi calo, macro, và tiến trình sức khỏe hàng ngày.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link to="/onboarding">
            <Button size="lg" className="gap-2 px-8 h-12 shadow-glow text-base">
              Bắt đầu miễn phí <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/auth/login">
            <Button variant="outline" size="lg" className="h-12 px-8 text-base">
              Xem demo
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-4">Không cần thẻ tín dụng · Miễn phí mãi mãi</p>

        {/* App preview mockup */}
        <div className="mt-16 relative max-w-4xl mx-auto">
          <div className="bg-gradient-to-b from-primary/5 to-transparent rounded-3xl border border-border/50 p-6 shadow-xl">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Calo hôm nay', value: '1,420', unit: 'kcal', color: 'text-calories', bg: 'bg-calories-light' },
                { label: 'Protein',       value: '85',    unit: 'g',    color: 'text-protein',  bg: 'bg-protein-light' },
                { label: 'Nước uống',     value: '1.2',   unit: 'L',    color: 'text-info',     bg: 'bg-info/10' },
              ].map(s => (
                <div key={s.label} className={cn('rounded-2xl p-5 text-center', s.bg)}>
                  <p className={cn('text-3xl font-bold tabular-nums', s.color)}>{s.value}</p>
                  <p className={cn('text-sm font-medium', s.color)}>{s.unit}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-card border border-border p-4 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center text-3xl shrink-0">🍜</div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Phở bò tái — Bữa sáng</p>
                <p className="text-sm text-muted-foreground mt-0.5">450 kcal · P: 28g · C: 52g · F: 12g</p>
              </div>
              <Badge variant="success" className="shrink-0">94% chính xác</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section id="features" className="page-container pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Tất cả những gì bạn cần</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Công cụ theo dõi dinh dưỡng toàn diện, được thiết kế cho người Việt Nam.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard icon={Camera}   title="Nhận diện món ăn AI"     desc="Chụp ảnh và AI tự động nhận diện món ăn với độ chính xác cao, bao gồm 1,000+ món Việt Nam." color="bg-primary/10" />
          <FeatureCard icon={BarChart2} title="Phân tích dinh dưỡng"   desc="Phân tích chi tiết calo, protein, carbs, chất béo, chất xơ, và các vitamin khoáng chất." color="bg-info/10" />
          <FeatureCard icon={Target}   title="Mục tiêu cá nhân hoá"    desc="Tính BMR, TDEE và đề xuất mục tiêu macro dựa trên thông số cơ thể và mục tiêu của bạn." color="bg-success/10" />
          <FeatureCard icon={Zap}      title="Theo dõi thời gian thực" desc="Xem tiến trình dinh dưỡng cập nhật ngay khi bạn ghi nhận bữa ăn mới trong ngày." color="bg-warning/10" />
          <FeatureCard icon={Apple}    title="Thư viện thực phẩm"      desc="Cơ sở dữ liệu thực phẩm Việt Nam phong phú: phở, cơm tấm, bánh mì, bún bò và hàng trăm món khác." color="bg-fats-light" />
          <FeatureCard icon={Shield}   title="Bảo mật tuyệt đối"       desc="Dữ liệu sức khỏe của bạn được mã hoá và bảo vệ. Chúng tôi không bao giờ bán thông tin cá nhân." color="bg-protein-light" />
        </div>
      </section>

      {/* ── Vietnamese foods showcase ───────────────────────────────────── */}
      <section className="bg-muted/40 py-20">
        <div className="page-container text-center">
          <h2 className="text-3xl font-bold mb-4">Hơn 1,000 món Việt Nam</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-10">Dữ liệu dinh dưỡng chính xác từ Viện Dinh dưỡng Quốc gia Việt Nam.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['🍜 Phở bò', '🍱 Cơm tấm', '🥖 Bánh mì', '🍲 Bún bò Huế', '🍣 Gỏi cuốn',
              '🍵 Trà sữa', '☕ Cà phê sữa', '🍜 Bún riêu', '🍛 Hủ tiếu', '🫔 Bánh cuốn'].map(food => (
              <div key={food} className="bg-card border border-border px-4 py-2 rounded-full text-sm font-medium hover:border-primary/50 transition-colors cursor-default">
                {food}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <section id="pricing" className="page-container py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Giá cả đơn giản</h2>
          <p className="text-muted-foreground mt-3">Bắt đầu miễn phí. Nâng cấp khi cần thêm tính năng.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <PricingCard
            name="Miễn phí" price="Miễn phí"
            desc="Dành cho cá nhân mới bắt đầu"
            features={['Quét 5 ảnh/ngày', 'Theo dõi 3 bữa/ngày', 'Thư viện 100 món ăn', 'Báo cáo hàng ngày']}
          />
          <PricingCard
            name="Pro" price="99.000₫" highlighted
            desc="Dành cho người dùng nghiêm túc"
            features={['Quét không giới hạn', 'Theo dõi không giới hạn', 'Thư viện 1,000+ món ăn', 'Phân tích nâng cao', 'Gợi ý AI thông minh', 'Xuất báo cáo PDF']}
          />
          <PricingCard
            name="Gia đình" price="199.000₫"
            desc="Dành cho cả gia đình (4 người)"
            features={['Tất cả tính năng Pro', '4 tài khoản thành viên', 'Bảng điều khiển gia đình', 'Mục tiêu riêng cho mỗi người', 'Hỗ trợ ưu tiên 24/7']}
          />
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="bg-primary py-20 text-center">
        <div className="page-container">
          <h2 className="text-3xl font-bold text-primary-foreground">Bắt đầu hành trình sức khỏe ngay hôm nay</h2>
          <p className="text-primary-foreground/75 mt-3 max-w-lg mx-auto">Hơn 10,000 người dùng đã cải thiện sức khỏe cùng NutriScan AI.</p>
          <Link to="/onboarding" className="inline-block mt-8">
            <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 gap-2 px-10 h-13 text-base font-semibold shadow-lg">
              Đăng ký miễn phí <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background">
        <div className="page-container py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">N</span>
            </div>
            <span className="font-semibold text-sm">NutriScan AI</span>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} NutriScan AI. All rights reserved.</p>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-foreground transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-foreground transition-colors">Liên hệ</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
