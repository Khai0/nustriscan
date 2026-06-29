import type { IAIVisionProvider, AIDetectionResult, AIProviderConfig } from './ai-provider.interface'
import { logger } from '@utils/logger'

// Mock labels simulating realistic Google Vision responses for Vietnamese food
const MOCK_LABEL_SETS: Record<string, Array<{ description: string; score: number }>> = {
  default: [
    { description: 'Pho',         score: 0.95 },
    { description: 'Noodle soup', score: 0.92 },
    { description: 'Beef noodle', score: 0.88 },
    { description: 'Vietnamese cuisine', score: 0.85 },
    { description: 'Rice noodle', score: 0.82 },
  ],
  rice: [
    { description: 'Broken rice', score: 0.93 },
    { description: 'Grilled pork', score: 0.90 },
    { description: 'Vietnamese rice dish', score: 0.87 },
    { description: 'Com tam',     score: 0.84 },
  ],
  sandwich: [
    { description: 'Banh mi',     score: 0.96 },
    { description: 'Baguette',    score: 0.91 },
    { description: 'Vietnamese sandwich', score: 0.88 },
    { description: 'Street food', score: 0.80 },
  ],
  coffee: [
    { description: 'Coffee',      score: 0.97 },
    { description: 'Iced coffee', score: 0.94 },
    { description: 'Vietnamese coffee', score: 0.90 },
    { description: 'Ca phe sua',  score: 0.85 },
  ],
  spring_roll: [
    { description: 'Spring rolls', score: 0.94 },
    { description: 'Goi cuon',    score: 0.91 },
    { description: 'Fresh rolls', score: 0.88 },
    { description: 'Vietnamese appetizer', score: 0.82 },
  ],
}

/**
 * Mock AI provider for development.
 * Returns realistic-looking label data without calling any external API.
 * To activate: set AI_PROVIDER=mock in .env
 */
export class MockAIProvider implements IAIVisionProvider {
  readonly name = 'mock'

  async detectLabels(imageBuffer: Buffer, config: AIProviderConfig): Promise<AIDetectionResult> {
    const start = Date.now()

    // Simulate network latency
    await new Promise(r => setTimeout(r, 400 + Math.random() * 300))

    // Pick a random mock set to simulate variety
    const keys   = Object.keys(MOCK_LABEL_SETS)
    const setKey = keys[Math.floor(Math.random() * keys.length)]
    const rawSet = MOCK_LABEL_SETS[setKey]

    const labels = rawSet
      .slice(0, config.maxLabels)
      .filter(l => l.score >= config.confidenceThreshold)
      .map(l => ({
        description: l.description,
        score:       l.score,
        topicality:  l.score * 0.95,
      }))

    const processingMs = Date.now() - start

    logger.info('[Mock AI] Detection complete', {
      mockSet: setKey, labelCount: labels.length, processingMs,
    })

    return {
      labels,
      rawResponse:  { mock: true, set: setKey, labels: rawSet },
      provider:     this.name,
      processingMs,
    }
  }
}
