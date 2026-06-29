import type { IAIVisionProvider } from './ai-provider.interface'
import { GoogleVisionProvider } from './google-vision.provider'
import { MockAIProvider }       from './mock-ai.provider'
import { YOLOv8Provider }       from './yolov8.provider'
import { env } from '@config/env'
import { logger } from '@utils/logger'

/**
 * AIProviderFactory — single entry point for the AI vision layer.
 *
 * Reads AI_PROVIDER from env and returns the correct implementation.
 * This is the ONLY place that knows which provider is active.
 *
 * Usage:
 *   const provider = AIProviderFactory.getProvider()
 *   const result   = await provider.detectLabels(buffer, config)
 */
export class AIProviderFactory {
  private static instance: IAIVisionProvider | null = null

  static getProvider(): IAIVisionProvider {
    if (this.instance) return this.instance

    const providerName = env.AI_PROVIDER

    switch (providerName) {
      case 'google_vision':
        this.instance = new GoogleVisionProvider()
        break
      case 'yolov8':
        this.instance = new YOLOv8Provider()
        break
      case 'mock':
      default:
        this.instance = new MockAIProvider()
        break
    }

    logger.info(`🤖 AI provider: ${this.instance.name}`)
    return this.instance
  }

  // Allow resetting in tests
  static reset(): void {
    this.instance = null
  }
}
