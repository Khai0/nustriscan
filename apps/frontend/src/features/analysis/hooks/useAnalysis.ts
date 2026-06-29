import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { analysisApiService } from '../services/analysis.api'
import { toast } from '@hooks/useToast'

export const ANALYSIS_KEYS = {
  daily:      (date?: string) => ['analysis', 'daily', date ?? 'today'] as const,
  weekly:     (ws?: string)   => ['analysis', 'weekly', ws ?? 'current'] as const,
  conditions: ()              => ['analysis', 'conditions'] as const,
}

export function useDailyAnalysis(date?: string) {
  return useQuery({
    queryKey: ANALYSIS_KEYS.daily(date),
    queryFn:  () => analysisApiService.getDaily(date),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export function useWeeklyAnalysis(weekStart?: string) {
  return useQuery({
    queryKey: ANALYSIS_KEYS.weekly(weekStart),
    queryFn:  () => analysisApiService.getWeekly(weekStart),
    staleTime: 10 * 60 * 1000,
    retry: false,
  })
}

export function useHealthConditions() {
  return useQuery({
    queryKey: ANALYSIS_KEYS.conditions(),
    queryFn:  () => analysisApiService.getConditions(),
    staleTime: 30 * 60 * 1000,
  })
}

export function useUpsertCondition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ condition, severity }: { condition: string; severity?: string }) =>
      analysisApiService.upsertCondition(condition, severity),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ANALYSIS_KEYS.conditions() })
      qc.invalidateQueries({ queryKey: ['analysis', 'daily'] })
      toast({ title: 'Đã cập nhật tình trạng sức khoẻ' })
    },
    onError: () => toast({ title: 'Cập nhật thất bại', variant: 'destructive' }),
  })
}

export function useRemoveCondition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (condition: string) => analysisApiService.removeCondition(condition),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ANALYSIS_KEYS.conditions() })
      toast({ title: 'Đã xoá tình trạng sức khoẻ' })
    },
  })
}
