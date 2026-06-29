// ============================================================
// AI Provider Abstraction Layer
// Swap Google Vision ↔ YOLOv8 ↔ Mock without touching
// higher-level code. All providers implement this interface.
// ============================================================

export interface AILabel {
  description: string   // Raw label from AI e.g. "Pho", "Noodle soup"
  score:       number   // Confidence 0–1
  topicality:  number   // Relevance 0–1 (Google Vision specific, normalized for others)
  mid?:        string   // Google Knowledge Graph ID (optional)
}

export interface AIDetectionResult {
  labels:       AILabel[]
  rawResponse:  unknown           // Full provider response stored for debugging
  provider:     string
  processingMs: number
}

export interface AIProviderConfig {
  maxLabels:           number
  confidenceThreshold: number
}

/**
 * All AI vision providers must implement this interface.
 * This is the single seam for swapping providers.
 */
export interface IAIVisionProvider {
  readonly name: string
  detectLabels(imageBuffer: Buffer, config: AIProviderConfig): Promise<AIDetectionResult>
}
