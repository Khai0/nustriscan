import type { IAIVisionProvider, AIDetectionResult, AILabel, AIProviderConfig } from './ai-provider.interface'
import { env } from '@config/env'
import { logger } from '@utils/logger'

interface VisionAnnotation {
  description: string
  score:       number
  topicality:  number
  mid?:        string
}

interface VisionApiResponse {
  responses: Array<{
    labelAnnotations?: VisionAnnotation[]
    error?: { code: number; message: string }
  }>
}

/**
 * Google Cloud Vision API provider.
 * Uses REST API (no SDK dependency — works with just an API key).
 *
 * Docs: https://cloud.google.com/vision/docs/labels
 * To replace with YOLOv8: implement IAIVisionProvider with same interface.
 */
export class GoogleVisionProvider implements IAIVisionProvider {
  readonly name = 'google_vision'

  private readonly apiKey: string
  private readonly endpoint = 'https://vision.googleapis.com/v1/images:annotate'

  constructor() {
    this.apiKey = env.GOOGLE_VISION_API_KEY
    if (!this.apiKey) {
      logger.warn('⚠️  GOOGLE_VISION_API_KEY not set — Vision API will fail')
    }
  }

  async detectLabels(imageBuffer: Buffer, config: AIProviderConfig): Promise<AIDetectionResult> {
    const start = Date.now()

    if (!this.apiKey) {
      throw new Error('GOOGLE_VISION_API_KEY is not configured')
    }

    const base64Image = imageBuffer.toString('base64')

    const requestBody = {
      requests: [{
        image: { content: base64Image },
        features: [{
          type:       'LABEL_DETECTION',
          maxResults: config.maxLabels,
        }],
        imageContext: {
          // Hint the model about language context
          languageHints: ['vi', 'en'],
        },
      }],
    }

    const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Google Vision API error ${response.status}: ${errorText}`)
    }

    const data = await response.json() as VisionApiResponse
    const visionResponse = data.responses[0]

    if (visionResponse.error) {
      throw new Error(`Google Vision error: ${visionResponse.error.message}`)
    }

    const annotations = visionResponse.labelAnnotations ?? []

    const labels: AILabel[] = annotations
      .filter(a => a.score >= config.confidenceThreshold)
      .map(a => ({
        description: a.description,
        score:       a.score,
        topicality:  a.topicality ?? a.score,
        mid:         a.mid,
      }))

    logger.info('Google Vision detection complete', {
      labelCount:   labels.length,
      processingMs: Date.now() - start,
      topLabel:     labels[0]?.description,
    })

    return {
      labels,
      rawResponse:  data,
      provider:     this.name,
      processingMs: Date.now() - start,
    }
  }
}
