import { describe, it, expect } from 'vitest'
import {
  levenshteinDistance,
  levenshteinSimilarity,
  diceCoefficient,
  combinedSimilarity,
  tokenOverlapScore,
  removeDiacritics,
} from '@utils/food-matching/string-similarity'
import { ALIAS_TO_CANONICAL } from '@utils/food-matching/food-aliases'

describe('removeDiacritics', () => {
  it('strips Vietnamese diacritics', () => {
    expect(removeDiacritics('Phở bò')).toBe('pho bo')
    expect(removeDiacritics('Bánh mì')).toBe('banh mi')
    expect(removeDiacritics('Đường')).toBe('duong')
  })
})

describe('levenshteinDistance / similarity', () => {
  it('returns 0 distance for identical strings', () => {
    expect(levenshteinDistance('pho bo', 'pho bo')).toBe(0)
    expect(levenshteinSimilarity('pho bo', 'pho bo')).toBe(1)
  })

  it('computes similarity close to 1 for near-identical strings', () => {
    const sim = levenshteinSimilarity('pho bo', 'pho bo tai')
    expect(sim).toBeGreaterThan(0.4)
    expect(sim).toBeLessThan(1)
  })
})

describe('diceCoefficient', () => {
  it('returns 1 for identical strings', () => {
    expect(diceCoefficient('banh mi', 'banh mi')).toBe(1)
  })

  it('returns higher score for strings sharing more bigrams', () => {
    const high = diceCoefficient('banh mi thit', 'banh mi')
    const low  = diceCoefficient('banh mi thit', 'pho bo')
    expect(high).toBeGreaterThan(low)
  })
})

describe('combinedSimilarity', () => {
  it('matches "pho bo" against "pho bo tai" with high confidence', () => {
    const sim = combinedSimilarity('pho bo', 'pho bo tai')
    expect(sim).toBeGreaterThan(0.5)
  })
})

describe('tokenOverlapScore', () => {
  it('returns 1.0 when all query tokens are found in candidate', () => {
    const score = tokenOverlapScore('pho bo', 'pho bo tai nam')
    expect(score).toBe(1)
  })

  it('returns 0 for completely unrelated strings', () => {
    const score = tokenOverlapScore('banh mi', 'ca phe sua da')
    expect(score).toBe(0)
  })
})

describe('FOOD_ALIAS_DICTIONARY', () => {
  it('maps "pho" to "Phở bò"', () => {
    expect(ALIAS_TO_CANONICAL.get('pho')).toBe('Phở bò')
  })

  it('maps "banh mi" to "Bánh mì thịt"', () => {
    expect(ALIAS_TO_CANONICAL.get('banh mi')).toBe('Bánh mì thịt')
  })

  it('maps "bubble tea" to the Vietnamese milk tea name', () => {
    expect(ALIAS_TO_CANONICAL.get('bubble tea')).toBe('Trà sữa trân châu đường đen')
  })
})
