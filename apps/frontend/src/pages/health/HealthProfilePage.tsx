import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Activity, Target, Flame, Weight, ChevronDown, Save, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import { Badge } from '@components/ui/badge'
import { StatCard } from '@components/common/StatCard'

const schema = z.object({
  gender:        z.enum(['MALE', 'FEMALE', 'OTHER']),
  birthDate:     z.string().min(1),
  height:        z.coerce.number().positive().max(300),
  weight:        z.coerce.number().positive().max(500),
  targetWeight:  z.coerce.number().positive().optional(),
  activityLevel: z.enum(['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'ATHLETE']),
  goalType:      z.enum(['WEIGHT_LOSS', 'MAINTENANCE', 'MUSCLE_GAIN']),
})
type FormValues = z.infer<typeof schema>

const activityOptions = [
  { value: 'SEDENTARY', label: 'Ít vận động', desc: 'Văn phòng, ít đi lại' },
  { value: 'LIGHT',     label: 'Nhẹ',         desc: 'Tập 1–3 ngày/tuần' },
  { value: 'MODERATE',  label: 'Vừa',         desc: 'Tập 3–5 ngày/tuần' },
  { value: 'ACTIVE',    label: 'Nhiều',        desc: 'Tập 6–7 ngày/tuần' },
  { value: 'ATHLETE',   label: 'Vận động viên',desc: 'Tập 2 lần/ngày' },
]

const goalOptions = [
  { value: 'WEIGHT_LOSS',  label: '🏃 Giảm cân',   desc: 'Thâm hụt 500 kcal/ngày' },
  { value: 'MAINTENANCE',  label: '⚖️ Duy trì',    desc: 'Ổn định cân nặng' },
  { value: 'MUSCLE_GAIN',  label: '💪 Tăng cơ',    desc: 'Dư thừa 300 kcal/ngày' },
]

// Mock calculated metrics
const metrics = { bmr: 1649, tdee: 2556, calorieTarget: 2056, protein: 180, carbs: 205, fat: 57 }

export default function HealthProfilePage() {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      gender: 'MALE', birthDate: '1993-05-15',
      height: 170, weight: 70, targetWeight: 68,
      activityLevel: 'MODERATE', goalType: 'MAINTENANCE',
    },
  })

  const onSubmit = async (data: FormValues) => {
    await new Promise(r => setTimeout(r, 800))
    console.log('Health profile saved:', data)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hồ sơ sức khỏe</h1>
        <p className="text-sm text-muted-foreground mt-1">Cập nhật thông tin để tính toán mục tiêu chính xác</p>
      </div>

      {/* Current metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard title="BMR" value={metrics.bmr} unit="kcal" icon={Flame} iconColor="text-calories" iconBg="bg-calories-light" subtitle="Khi nghỉ ngơi" />
        <StatCard title="TDEE" value={metrics.tdee} unit="kcal" icon={Activity} iconColor="text-primary" iconBg="bg-primary/10" subtitle="Tiêu thụ/ngày" />
        <StatCard title="Mục tiêu calo" value={metrics.calorieTarget} unit="kcal" icon={Target} iconColor="text-success" iconBg="bg-success/10" className="col-span-2 md:col-span-1" />
      </div>

      {/* Macro targets */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Mục tiêu macro/ngày</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label:'Protein', value:metrics.protein, unit:'g', color:'text-protein', bg:'bg-protein-light' },
              { label:'Carbs',   value:metrics.carbs,   unit:'g', color:'text-carbs',   bg:'bg-carbs-light' },
              { label:'Chất béo',value:metrics.fat,     unit:'g', color:'text-fats',    bg:'bg-fats-light' },
            ].map(m => (
              <div key={m.label} className={`rounded-xl ${m.bg} p-3 text-center`}>
                <p className={`text-2xl font-bold tabular-nums ${m.color}`}>{m.value}</p>
                <p className={`text-xs font-medium ${m.color} opacity-75`}>{m.unit}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Thông tin cá nhân</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Gender */}
            <div className="space-y-1.5">
              <Label>Giới tính</Label>
              <div className="flex gap-2">
                {[{v:'MALE',l:'Nam'},{v:'FEMALE',l:'Nữ'},{v:'OTHER',l:'Khác'}].map(g => (
                  <button key={g.v} type="button"
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${watch('gender')===g.v ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50'}`}
                    onClick={() => setValue('gender', g.v as any)}
                  >{g.l}</button>
                ))}
              </div>
            </div>

            {/* Birth date */}
            <div className="space-y-1.5">
              <Label htmlFor="birthDate">Ngày sinh</Label>
              <Input id="birthDate" type="date" {...register('birthDate')} className={errors.birthDate ? 'border-destructive' : ''} />
            </div>

            {/* Height + Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="height">Chiều cao (cm)</Label>
                <Input id="height" type="number" placeholder="170" {...register('height')} className={errors.height ? 'border-destructive' : ''} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="weight">Cân nặng (kg)</Label>
                <Input id="weight" type="number" placeholder="70" step="0.1" {...register('weight')} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="targetWeight">Cân nặng mục tiêu (kg)</Label>
              <Input id="targetWeight" type="number" placeholder="68" step="0.1" {...register('targetWeight')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Mục tiêu & hoạt động</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Goal type */}
            <div className="space-y-1.5">
              <Label>Mục tiêu</Label>
              <div className="space-y-2">
                {goalOptions.map(g => (
                  <button key={g.value} type="button"
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${watch('goalType')===g.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                    onClick={() => setValue('goalType', g.value as any)}
                  >
                    <div>
                      <p className="text-sm font-medium">{g.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{g.desc}</p>
                    </div>
                    {watch('goalType')===g.value && <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0"><div className="h-2 w-2 rounded-full bg-primary-foreground" /></div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity level */}
            <div className="space-y-1.5">
              <Label>Mức độ hoạt động</Label>
              <Select defaultValue="MODERATE" onValueChange={v => setValue('activityLevel', v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activityOptions.map(a => (
                    <SelectItem key={a.value} value={a.value}>
                      <div>
                        <span className="font-medium">{a.label}</span>
                        <span className="text-muted-foreground ml-2 text-xs">{a.desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Đang lưu…</> : <><Save className="h-4 w-4" />Lưu hồ sơ</>}
        </Button>
      </form>
    </div>
  )
}
