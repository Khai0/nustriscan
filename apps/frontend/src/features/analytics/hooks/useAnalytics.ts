import { useQuery } from '@tanstack/react-query'
import { analyticsApiService, type PeriodType } from '../services/analytics.api'

export const ANALYTICS_KEYS = {
  period:        (t: PeriodType) => ['analytics', 'period', t] as const,
  trends:        (t: PeriodType) => ['analytics', 'trends', t] as const,
  mealFreq:      (d: number)     => ['analytics', 'meal-frequency', d] as const,
  weightTrend:   (d: number)     => ['analytics', 'weight-trend', d] as const,
  insights:      ()              => ['analytics', 'insights'] as const,
  streak:        ()              => ['analytics', 'streak'] as const,
  stats:         ()              => ['analytics', 'stats'] as const,
  achievements:  ()              => ['analytics', 'achievements'] as const,
  challenges:    ()              => ['analytics', 'challenges'] as const,
}

export function usePeriodSummary(type: PeriodType) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.period(type),
    queryFn:  () => analyticsApiService.getPeriodSummary(type),
    staleTime: 5 * 60 * 1000,
  })
}

export function useTrends(type: PeriodType) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.trends(type),
    queryFn:  () => analyticsApiService.getTrends(type),
    staleTime: 5 * 60 * 1000,
  })
}

export function useMealFrequency(days = 7) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.mealFreq(days),
    queryFn:  () => analyticsApiService.getMealFrequency(days),
    staleTime: 10 * 60 * 1000,
  })
}

export function useWeightTrend(days = 30) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.weightTrend(days),
    queryFn:  () => analyticsApiService.getWeightTrend(days),
    staleTime: 10 * 60 * 1000,
  })
}

export function useSmartInsights() {
  return useQuery({
    queryKey: ANALYTICS_KEYS.insights(),
    queryFn:  () => analyticsApiService.getInsights(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useStreak() {
  return useQuery({
    queryKey: ANALYTICS_KEYS.streak(),
    queryFn:  () => analyticsApiService.getStreak(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useUserStats() {
  return useQuery({
    queryKey: ANALYTICS_KEYS.stats(),
    queryFn:  () => analyticsApiService.getStats(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useAchievements() {
  return useQuery({
    queryKey: ANALYTICS_KEYS.achievements(),
    queryFn:  () => analyticsApiService.getAchievements(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useChallenges() {
  return useQuery({
    queryKey: ANALYTICS_KEYS.challenges(),
    queryFn:  () => analyticsApiService.getChallenges(),
    staleTime: 5 * 60 * 1000,
  })
}
