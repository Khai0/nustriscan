import type { IAIVisionProvider, AIDetectionResult, AIProviderConfig } from './ai-provider.interface'
import { logger } from '@utils/logger'

/**
 * YOLOv8 custom model provider stub.
 *
 * When ready to switch from Google Vision:
 * 1. Deploy your trained YOLOv8 model as an HTTP inference server
 *    (e.g. using Ultralytics serve, FastAPI, or Triton Inference Server)
 * 2. Set YOLOV8_ENDPOINT in .env
 * 3. Set AI_PROVIDER=yolov8 in .env
 * 4. Implement detectLabels() below — no other code changes needed
 *
 * The abstraction layer (AIProviderFactory) handles the swap.
 */
export class YOLOv8Provider implements IAIVisionProvider {
  readonly name = 'yolov8'

  private readonly endpoint: string

  constructor() {
    this.endpoint = process.env.YOLOV8_ENDPOINT ?? 'http://localhost:8001'
  }

  async detectLabels(imageBuffer: Buffer, config: AIProviderConfig): Promise<AIDetectionResult> {
    const start = Date.now()

    // TODO: Implement when model is ready
    // Example implementation:
    //
    // const formData = new FormData()
    // formData.append('image', new Blob([imageBuffer]), 'food.jpg')
    // formData.append('confidence', config.confidenceThreshold.toString())
    //
    // const response = await fetch(`${this.endpoint}/predict`, {
    //   method: 'POST',
    //   body: formData,
    // })
    // const data = await response.json()
    //
    // return {
    //   labels: data.detections.map(d => ({
    //     description: d.class_name,
    //     score:       d.confidence,
    //     topicality:  d.confidence,
    //   })),
    //   rawResponse:  data,
    //   provider:     this.name,
    //   processingMs: Date.now() - start,
    // }

    logger.warn('YOLOv8 provider not yet implemented — falling back to mock')
    throw new Error('YOLOv8 provider not implemented. Set AI_PROVIDER=google_vision or AI_PROVIDER=mock')
  }
}
