# TerraWitness AI Pipeline & Semantic Understanding

## 1. Provider Interfaces

To prevent hard vendor lock-in and enable clean fallback behavior, TerraWitness establishes strict provider interfaces:

```typescript
export interface VisionProvider {
  name: string;
  analyzeImage(imageUrlOrBuffer: string | Buffer): Promise<VisionAnalysisResult>;
}

export interface EmbeddingProvider {
  name: string;
  generateEmbedding(text: string): Promise<EmbeddingResult | null>;
}

export interface NarrationProvider {
  name: string;
  synthesizeNarration(script: string): Promise<NarrationResult | null>;
}
```

---

## 2. Auditable Analysis History

Every AI analysis run is stored in the `AnalysisRun` table with complete input and output provenance:

* `inputHash`: SHA-256 of the input media buffer
* `provider`: Active provider name (e.g. `Cloudinary_Asset_API` or `TerraWitness_Deterministic_CV`)
* `model`: Model version string
* `rawResultJson`: Complete unparsed provider response dictionary
* `normalizedResultJson`: Structured tags, bounding boxes, or semantic descriptions
* `confidence`: Statistical score

---

## 3. Traceable Claims Architecture

AI observations never assert absolute legal facts. Every observation includes:
* **Observation**: Natural language finding
* **Source**: Concrete module or provider
* **Confidence**: Numerical indicator
* **Timestamp**: UTC creation time
* **Provider**: Model reference

In the Story Compiler, every claim is cited with an `[EV-XXX]` marker linking directly to the underlying evidence.
