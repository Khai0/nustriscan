import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { scanService } from '@services/scan.service'

export const SCAN_KEYS = {
  all: ['scans'] as const,
  history: (page: number) => ['scans', 'history', page] as const,
  detail: (id: string) => ['scans', id] as const,
}

export function useScanHistory(page = 1) {
  return useQuery({
    queryKey: SCAN_KEYS.history(page),
    queryFn: () => scanService.getHistory(page),
  })
}

export function useScanDetail(id: string) {
  return useQuery({
    queryKey: SCAN_KEYS.detail(id),
    queryFn: () => scanService.getScanById(id),
    enabled: Boolean(id),
  })
}

export function useAnalyzeImage() {
  const queryClient = useQueryClient()
  const [uploadProgress, setUploadProgress] = useState(0)

  const mutation = useMutation({
    mutationFn: (file: File) => scanService.analyzeImage(file, setUploadProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCAN_KEYS.all })
      setUploadProgress(0)
    },
    onError: () => {
      setUploadProgress(0)
    },
  })

  return {
    ...mutation,
    uploadProgress,
    analyze: mutation.mutate,
    analyzeAsync: mutation.mutateAsync,
  }
}

export function useDeleteScan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => scanService.deleteScan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCAN_KEYS.all })
    },
  })
}
