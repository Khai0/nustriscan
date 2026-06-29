import apiClient from '@lib/axios'
import type { ApiResponse, ScanResult, ScanHistory } from '@nutriscan/shared-types'

export const scanService = {
  /**
   * Upload an image for AI nutrition analysis.
   * Uses multipart/form-data.
   */
  analyzeImage: async (
    file: File,
    onUploadProgress?: (progress: number) => void
  ): Promise<ScanResult> => {
    const formData = new FormData()
    formData.append('image', file)

    const response = await apiClient.post<ApiResponse<ScanResult>>('/scans/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: event => {
        if (onUploadProgress && event.total) {
          const progress = Math.round((event.loaded * 100) / event.total)
          onUploadProgress(progress)
        }
      },
    })
    return response.data.data
  },

  getHistory: async (page = 1, limit = 20): Promise<ScanHistory> => {
    const response = await apiClient.get<ApiResponse<ScanHistory>>('/scans/history', {
      params: { page, limit },
    })
    return response.data.data
  },

  getScanById: async (id: string): Promise<ScanResult> => {
    const response = await apiClient.get<ApiResponse<ScanResult>>(`/scans/${id}`)
    return response.data.data
  },

  deleteScan: async (id: string): Promise<void> => {
    await apiClient.delete(`/scans/${id}`)
  },
}
