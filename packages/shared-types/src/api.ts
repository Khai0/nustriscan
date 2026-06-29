// ─── Standard API envelope ─────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errors?: unknown
}

// ─── Paginated response ────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ─── Query params ──────────────────────────────────────────────────────────
export interface PaginationQuery {
  page?: number
  limit?: number
}
