/**
 * String similarity algorithms for food name matching.
 * No external dependencies — pure TypeScript.
 */

// ── Levenshtein distance ──────────────────────────────────────────────────────
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }
  return dp[m][n]
}

// Normalised similarity 0–1 (1 = identical)
export function levenshteinSimilarity(a: string, b: string): number {
  if (a === b) return 1
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  return 1 - levenshteinDistance(a, b) / maxLen
}

// ── Dice coefficient (bigram) ─────────────────────────────────────────────────
function getBigrams(str: string): Set<string> {
  const bigrams = new Set<string>()
  for (let i = 0; i < str.length - 1; i++) {
    bigrams.add(str.slice(i, i + 2))
  }
  return bigrams
}

export function diceCoefficient(a: string, b: string): number {
  if (a === b) return 1
  if (a.length < 2 || b.length < 2) return 0

  const bigramsA = getBigrams(a)
  const bigramsB = getBigrams(b)

  let intersection = 0
  for (const bigram of bigramsA) {
    if (bigramsB.has(bigram)) intersection++
  }

  return (2 * intersection) / (bigramsA.size + bigramsB.size)
}

// ── Combined score ────────────────────────────────────────────────────────────
/**
 * Combined similarity using Levenshtein + Dice.
 * Weights: 40% Levenshtein, 60% Dice.
 */
export function combinedSimilarity(a: string, b: string): number {
  const lev  = levenshteinSimilarity(a, b)
  const dice = diceCoefficient(a, b)
  return lev * 0.4 + dice * 0.6
}

// ── Token overlap ─────────────────────────────────────────────────────────────
/**
 * Checks if query tokens are a subset of candidate tokens.
 * "pho bo" matches "phở bò tái" because both tokens appear.
 */
export function tokenOverlapScore(query: string, candidate: string): number {
  const qTokens = query.toLowerCase().split(/\s+/)
  const cTokens = candidate.toLowerCase().split(/\s+/)

  let matches = 0
  for (const qt of qTokens) {
    if (cTokens.some(ct => ct.includes(qt) || qt.includes(ct))) {
      matches++
    }
  }
  return matches / qTokens.length
}

// ── Normalize text ────────────────────────────────────────────────────────────
/**
 * Removes Vietnamese diacritics for comparison.
 * "phở" → "pho", "bánh mì" → "banh mi"
 */
export function removeDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
}
