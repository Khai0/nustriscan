import NetInfo from '@react-native-community/netinfo'
import { offlineMealsDB, offlineWaterDB } from './db'
import apiClient from '@lib/api-client'

export type SyncEvent = {
  type: 'start' | 'progress' | 'complete' | 'error'
  total?: number; synced?: number; failed?: number; message?: string
}

type SyncListener = (e: SyncEvent) => void

class MobileSyncEngine {
  private isSyncing = false
  private listeners = new Set<SyncListener>()

  constructor() {
    // Auto-sync when network comes back
    NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        this.sync()
      }
    })
  }

  subscribe(fn: SyncListener) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  private emit(e: SyncEvent) { this.listeners.forEach(l => l(e)) }

  async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch()
    return !!(state.isConnected && state.isInternetReachable)
  }

  async sync(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing) return { synced: 0, failed: 0 }
    if (!(await this.isOnline())) return { synced: 0, failed: 0 }

    this.isSyncing = true
    let synced = 0, failed = 0

    try {
      const [pendingMeals, pendingWater] = await Promise.all([
        offlineMealsDB.getPending(),
        offlineWaterDB.getPending(),
      ])

      const total = pendingMeals.length + pendingWater.length
      if (total === 0) { this.isSyncing = false; return { synced: 0, failed: 0 } }

      this.emit({ type: 'start', total })

      for (const meal of pendingMeals) {
        try {
          await offlineMealsDB.updateStatus(meal.localId, 'syncing')
          const res = await apiClient.post<{ data: { id: string } }>('/meals', {
            mealType: meal.mealType, mealDate: meal.mealDate, notes: meal.notes,
            totalCalories: meal.totalCalories, totalProtein: meal.totalProtein,
            totalCarbohydrates: meal.totalCarbs, totalFat: meal.totalFat, totalFiber: meal.totalFiber,
            items: meal.items,
          })
          await offlineMealsDB.updateStatus(meal.localId, 'synced', res.data.data.id)
          synced++
        } catch (err: any) {
          await offlineMealsDB.updateStatus(meal.localId, 'failed', undefined, err.message)
          failed++
        }
        this.emit({ type: 'progress', total, synced, failed })
      }

      for (const water of pendingWater) {
        try {
          const res = await apiClient.post<{ data: { id: string } }>('/water', {
            amount: water.amount, logDate: water.logDate,
          })
          await offlineWaterDB.updateStatus(water.localId, 'synced', res.data.data.id)
          synced++
        } catch {
          await offlineWaterDB.updateStatus(water.localId, 'failed')
          failed++
        }
        this.emit({ type: 'progress', total, synced, failed })
      }

      this.emit({ type: 'complete', total, synced, failed,
        message: `Đã đồng bộ ${synced}/${total} mục` })

      return { synced, failed }
    } catch (err: any) {
      this.emit({ type: 'error', message: err.message })
      return { synced, failed }
    } finally {
      this.isSyncing = false
    }
  }

  get syncing() { return this.isSyncing }
}

export const syncEngine = new MobileSyncEngine()
