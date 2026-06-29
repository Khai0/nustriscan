import { AlertTriangle, Info, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@lib/utils'
import type { HealthAlert } from '../services/analysis.api'

const severityConfig = {
  INFO:    { icon: Info,          bg: 'bg-info/10',        border: 'border-info/30',        text: 'text-info',        label: 'Thông tin' },
  WARNING: { icon: AlertTriangle, bg: 'bg-warning/10',     border: 'border-warning/30',     text: 'text-warning-foreground', label: 'Cảnh báo' },
  DANGER:  { icon: XCircle,       bg: 'bg-destructive/10', border: 'border-destructive/30', text: 'text-destructive', label: 'Nguy hiểm' },
}

function AlertItem({ alert }: { alert: HealthAlert }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = severityConfig[alert.severity]
  const Icon = cfg.icon

  return (
    <div className={cn('rounded-xl border p-3.5 transition-all', cfg.bg, cfg.border)}>
      <button
        type="button"
        className="w-full flex items-start gap-3 text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <Icon className={cn('h-4.5 w-4.5 shrink-0 mt-0.5', cfg.text)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={cn('text-sm font-semibold', cfg.text)}>{alert.title}</p>
            {expanded
              ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            }
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
        </div>
      </button>
      {expanded && (
        <div className="mt-2.5 ml-7 pt-2.5 border-t border-current/10">
          <p className="text-xs text-foreground/80 leading-relaxed">
            💡 {alert.recommendation}
          </p>
        </div>
      )}
    </div>
  )
}

interface AlertListProps {
  alerts:    HealthAlert[]
  className?: string
}

export function AlertList({ alerts, className }: AlertListProps) {
  if (!alerts.length) return (
    <div className={cn('flex items-center gap-2 text-success text-sm py-2', className)}>
      <span>✅</span>
      <span>Không có cảnh báo dinh dưỡng nào hôm nay!</span>
    </div>
  )

  // Sort: DANGER first, then WARNING, then INFO
  const sorted = [...alerts].sort((a, b) => {
    const order = { DANGER: 0, WARNING: 1, INFO: 2 }
    return order[a.severity] - order[b.severity]
  })

  return (
    <div className={cn('space-y-2', className)}>
      {sorted.map(a => <AlertItem key={a.id} alert={a} />)}
    </div>
  )
}
