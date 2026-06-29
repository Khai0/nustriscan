import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { cn } from '@lib/utils'

// ── Step schemas ───────────────────────────────────────────────────────────────
const step1Schema = z.object({ name: z.string().min(2) })
const step2Schema = z.object({
  gender:    z.enum(['MALE', 'FEMALE', 'OTHER']),
  birthDate: z.string().min(1),
  height:    z.coerce.number().min(100).max(250),
  weight:    z.coerce.number().min(30).max(300),
})
const step3Schema = z.object({ goalType: z.enum(['WEIGHT_LOSS', 'MAINTENANCE', 'MUSCLE_GAIN']) })
const step4Schema = z.object({ activityLevel: z.enum(['SEDENTARY','LIGHT','MODERATE','ACTIVE','ATHLETE']) })

type Step1 = z.infer<typeof step1Schema>
type Step2 = z.infer<typeof step2Schema>
type Step3 = z.infer<typeof step3Schema>
type Step4 = z.infer<typeof step4Schema>

// ── Step data ──────────────────────────────────────────────────────────────────
const goals = [
  { value:'WEIGHT_LOSS',  emoji:'🏃', title:'Giảm cân',   desc:'Giảm 0.5 kg/tuần một cách bền vững' },
  { value:'MAINTENANCE',  emoji:'⚖️', title:'Duy trì',    desc:'Giữ vóc dáng và sức khỏe hiện tại' },
  { value:'MUSCLE_GAIN',  emoji:'💪', title:'Tăng cơ',    desc:'Xây dựng khối cơ và sức mạnh' },
]
const activities = [
  { value:'SEDENTARY', emoji:'🪑', title:'Ít vận động',     desc:'Công việc văn phòng, ít đi lại' },
  { value:'LIGHT',     emoji:'🚶', title:'Vận động nhẹ',    desc:'Tập nhẹ 1–3 ngày/tuần' },
  { value:'MODERATE',  emoji:'🏊', title:'Vận động vừa',    desc:'Tập vừa 3–5 ngày/tuần' },
  { value:'ACTIVE',    emoji:'🏋️', title:'Vận động nhiều',  desc:'Tập nặng 6–7 ngày/tuần' },
  { value:'ATHLETE',   emoji:'🏅', title:'Vận động viên',   desc:'Luyện tập 2 lần/ngày' },
]

// ── Step indicator ─────────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={cn(
          'h-1.5 rounded-full transition-all duration-300',
          i < current ? 'bg-primary w-6' : i === current ? 'bg-primary w-10' : 'bg-muted w-6'
        )} />
      ))}
    </div>
  )
}

