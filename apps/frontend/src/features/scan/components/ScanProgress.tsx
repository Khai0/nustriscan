import { cn } from '@lib/utils'
import type { ScanStep } from '../hooks/useScan'

interface ScanProgressProps {
  step:      ScanStep
  uploadPct: number
  preview:   string | null
}

const STEPS: { key: ScanStep; label: string; sub: string }[] = [
  { key: 'compressing', label: 'Xử lý ảnh',      sub: 'Nén và chuẩn bị' },
  { key: 'uploading',   label: 'Tải lên',          sub: 'Đang gửi ảnh' },
  { key: 'analyzing',   label: 'AI đang nhận diện', sub: 'Google Vision API' },
  { key: 'result',      label: 'Hoàn thành',        sub: 'Đối chiếu dữ liệu' },
]

const stepOrder: ScanStep[] = ['compressing', 'uploading', 'analyzing', 'result']

export function ScanProgress({ step, uploadPct, preview }: ScanProgressProps) {
  const currentIdx = stepOrder.indexOf(step)

  return (
    <div className="space-y-5">
      {/* Image preview with scan overlay */}
      {preview && (
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] max-h-64 bg-black">
          <img src={preview} alt="Scanning" className="w-full h-full object-cover opacity-80" />
          {/* Animated scan line */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-90"
              style={{
                animation: 'scanLine 1.8s ease-in-out infinite',
              }}
            />
            <style>{`
              @keyframes scanLine {
                0%   { top: 10%; opacity: 0 }
                10%  { opacity: 1 }
                90%  { opacity: 1 }
                100% { top: 90%; opacity: 0 }
              }
            `}</style>
          </div>
          {/* Corner markers */}
          {[
            'top-4 left-4',
            'top-4 right-4 rotate-90',
            'bottom-4 left-4 -rotate-90',
            'bottom-4 right-4 rotate-180',
          ].map((cls, i) => (
            <svg key={i} width="24" height="24" viewBox="0 0 24 24" fill="none"
              className={cn('absolute stroke-primary', cls)} strokeWidth="2.5">
              <path d="M4 12V4h8" />
            </svg>
          ))}
        </div>
      )}

      {/* Step indicators */}
      <div className="space-y-3">
        {STEPS.map((s, i) => {
          const done    = i < currentIdx
          const active  = i === currentIdx
          const pending = i > currentIdx

          return (
            <div key={s.key} className={cn(
              'flex items-center gap-3 transition-all duration-300',
              pending && 'opacity-40'
            )}>
              {/* Icon */}
              <div className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300',
                done   && 'bg-primary',
                active && 'bg-primary/20 ring-2 ring-primary ring-offset-2 ring-offset-background',
                pending && 'bg-muted'
              )}>
                {done ? (
                  <svg className="h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : active ? (
                  <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                ) : (
                  <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                )}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium', done || active ? 'text-foreground' : 'text-muted-foreground')}>
                  {s.label}
                </p>
                {active && s.key === 'uploading' && (
                  <p className="text-xs text-primary">{uploadPct}%</p>
                )}
                {active && s.key !== 'uploading' && (
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                )}
              </div>

              {/* Progress bar for upload */}
              {active && s.key === 'uploading' && (
                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${uploadPct}%` }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Provider badge */}
      <div className="flex items-center justify-center gap-2 pt-1">
        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        <p className="text-xs text-muted-foreground">Powered by Google Cloud Vision AI</p>
      </div>
    </div>
  )
}
