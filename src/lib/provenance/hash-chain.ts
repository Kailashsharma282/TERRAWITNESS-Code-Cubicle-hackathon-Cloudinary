import crypto from "crypto";
import { canonicalJson } from "./canonical-json";

export const GENESIS_PREVIOUS_HASH = "GENESIS";

export interface ProvenanceEventInput {
  projectId: string;
  assetId?: string | null;
  eventType: string;
  actorId: string;
  actorRole?: string;
  timestamp: Date;
  payload: Record<string, unknown>;
  previousHash: string;
  assetHash?: string;
}

/**
 * Computes the cryptographic event hash using SHA-256 over:
 * previous_event_hash + event_type + canonical_json(payload) + timestamp_utc + actor_id + asset_hash
 */
export function computeEventHash(input: {
  previousHash: string;
  eventType: string;
  payload: Record<string, unknown>;
  timestampUtc: string; // ISO 8601 UTC
  actorId: string;
  assetHash?: string;
}): string {
  const payloadCanonical = canonicalJson(input.payload);
  const normalizedAssetHash = input.assetHash || "NO_ASSET";

  const rawData = [
    input.previousHash,
    input.eventType,
    payloadCanonical,
    input.timestampUtc,
    input.actorId,
    normalizedAssetHash,
  ].join("|");

  return crypto.createHash("sha256").update(rawData, "utf8").digest("hex");
}

export function computeSha256String(data: string): string {
  return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}
