export interface VisionAnalysisResult {
  tags: string[];
  categories: string[];
  sceneDescription?: string;
  detectedObjects: Array<{
    name: string;
    confidence: number;
    boundingBox?: { x: number; y: number; width: number; height: number };
  }>;
  confidence: number;
  provider: string;
  model: string;
  rawResponse: Record<string, unknown>;
  timestamp: string;
}

export interface VisionProvider {
  name: string;
  analyzeImage(imageUrlOrBuffer: string | Buffer): Promise<VisionAnalysisResult>;
}

export interface EmbeddingResult {
  vector: number[];
  dimensions: number;
  provider: string;
  model: string;
  rawResponse?: Record<string, unknown>;
}

export interface EmbeddingProvider {
  name: string;
  generateEmbedding(text: string): Promise<EmbeddingResult | null>;
}

export interface NarrationResult {
  audioUrl?: string;
  durationSeconds?: number;
  subtitles?: Array<{ start: number; end: number; text: string }>;
  provider: string;
  rawResponse?: Record<string, unknown>;
}

export interface NarrationProvider {
  name: string;
  synthesizeNarration(script: string): Promise<NarrationResult | null>;
}