// ── Card option ────────────────────────────────────────────────────────────────
function OptionCard({
  selected, onClick, emoji, title, desc,
}: { selected: boolean; onClick: () => void; emoji: string; title: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-150',
        selected
          ? 'border-primary bg-primary/5 shadow-glow-sm'
          : 'border-border hover:border-primary/40 hover:bg-accent/30'
      )}
    >
      <div className={cn(
        'h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-all',
        selected ? 'bg-primary/10' : 'bg-muted'
      )}>
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <div className={cn(
        'h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all',
        selected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
      )}>
        {selected && <Check className="h-3 w-3 text-primary-foreground" />}
      </div>
    </button>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const navigate  = useNavigate()
  const [step, setStep]     = useState(0)
  const [data, setData]     = useState<Partial<Step1 & Step2 & Step3 & Step4>>({})
  const [saving, setSaving] = useState(false)

  // Step 1 form
  const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema), defaultValues: { name: data.name ?? '' } })
  const form2 = useForm<Step2>({ resolver: zodResolver(step2Schema), defaultValues: { gender:'MALE', birthDate:'', height:170, weight:70, ...data } })
  const [goal, setGoal]     = useState<string>(data.goalType ?? '')
  const [activity, setActivity] = useState<string>(data.activityLevel ?? '')

  const totalSteps = 4

  const next = async () => {
    if (step === 0) {
      const ok = await form1.trigger()
      if (!ok) return
      setData(d => ({ ...d, ...form1.getValues() }))
    }
    if (step === 1) {
      const ok = await form2.trigger()
      if (!ok) return
      setData(d => ({ ...d, ...form2.getValues() }))
    }
    if (step === 2) {
      if (!goal) return
      setData(d => ({ ...d, goalType: goal as Step3['goalType'] }))
    }
    if (step === 3) {
      if (!activity) return
      const finalData = { ...data, activityLevel: activity as Step4['activityLevel'] }
      setSaving(true)
      await new Promise(r => setTimeout(r, 1200))
      setSaving(false)
      navigate('/dashboard')
      return
    }
    setStep(s => s + 1)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        {step > 0 ? (
          <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" /> Quay lại
          </button>
        ) : <div />}
        <StepIndicator current={step} total={totalSteps} />
        <p className="text-xs text-muted-foreground">{step + 1}/{totalSteps}</p>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-4 max-w-lg mx-auto w-full">

        {/* Step 0 — Welcome + Name */}
        {step === 0 && (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center py-6">
              <div className="text-6xl mb-4">🥗</div>
              <h1 className="text-2xl font-bold">Chào mừng đến với NutriScan AI!</h1>
              <p className="text-muted-foreground mt-2">Hãy cùng thiết lập hồ sơ của bạn để bắt đầu hành trình sức khỏe.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Bạn tên gì?</Label>
              <Input
                id="name"
                placeholder="Nguyễn Văn A"
                autoFocus
                className={cn('h-12 text-base', form1.formState.errors.name && 'border-destructive')}
                {...form1.register('name')}
              />
              {form1.formState.errors.name && (
                <p className="text-xs text-destructive">Tên phải có ít nhất 2 ký tự</p>
              )}
            </div>
          </div>
        )}

        {/* Step 1 — Body metrics */}
        {step === 1 && (
          <div className="space-y-5 animate-slide-up">
            <div>
              <h2 className="text-xl font-bold">Thông tin cơ thể</h2>
              <p className="text-sm text-muted-foreground mt-1">Giúp chúng tôi tính toán chỉ số phù hợp với bạn.</p>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label>Giới tính</Label>
              <div className="flex gap-2">
                {[{v:'MALE',l:'Nam 👨'},{v:'FEMALE',l:'Nữ 👩'},{v:'OTHER',l:'Khác'}].map(g => (
                  <button key={g.v} type="button"
                    className={cn('flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all', form2.watch('gender')===g.v ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40')}
                    onClick={() => form2.setValue('gender', g.v as any)}
                  >{g.l}</button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Ngày sinh</Label>
              <Input id="birthDate" type="date" className="h-11" {...form2.register('birthDate')} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Chiều cao (cm)</Label>
                <Input type="number" placeholder="170" className="h-11" {...form2.register('height')} />
                {form2.formState.errors.height && <p className="text-xs text-destructive">Không hợp lệ</p>}
              </div>
              <div className="space-y-2">
                <Label>Cân nặng (kg)</Label>
                <Input type="number" placeholder="70" step="0.1" className="h-11" {...form2.register('weight')} />
                {form2.formState.errors.weight && <p className="text-xs text-destructive">Không hợp lệ</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Goal */}
        {step === 2 && (
          <div className="space-y-4 animate-slide-up">
            <div>
              <h2 className="text-xl font-bold">Mục tiêu của bạn là gì?</h2>
              <p className="text-sm text-muted-foreground mt-1">Chúng tôi sẽ tính toán kế hoạch dinh dưỡng phù hợp.</p>
            </div>
            <div className="space-y-3">
              {goals.map(g => (
                <OptionCard key={g.value} selected={goal === g.value} onClick={() => setGoal(g.value)}
                  emoji={g.emoji} title={g.title} desc={g.desc} />
              ))}
            </div>
            {!goal && <p className="text-xs text-destructive text-center">Vui lòng chọn mục tiêu</p>}
          </div>
        )}

        {/* Step 3 — Activity */}
        {step === 3 && (
          <div className="space-y-4 animate-slide-up">
            <div>
              <h2 className="text-xl font-bold">Mức độ hoạt động?</h2>
              <p className="text-sm text-muted-foreground mt-1">Ảnh hưởng đến lượng calo tiêu thụ hàng ngày (TDEE).</p>
            </div>
            <div className="space-y-2">
              {activities.map(a => (
                <OptionCard key={a.value} selected={activity === a.value} onClick={() => setActivity(a.value)}
                  emoji={a.emoji} title={a.title} desc={a.desc} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="px-5 pb-8 pt-4 max-w-lg mx-auto w-full">
        <Button
          className="w-full h-13 text-base gap-2 shadow-glow"
          onClick={next}
          disabled={saving}
        >
          {saving ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Đang thiết lập…</>
          ) : step === totalSteps - 1 ? (
            <><Check className="h-5 w-5" /> Bắt đầu ngay!</>
          ) : (
            <>Tiếp theo <ChevronRight className="h-5 w-5" /></>
          )}
        </Button>

        {step === 0 && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Đã có tài khoản?{' '}
            <button className="text-primary hover:underline" onClick={() => navigate('/auth/login')}>
              Đăng nhập
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
