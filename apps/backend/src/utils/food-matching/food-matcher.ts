import { prisma } from '@config/database'
import type { AILabel } from '@services/ai/ai-provider.interface'
import { ALIAS_TO_CANONICAL } from './food-aliases'
import {
  combinedSimilarity,
  tokenOverlapScore,
  removeDiacritics,
} from './string-similarity'
import { logger } from '@utils/logger'

export interface FoodMatchResult {
  foodItemId:   string
  foodName:     string
  nameEn:       string | null
  confidence:   number   // 0–1 final score
  aiScore:      number   // original AI score
  matchMethod:  'exact' | 'alias' | 'fuzzy' | 'keyword'
  servingSize:  number
  servingUnit:  string
  calories:     number
  protein:      number
  carbohydrates:number
  fat:          number
  fiber:        number
}

interface RankedCandidate {
  foodItemId:   string
  foodName:     string
  nameEn:       string | null
  servingSize:  number
  servingUnit:  string
  calories:     number
  protein:      number
  carbohydrates:number
  fat:          number
  fiber:        number
  matchScore:   number
  matchMethod:  FoodMatchResult['matchMethod']
}

const SCORE_WEIGHTS = {
  exact:   1.0,   // Perfect alias match
  alias:   0.95,  // Alias map match
  fuzzy:   0.80,  // String similarity match
  keyword: 0.70,  // Token overlap match
}

export class FoodMatchingEngine {
  /**
   * Main entry point: given AI labels, return ranked food matches.
   */
  async matchFoods(labels: AILabel[], maxResults = 5): Promise<FoodMatchResult[]> {
    const start = Date.now()

    if (labels.length === 0) return []

    // Load all food items once (cached in production via Redis Phase 6)
    const allFoods = await prisma.foodItem.findMany({
      where:  { isPublic: true },
      select: {
        id: true, name: true, nameEn: true,
        servingSize: true, servingUnit: true,
        calories: true, protein: true, carbohydrates: true, fat: true, fiber: true,
        aliases: { select: { alias: true } },
      },
    })

    const candidates: RankedCandidate[] = []

    for (const label of labels) {
      const rawLabel    = label.description.toLowerCase().trim()
      const normalised  = removeDiacritics(rawLabel)

      for (const food of allFoods) {
        const foodNormal = removeDiacritics(food.name)
        const nameEnNorm = food.nameEn ? removeDiacritics(food.nameEn) : null

        let matchScore  = 0
        let matchMethod: FoodMatchResult['matchMethod'] = 'fuzzy'

        // ── 1. Exact alias dictionary lookup ─────────────────────────────
        const canonicalFromDict = ALIAS_TO_CANONICAL.get(rawLabel)
        if (canonicalFromDict && removeDiacritics(canonicalFromDict) === foodNormal) {
          matchScore  = SCORE_WEIGHTS.exact
          matchMethod = 'exact'
        }

        // ── 2. DB aliases ─────────────────────────────────────────────────
        if (matchScore === 0 && food.aliases.length > 0) {
          const bestAlias = food.aliases.reduce((best, a) => {
            const sim = combinedSimilarity(normalised, removeDiacritics(a.alias))
            return sim > best ? sim : best
          }, 0)
          if (bestAlias > 0.85) {
            matchScore  = bestAlias * SCORE_WEIGHTS.alias
            matchMethod = 'alias'
          }
        }

        // ── 3. Fuzzy similarity (Vietnamese + English names) ──────────────
        if (matchScore === 0) {
          const simVi = combinedSimilarity(normalised, foodNormal)
          const simEn = nameEnNorm ? combinedSimilarity(normalised, nameEnNorm) : 0
          const best  = Math.max(simVi, simEn)
          if (best > 0.55) {
            matchScore  = best * SCORE_WEIGHTS.fuzzy
            matchMethod = 'fuzzy'
          }
        }

        // ── 4. Token overlap (partial keyword match) ──────────────────────
        if (matchScore === 0) {
          const overlapVi = tokenOverlapScore(normalised, foodNormal)
          const overlapEn = nameEnNorm ? tokenOverlapScore(normalised, nameEnNorm) : 0
          const best = Math.max(overlapVi, overlapEn)
          if (best > 0.6) {
            matchScore  = best * SCORE_WEIGHTS.keyword
            matchMethod = 'keyword'
          }
        }

        if (matchScore > 0) {
          // Weight by AI confidence
          const finalScore = matchScore * label.score

          const existing = candidates.findIndex(c => c.foodItemId === food.id)
          if (existing >= 0) {
            if (finalScore > candidates[existing].matchScore) {
              candidates[existing].matchScore  = finalScore
              candidates[existing].matchMethod = matchMethod
            }
          } else {
            candidates.push({
              foodItemId:    food.id,
              foodName:      food.name,
              nameEn:        food.nameEn,
              servingSize:   food.servingSize,
              servingUnit:   food.servingUnit,
              calories:      food.calories,
              protein:       food.protein,
              carbohydrates: food.carbohydrates,
              fat:           food.fat,
              fiber:         food.fiber,
              matchScore:    finalScore,
              matchMethod,
            })
          }
        }
      }
    }

    // Sort by score, deduplicate, take top N
    const results = candidates
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, maxResults)
      .map(c => ({
        foodItemId:    c.foodItemId,
        foodName:      c.foodName,
        nameEn:        c.nameEn,
        confidence:    Math.min(1, c.matchScore),
        aiScore:       labels.find(l => l.description.toLowerCase() === c.foodName.toLowerCase())?.score ?? 0,
        matchMethod:   c.matchMethod,
        servingSize:   c.servingSize,
        servingUnit:   c.servingUnit,
        calories:      c.calories,
        protein:       c.protein,
        carbohydrates: c.carbohydrates,
        fat:           c.fat,
        fiber:         c.fiber,
      }))

    logger.info('Food matching complete', {
      labelCount:   labels.length,
      matchCount:   results.length,
      matchingMs:   Date.now() - start,
      topMatch:     results[0]?.foodName,
      topScore:     results[0]?.confidence,
    })

    return results
  }
}
