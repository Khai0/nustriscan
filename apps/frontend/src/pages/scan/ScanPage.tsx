import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  RefreshCw, ChevronRight, CheckCircle2, AlertCircle,
  Zap, Info, BarChart2,
} from 'lucide-react'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { Progress } from '@components/ui/progress'
import { Separator } from '@components/ui/separator'
import { ImageUploader }   from '@features/scan/components/ImageUploader'
import { ScanProgress }    from '@features/scan/components/ScanProgress'
import { FoodMatchCard }   from '@features/scan/components/FoodMatchCard'
import { MealConfirmModal } from '@features/scan/components/MealConfirmModal'
import { useScan }         from '@features/scan/hooks/useScan'
import { cn } from '@lib/utils'

// ── Confirmed success screen ───────────────────────────────────────────────────
function ConfirmedScreen({ onReset }: { onReset: () => void }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center text-center space-y-5 py-8 animate-bounce-in">
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
        <CheckCircle2 className="h-10 w-10 text-primary" />
      </div>
      <div>
        <h2 className="text-xl font-bold">Đã lưu bữa ăn!</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Bữa ăn đã được ghi nhận vào nhật ký của bạn.
        </p>
      </div>
      <div className="flex gap-3 w-full">
        <Button variant="outline" className="flex-1 gap-2" onClick={onReset}>
          <RefreshCw className="h-4 w-4" /> Quét tiếp
        </Button>
        <Button className="flex-1 gap-2" onClick={() => navigate("/dashboard")}>
          <BarChart2 className="h-4 w-4" /> Xem Dashboard
        </Button>
      </div>
    </div>
  )
}

// ── Error screen ────────────────────────────────────────────────────────────────
function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center text-center space-y-4 py-6 animate-slide-up">
      <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">Có lỗi xảy ra</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">{message}</p>
      </div>
      <Button onClick={onRetry} variant="outline" className="gap-2">
        <RefreshCw className="h-4 w-4" /> Thử lại
      </Button>
    </div>
  )
}

// ── AI result screen ────────────────────────────────────────────────────────────
function ResultScreen({
  state, onSelectFood, onRetake, onOpenConfirm,
}: {
  state:         ReturnType<typeof useScan>["state"]
  onSelectFood:  ReturnType<typeof useScan>["selectFood"]
  onRetake:      () => void
  onOpenConfirm: () => void
}) {
  const { result, selectedFood, preview } = state
  if (!result) return null

  const noMatches = result.matchedFoods.length === 0

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Image + quick stats */}
      {preview && (
        <div className="relative rounded-2xl overflow-hidden">
          <img src={preview} alt="Food" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div>
              {result.topMatch && (
                <>
                  <p className="text-white font-semibold text-lg leading-tight">
                    {result.topMatch.foodName}
                  </p>
                  <p className="text-white/75 text-sm">
                    {Math.round(result.topMatch.confidence * 100)}% độ chính xác
                  </p>
                </>
              )}
            </div>
            <Badge className="bg-black/50 border-white/20 text-white text-xs backdrop-blur">
              {result.aiProvider.replace("_", " ")}
            </Badge>
          </div>
        </div>
      )}

      {/* AI labels */}
      {result.labels.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <Zap className="h-3 w-3" /> AI đã nhận diện
          </p>
          <div className="flex flex-wrap gap-1.5">
            {result.labels.slice(0, 6).map((label, i) => (
              <div key={i} className="flex items-center gap-1 bg-muted rounded-full px-2.5 py-1">
                <span className="text-xs text-foreground">{label.description}</span>
                <span className="text-2xs text-muted-foreground">
                  {Math.round(label.score * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Food matches */}
      {noMatches ? (
        <div className="text-center py-6 space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <Info className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-medium">Không tìm thấy món ăn phù hợp</p>
          <p className="text-sm text-muted-foreground">
            AI chưa nhận diện được món này. Thử chụp ảnh rõ hơn hoặc chọn món từ thư viện.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-semibold">
            Kết quả phù hợp ({result.matchedFoods.length})
          </p>
          {result.matchedFoods.map((match, i) => (
            <FoodMatchCard
              key={match.foodItemId}
              match={match}
              rank={i + 1}
              selected={selectedFood?.foodItemId === match.foodItemId}
              onSelect={() => onSelectFood(match)}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <Button variant="outline" className="flex-1 gap-2" onClick={onRetake}>
          <RefreshCw className="h-4 w-4" /> Quét lại
        </Button>
        <Button
          className="flex-1 gap-2"
          disabled={!selectedFood}
          onClick={onOpenConfirm}
        >
          <CheckCircle2 className="h-4 w-4" />
          Xác nhận
          <ChevronRight className="h-4 w-4 -ml-1" />
        </Button>
      </div>
    </div>
  )
}

// ── Main ScanPage ──────────────────────────────────────────────────────────────
export default function ScanPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const {
    state, handleFile, retake, reset,
    selectFood, confirmScan, isConfirming,
  } = useScan()

  const { step, error } = state

  const isProcessing = ['compressing', 'uploading', 'analyzing'].includes(step)

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Quét món ăn</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Chụp hoặc tải ảnh để AI phân tích dinh dưỡng
        </p>
      </div>

      {/* Main card */}
      <Card>
        <CardContent className="p-5">
          {/* IDLE — show uploader */}
          {step === 'idle' && (
            <ImageUploader onFile={handleFile} />
          )}

          {/* PROCESSING — show progress */}
          {isProcessing && (
            <ScanProgress
              step={step}
              uploadPct={state.uploadPct}
              preview={state.preview}
            />
          )}

          {/* RESULT — show matches */}
          {(step === 'result' || step === 'confirming') && (
            <ResultScreen
              state={state}
              onSelectFood={selectFood}
              onRetake={retake}
              onOpenConfirm={() => setModalOpen(true)}
            />
          )}

          {/* CONFIRMED */}
          {step === 'confirmed' && (
            <ConfirmedScreen onReset={reset} />
          )}

          {/* ERROR */}
          {step === 'error' && error && (
            <ErrorScreen message={error} onRetry={reset} />
          )}
        </CardContent>
      </Card>

      {/* Processing stats */}
      {step === 'result' && state.result && (
        <Card className="border-muted">
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Provider: <span className="font-medium text-foreground">{state.result.aiProvider}</span></span>
              {state.result.processingMs && (
                <span>AI: <span className="font-medium text-foreground">{state.result.processingMs}ms</span></span>
              )}
              <span>Match: <span className="font-medium text-foreground">{state.result.matchingMs}ms</span></span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirm modal */}
      <MealConfirmModal
        open={modalOpen}
        food={state.selectedFood}
        onClose={() => setModalOpen(false)}
        onConfirm={payload => {
          setModalOpen(false)
          confirmScan(payload)
        }}
        isLoading={isConfirming}
      />
    </div>
  )
}
