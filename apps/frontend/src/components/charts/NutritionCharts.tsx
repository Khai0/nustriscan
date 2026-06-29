'use client'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { memo } from 'react'
import { cn } from '@lib/utils'

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
interface TooltipPayloadItem {
  name: string
  value: number
  color: string
  unit?: string
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-popover border border-border rounded-xl shadow-xl px-3 py-2.5 text-sm">
      {label && <p className="text-xs text-muted-foreground mb-1.5 font-medium">{label}</p>}
      {payload.map((entry: TooltipPayloadItem, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full shrink-0" style={{ background: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold tabular-nums">{entry.value}{entry.unit ?? ''}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Daily Calories Bar Chart ─────────────────────────────────────────────────
interface DailyCaloriesData {
  day: string
  calories: number
  target?: number
}

interface DailyCaloriesChartProps {
  data: DailyCaloriesData[]
  className?: string
  height?: number
}

function DailyCaloriesChartBase({ data, className, height = 200 }: DailyCaloriesChartProps) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.5)', radius: 6 }} />
          {data[0]?.target !== undefined && (
            <Bar dataKey="target" fill="hsl(var(--muted))" radius={[4,4,0,0]} name="Mục tiêu" />
          )}
          <Bar dataKey="calories" radius={[4,4,0,0]} name="Calo" unit=" kcal">
            {data.map((entry, i) => (
              <Cell key={i} fill={
                entry.target && entry.calories > entry.target
                  ? 'hsl(var(--destructive))'
                  : 'hsl(var(--primary))'
              } />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Macro Distribution Pie Chart ────────────────────────────────────────────
interface MacroPieData {
  name: string
  value: number
  color: string
}

function MacroPieChartBase({ data, className, size = 160 }: { data: MacroPieData[]; className?: string; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div className={cn('flex items-center gap-6', className)}>
      <PieChart width={size} height={size}>
        <Pie data={data} cx="50%" cy="50%" innerRadius={size * 0.32} outerRadius={size * 0.46}
          paddingAngle={3} dataKey="value" strokeWidth={0}>
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
        <Tooltip formatter={(v: number) => [`${v}g`, '']} />
      </PieChart>
      <div className="space-y-2 flex-1">
        {data.map((entry, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
              <span className="text-xs text-muted-foreground">{entry.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold tabular-nums">{entry.value}g</span>
              <span className="text-2xs text-muted-foreground">
                {total > 0 ? Math.round((entry.value / total) * 100) : 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Weight Line Chart ────────────────────────────────────────────────────────
interface WeightData { date: string; weight: number; target?: number }

function WeightLineChartBase({ data, className, height = 200 }: { data: WeightData[]; className?: string; height?: number }) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.15} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
          <Tooltip content={<CustomTooltip />} />
          {data[0]?.target !== undefined && (
            <Line dataKey="target" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 3" dot={false} strokeWidth={1.5} name="Mục tiêu" unit=" kg" />
          )}
          <Area dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#weightGrad)" dot={{ r: 3, fill: 'hsl(var(--primary))' }} activeDot={{ r: 5 }} name="Cân nặng" unit=" kg" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Nutrition 7-day stacked bar ──────────────────────────────────────────────
interface NutritionWeekData { day: string; protein: number; carbs: number; fats: number }

function NutritionWeekChartBase({ data, className, height = 200 }: { data: NutritionWeekData[]; className?: string; height?: number }) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={16}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} unit="g" />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.4)', radius: 4 }} />
          <Bar dataKey="carbs"   stackId="a" fill="hsl(var(--macro-carbs))"   name="Carbs"   unit="g" radius={[0,0,0,0]} />
          <Bar dataKey="fats"    stackId="a" fill="hsl(var(--macro-fats))"    name="Chất béo" unit="g" />
          <Bar dataKey="protein" stackId="a" fill="hsl(var(--macro-protein))" name="Protein" unit="g" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Healthy Score Line Chart ─────────────────────────────────────────────────
interface ScorePoint { date: string; score: number | null }

function HealthScoreChartBase({ data, className, height = 180 }: { data: ScorePoint[]; className?: string; height?: number }) {
  const chartData = data.map(d => ({
    day:   new Date(d.date).toLocaleDateString('vi-VN', { weekday: 'short' }),
    score: d.score ?? 0,
    hasData: d.score != null,
  }))

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.25} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          {/* Reference zones */}
          <Area dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#scoreGrad)"
            dot={(props: any) => props.payload.hasData
              ? <circle key={props.key} cx={props.cx} cy={props.cy} r={3} fill="hsl(var(--primary))" />
              : <circle key={props.key} cx={props.cx} cy={props.cy} r={0} />
            }
            activeDot={{ r: 5 }} name="Điểm sức khoẻ" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Meal Frequency Bar Chart ─────────────────────────────────────────────────
interface MealFreqData { label: string; count: number; avgCalories: number }

function MealFrequencyChartBase({ data, className, height = 200 }: { data: MealFreqData[]; className?: string; height?: number }) {
  const colors: Record<string, string> = {
    'Bữa sáng': 'hsl(38,92%,55%)',
    'Bữa trưa': 'hsl(142,71%,40%)',
    'Bữa tối':  'hsl(213,94%,55%)',
    'Bữa phụ':  'hsl(291,64%,60%)',
  }

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value: number, name: string, props: any) => {
              if (name === 'count') return [`${value} bữa`, 'Số lần']
              return [value, name]
            }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload as MealFreqData
              return (
                <div className="bg-popover border border-border rounded-xl shadow-xl px-3 py-2.5 text-sm">
                  <p className="font-medium mb-1">{label}</p>
                  <p className="text-muted-foreground">Số lần: <span className="font-semibold text-foreground">{d.count}</span></p>
                  <p className="text-muted-foreground">TB calo: <span className="font-semibold text-foreground">{d.avgCalories} kcal</span></p>
                </div>
              )
            }}
            cursor={{ fill: 'hsl(var(--muted) / 0.4)', radius: 6 }}
          />
          <Bar dataKey="count" radius={[6,6,0,0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={colors[entry.label] ?? 'hsl(var(--primary))'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}


// ── Memoized exports (Phase 8 perf) ────────────────────────────────────────
export const DailyCaloriesChart = memo(DailyCaloriesChartBase)
export const MacroPieChart = memo(MacroPieChartBase)
export const WeightLineChart = memo(WeightLineChartBase)
export const NutritionWeekChart = memo(NutritionWeekChartBase)
export const HealthScoreChart = memo(HealthScoreChartBase)
export const MealFrequencyChart = memo(MealFrequencyChartBase)
