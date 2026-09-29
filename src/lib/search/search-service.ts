import { db } from "../db";

export interface SearchResultItem {
  assetId: string;
  projectId: string;
  projectName: string;
  assetType: string;
  secureUrl: string;
  captureTimestamp: string | null;
  location: string;
  tags: string[];
  integrityStatus: string;
  reviewStatus: string;
  matchScore: number;
  whyThisMatched: string[];
}

export class SearchService {
  /**
   * Performs semantic & metadata search with explainable match reasons.
   */
  static async searchEvidence(query: string, projectId?: string): Promise<{
    query: string;
    mode: "SEMANTIC_HYBRID" | "METADATA_KEYWORD_FALLBACK";
    totalResults: number;
    results: SearchResultItem[];
    notice?: string;
  }> {
    const trimmed = query.trim().toLowerCase();
    const queryTokens = trimmed.split(/\s+/).filter((t) => t.length > 2);

    const whereClause: Record<string, unknown> = {};
    if (projectId) {
      whereClause.projectId = projectId;
    }

    const assets = await db.evidenceAsset.findMany({
      where: whereClause,
      include: {
        project: {
          select: { id: true, name: true, category: true, description: true },
        },
        reviews: {
          select: { decision: true, reason: true },
        },
      },
    });

    const ranked: SearchResultItem[] = [];

    for (const asset of assets) {
      const whyMatched: string[] = [];
      let score = 0;

      // 1. Tags match
      let tags: string[] = [];
      try {
        if (asset.tagsJson) tags = JSON.parse(asset.tagsJson);
      } catch {
        tags = [];
      }

      for (const token of queryTokens) {
        // Tag hit
        const matchedTag = tags.find((t) => t.toLowerCase().includes(token));
        if (matchedTag) {
          score += 35;
          whyMatched.push(`Visual tag match: "${matchedTag}"`);
        }

        // Project category / name hit
        if (asset.project.category.toLowerCase().includes(token)) {
          score += 25;
          whyMatched.push(`Project category: "${asset.project.category}"`);
        }
        if (asset.project.name.toLowerCase().includes(token)) {
          score += 20;
          whyMatched.push(`Project context: "${asset.project.name}"`);
        }

        // Asset type hit (before, after, progress)
        if (asset.assetType.toLowerCase() === token) {
          score += 15;
          whyMatched.push(`Phase match: "${asset.assetType}"`);
        }

        // Metadata JSON match
        if (asset.metadataJson && asset.metadataJson.toLowerCase().includes(token)) {
          score += 10;
          whyMatched.push(`Technical metadata hit for term "${token}"`);
        }
      }

      // If user queried generic sustainability terms or empty query, show all
      if (queryTokens.length === 0 || score > 0) {
        if (queryTokens.length === 0) {
          score = 10;
          whyMatched.push("Recent asset catalog entry");
        }

        const locationStr =
          asset.gpsLat != null && asset.gpsLon != null
            ? `${asset.gpsLat.toFixed(4)}, ${asset.gpsLon.toFixed(4)}`
            : "Location not recorded";

        ranked.push({
          assetId: asset.id,
          projectId: asset.projectId,
          projectName: asset.project.name,
          assetType: asset.assetType,
          secureUrl: asset.secureUrl,
          captureTimestamp: asset.captureTimestamp ? asset.captureTimestamp.toISOString() : null,
          location: locationStr,
          tags,
          integrityStatus: asset.integrityStatus,
          reviewStatus: asset.reviewStatus,
          matchScore: Math.min(100, score),
          whyThisMatched: Array.from(new Set(whyMatched)),
        });
      }
    }

    // Sort descending by match score
    ranked.sort((a, b) => b.matchScore - a.matchScore);

    return {
      query,
      mode: "METADATA_KEYWORD_FALLBACK",
      totalResults: ranked.length,
      results: ranked,
      notice:
        "External vector embedding provider unconfigured. Utilizing metadata, AI tags, and lexical search with explainable matching.",
    };
  }
}
