// ============================================================
// Pagination Utility (Phase 2 — full featured)
// ============================================================

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  from: number   // First item index (1-based)
  to: number     // Last item index
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: PaginationMeta
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const safePage = Math.min(page, totalPages)
  const from = total === 0 ? 0 : (safePage - 1) * limit + 1
  const to = Math.min(safePage * limit, total)
  return {
    page: safePage,
    limit,
    total,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
    from,
    to,
  }
}

export function paginate<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResult<T> {
  return { data, pagination: buildPaginationMeta(page, limit, total) }
}

export function parsePagination(
  query: Record<string, unknown>,
  maxLimit = 100
): { page: number; limit: number; skip: number } {
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(maxLimit, Math.max(1, Number(query.limit) || 20))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

export function getSkip(page: number, limit: number): number {
  return (page - 1) * limit
}
