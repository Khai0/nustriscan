import { describe, it, expect } from 'vitest'
import { xpToLevel, levelToXpRequired, nextLevelXp, ACHIEVEMENT_DEFS, CHALLENGE_POOL } from '@services/analytics/gamification.service'

describe('xpToLevel / levelToXpRequired', () => {
  it('level 1 requires 0 XP', () => {
    expect(levelToXpRequired(1)).toBe(0)
    expect(xpToLevel(0)).toBe(1)
  })

  it('level 2 requires 100 XP', () => {
    expect(levelToXpRequired(2)).toBe(100)
    expect(xpToLevel(100)).toBe(2)
  })

  it('level 5 requires 1600 XP', () => {
    expect(levelToXpRequired(5)).toBe(1600)
  })

  it('xpToLevel is monotonically non-decreasing', () => {
    let prev = xpToLevel(0)
    for (let xp = 0; xp <= 5000; xp += 50) {
      const lvl = xpToLevel(xp)
      expect(lvl).toBeGreaterThanOrEqual(prev)
      prev = lvl
    }
  })
})

describe('nextLevelXp', () => {
  it('returns progress info consistent with current level', () => {
    const info = nextLevelXp(150)
    expect(info.level).toBe(xpToLevel(150))
    expect(info.needed).toBeGreaterThan(150)
  })
})

describe('ACHIEVEMENT_DEFS', () => {
  it('contains exactly 13 unique achievements', () => {
    expect(ACHIEVEMENT_DEFS).toHaveLength(13)
    const ids = new Set(ACHIEVEMENT_DEFS.map(a => a.id))
    expect(ids.size).toBe(13)
  })

  it('every achievement has a positive XP reward and valid rarity', () => {
    const validRarities = ['common', 'rare', 'epic', 'legendary']
    for (const a of ACHIEVEMENT_DEFS) {
      expect(a.xp).toBeGreaterThan(0)
      expect(validRarities).toContain(a.rarity)
      expect(a.title.length).toBeGreaterThan(0)
    }
  })
})

describe('CHALLENGE_POOL', () => {
  it('contains 8 challenge templates with positive targets and rewards', () => {
    expect(CHALLENGE_POOL).toHaveLength(8)
    for (const c of CHALLENGE_POOL) {
      expect(c.targetValue).toBeGreaterThan(0)
      expect(c.rewardXp).toBeGreaterThan(0)
      expect(c.metric.length).toBeGreaterThan(0)
    }
  })
})
