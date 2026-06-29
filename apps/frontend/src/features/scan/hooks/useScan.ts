import { useState, useCallback, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { scanApiService, type ScanResult, type FoodMatch, type ConfirmScanPayload } from '../services/scan.api'
import { compressImage, validateImageFile, type CompressResult } from '../services/image.utils'
import { toast } from '@hooks/useToast'

export type ScanStep =
  | 'idle'          // waiting for image
  | 'compressing'   // client-side compression
  | 'uploading'     // sending to backend
  | 'analyzing'     // AI processing
  | 'result'        // matches ready
  | 'confirming'    // user confirming serving size
  | 'confirmed'     // meal saved
  | 'error'         // something failed

export interface ScanState {
  step:         ScanStep
  preview:      string | null     // dataURL for display
  originalFile: File | null
  compressed:   CompressResult | null
  uploadPct:    number            // 0–100
  result:       ScanResult | null
  selectedFood: FoodMatch | null
  error:        string | null
}

export function useScan() {
  const queryClient = useQueryClient()

  const [state, setState] = useState<ScanState>({
    step: 'idle', preview: null, originalFile: null,
    compressed: null, uploadPct: 0, result: null,
    selectedFood: null, error: null,
  })

  const objectUrlRef = useRef<string | null>(null)

  // ── Cleanup ────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setState({
      step: 'idle', preview: null, originalFile: null,
      compressed: null, uploadPct: 0, result: null,
      selectedFood: null, error: null,
    })
  }, [])

  // ── Set error ──────────────────────────────────────────────────────────────
  const setError = useCallback((msg: string) => {
    setState(s => ({ ...s, step: 'error', error: msg }))
  }, [])

  // ── Handle file selected ───────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    const validationError = validateImageFile(file)
    if (validationError) { setError(validationError); return }

    try {
      // Show immediate preview from original file
      const previewUrl = URL.createObjectURL(file)
      objectUrlRef.current = previewUrl
      setState(s => ({ ...s, step: 'compressing', preview: previewUrl, originalFile: file, error: null }))

      // Compress on client
      const compressed = await compressImage(file)
      setState(s => ({ ...s, compressed, preview: compressed.dataUrl }))

      // Auto-proceed to upload
      await doAnalyze(compressed)
    } catch (err: any) {
      setError(err.message ?? 'Lỗi xử lý ảnh')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Analyze mutation ───────────────────────────────────────────────────────
  const analyzeMutation = useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress: (p: number) => void }) =>
      scanApiService.analyzeImage(file, onProgress),
    onSuccess: result => {
      setState(s => ({
        ...s,
        step:         'result',
        result,
        selectedFood: result.topMatch,
        uploadPct:    100,
      }))
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? err.message ?? 'Phân tích thất bại')
    },
  })

  const doAnalyze = async (compressed: CompressResult) => {
    setState(s => ({ ...s, step: 'uploading', uploadPct: 0 }))

    const onProgress = (pct: number) => {
      setState(s => ({
        ...s,
        step:      pct < 100 ? 'uploading' : 'analyzing',
        uploadPct: pct,
      }))
    }

    analyzeMutation.mutate({ file: compressed.file, onProgress })
  }

  // ── Re-analyze with current file ──────────────────────────────────────────
  const retake = useCallback(() => {
    reset()
  }, [reset])

  // ── Select food match ──────────────────────────────────────────────────────
  const selectFood = useCallback((food: FoodMatch) => {
    setState(s => ({ ...s, selectedFood: food, step: 'confirming' }))
  }, [])

  // ── Confirm scan mutation ──────────────────────────────────────────────────
  const confirmMutation = useMutation({
    mutationFn: (payload: ConfirmScanPayload) =>
      scanApiService.confirmScan(state.result!.scanId, payload),
    onSuccess: data => {
      setState(s => ({ ...s, step: 'confirmed' }))
      queryClient.invalidateQueries({ queryKey: ['meals'] })
      queryClient.invalidateQueries({ queryKey: ['scans'] })
      toast({
        title:       `Đã lưu: ${data.confirmedFood}`,
        description: `${Math.round(data.nutrition.calories)} kcal · P: ${Math.round(data.nutrition.protein)}g`,
      })
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? 'Lưu bữa ăn thất bại')
    },
  })

  const confirmScan = useCallback((payload: ConfirmScanPayload) => {
    if (!state.result) return
    confirmMutation.mutate(payload)
  }, [state.result, confirmMutation])

  return {
    state,
    handleFile,
    retake,
    reset,
    selectFood,
    confirmScan,
    isAnalyzing:  analyzeMutation.isPending,
    isConfirming: confirmMutation.isPending,
  }
}
