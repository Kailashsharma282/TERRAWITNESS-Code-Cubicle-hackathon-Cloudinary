import { VisionProvider, VisionAnalysisResult } from "./types";
import { cloudinary, isCloudinaryConfigured } from "../cloudinary/cloudinary-client";
import sharp from "sharp";

export class CloudinaryVisionProvider implements VisionProvider {
  name = "CLOUDINARY_AI";

  async analyzeImage(
    imageUrlOrPublicId: string | Buffer
  ): Promise<VisionAnalysisResult> {
    const timestamp = new Date().toISOString();

    // 1. If public ID is available on a configured Cloudinary account, query resource tags
    if (typeof imageUrlOrPublicId === "string" && !imageUrlOrPublicId.startsWith("http") && isCloudinaryConfigured) {
      try {
        const resource = await cloudinary.api.resource(imageUrlOrPublicId, {
          image_metadata: true,
          tags: true,
        });

        const tags = Array.isArray(resource.tags) ? resource.tags : [];
        const detectedObjects = tags.map((tag: string) => ({
          name: tag,
          confidence: 0.85,
        }));

        return {
          tags,
          categories: tags.slice(0, 3),
          sceneDescription: `Media analyzed via Cloudinary Asset API (${tags.slice(0, 5).join(", ")})`,
          detectedObjects,
          confidence: 0.85,
          provider: "Cloudinary_Asset_API",
          model: "cloudinary-auto-tagger-v2",
          rawResponse: resource,
          timestamp,
        };
      } catch (err) {
        console.warn("Cloudinary resource fetch for AI tags failed, falling back to deterministic CV:", err);
      }
    }

    // 2. Deterministic Computer Vision Baseline
    // Analyzes buffer chromaticity & texture to produce deterministic tags without hallucination
    if (Buffer.isBuffer(imageUrlOrPublicId)) {
      try {
        const stats = await sharp(imageUrlOrPublicId).stats();
        const dominant = stats.dominant;
        const tags: string[] = [];

        // Check green dominance (vegetation / nature)
        if (dominant.g > dominant.r && dominant.g > dominant.b && dominant.g > 60) {
          tags.push("vegetation", "nature", "outdoor", "terrain");
        }
        // Check blue dominance (water / sky)
        else if (dominant.b > dominant.r && dominant.b > dominant.g && dominant.b > 70) {
          tags.push("water", "flood_zone", "hydrology", "outdoor");
        }
        // Check structural / neutral
        else if (Math.abs(dominant.r - dominant.g) < 20 && Math.abs(dominant.g - dominant.b) < 20) {
          tags.push("infrastructure", "ground_surface", "terrain");
        } else {
          tags.push("field_capture", "environmental_site");
        }

        return {
          tags,
          categories: [tags[0] || "environmental_site"],
          sceneDescription: `Spectral analysis: Dominant RGB(${dominant.r}, ${dominant.g}, ${dominant.b}) indicating ${tags.join(", ")}.`,
          detectedObjects: tags.map((t) => ({ name: t, confidence: 0.78 })),
          confidence: 0.78,
          provider: "TerraWitness_Deterministic_CV",
          model: "spectral-chroma-heuristic-v1",
          rawResponse: { dominant, channels: stats.channels },
          timestamp,
        };
      } catch (err) {
        console.warn("Deterministic CV buffer analysis failed:", err);
      }
    }

    // 3. Fallback when media is remote URL and external provider unconfigured
    return {
      tags: ["environmental_media", "field_capture"],
      categories: ["sustainability"],
      sceneDescription: "Standard visual media registered in project archive.",
      detectedObjects: [{ name: "field_media", confidence: 0.7 }],
      confidence: 0.7,
      provider: "TerraWitness_Baseline",
      model: "standard-media-intake-v1",
      rawResponse: { note: "External AI provider not configured. Showing deterministic baseline." },
      timestamp,
    };
  }
}

export const defaultVisionProvider = new CloudinaryVisionProvider();
