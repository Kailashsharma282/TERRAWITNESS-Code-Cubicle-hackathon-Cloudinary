import { db } from "../db";
import { computeEventHash, GENESIS_PREVIOUS_HASH } from "./hash-chain";

export interface ChainVerificationResult {
  projectId: string;
  isValid: boolean;
  status: "INTACT" | "INTEGRITY_FAILURE" | "UNVERIFIED";
  totalEvents: number;
  rootHash: string | null;
  verifiedAt: string;
  checksPassed: number;
  totalChecks: number;
  failureReason?: string;
  affectedEventId?: string;
  expectedHash?: string;
  observedHash?: string;
  impactExplanation?: string;
  eventsSummary: Array<{
    sequenceNumber: number;
    eventId: string;
    eventType: string;
    timestamp: string;
    eventHash: string;
    previousHash: string;
    assetId: string | null;
  }>;
}

export interface AssetVerificationResult {
  assetId: string;
  status: "INTACT" | "DERIVED" | "UNVERIFIED" | "REVIEW_REQUIRED" | "INTEGRITY_FAILURE";
  storedSha256: string;
  chainValid: boolean;
  eventCount: number;
  lastEventHash: string | null;
  derivedFromParentId?: string | null;
  transformationSpec?: string | null;
  details: string;
  disclaimer: string;
}

export class IntegrityService {
  /**
   * Appends a new immutable provenance event to the project's hash chain.
   */
  static async appendEvent(params: {
    projectId: string;
    assetId?: string | null;
    eventType: string;
    actorId: string;
    actorRole?: string;
    payload: Record<string, unknown>;
    assetHash?: string;
  }) {
    // 1. Get latest event for this project to retrieve previous_event_hash
    const lastEvent = await db.provenanceEvent.findFirst({
      where: { projectId: params.projectId },
      orderBy: { sequenceNumber: "desc" },
    });

    const sequenceNumber = lastEvent ? lastEvent.sequenceNumber + 1 : 1;
    const previousHash = lastEvent ? lastEvent.eventHash : GENESIS_PREVIOUS_HASH;
    const now = new Date();
    const timestampUtc = now.toISOString();

    const eventHash = computeEventHash({
      previousHash,
      eventType: params.eventType,
      payload: params.payload,
      timestampUtc,
      actorId: params.actorId,
      assetHash: params.assetHash,
    });

    const event = await db.provenanceEvent.create({
      data: {
        projectId: params.projectId,
        assetId: params.assetId || null,
        eventType: params.eventType,
        actorId: params.actorId,
        actorRole: params.actorRole || "SYSTEM",
        timestamp: now,
        payloadJson: JSON.stringify(params.payload),
        previousHash,
        eventHash,
        sequenceNumber,
      },
    });

    return event;
  }

  /**
   * Cryptographically verifies the unbroken chain of events for a project.
   */
  static async verifyChain(projectId: string): Promise<ChainVerificationResult> {
    const events = await db.provenanceEvent.findMany({
      where: { projectId },
      orderBy: { sequenceNumber: "asc" },
    });

    const verifiedAt = new Date().toISOString();

    if (events.length === 0) {
      return {
        projectId,
        isValid: true,
        status: "UNVERIFIED",
        totalEvents: 0,
        rootHash: null,
        verifiedAt,
        checksPassed: 0,
        totalChecks: 0,
        impactExplanation: "No provenance records have been recorded for this project yet.",
        eventsSummary: [],
      };
    }

    let previousHash = GENESIS_PREVIOUS_HASH;
    let checksPassed = 0;
    const totalChecks = events.length * 2; // checks previous link + recomputed event hash

    const eventsSummary = [];

    for (let i = 0; i < events.length; i++) {
      const evt = events[i];
      eventsSummary.push({
        sequenceNumber: evt.sequenceNumber,
        eventId: evt.id,
        eventType: evt.eventType,
        timestamp: evt.timestamp.toISOString(),
        eventHash: evt.eventHash,
        previousHash: evt.previousHash,
        assetId: evt.assetId,
      });

      // 1. Verify previous hash pointer
      if (evt.previousHash !== previousHash) {
        return {
          projectId,
          isValid: false,
          status: "INTEGRITY_FAILURE",
          totalEvents: events.length,
          rootHash: events[events.length - 1].eventHash,
          verifiedAt,
          checksPassed,
          totalChecks,
          failureReason: "Previous hash pointer does not match preceding event hash.",
          affectedEventId: evt.id,
          expectedHash: previousHash,
          observedHash: evt.previousHash,
          impactExplanation: `Integrity check failed at Event #${evt.sequenceNumber} (${evt.eventType}). Expected previous hash "${previousHash.slice(0, 12)}..." but observed "${evt.previousHash.slice(0, 12)}...". This record requires immediate human review.`,
          eventsSummary,
        };
      }
      checksPassed++;

      // 2. Recompute event hash over stored fields and compare
      let parsedPayload: Record<string, unknown> = {};
      try {
        parsedPayload = JSON.parse(evt.payloadJson);
      } catch {
        parsedPayload = {};
      }

      // Find asset hash if asset is linked
      let assetHash: string | undefined = undefined;
      if (evt.assetId) {
        const asset = await db.evidenceAsset.findUnique({
          where: { id: evt.assetId },
          select: { sha256: true },
        });
        assetHash = asset?.sha256;
      }

      const recomputedHash = computeEventHash({
        previousHash: evt.previousHash,
        eventType: evt.eventType,
        payload: parsedPayload,
        timestampUtc: evt.timestamp.toISOString(),
        actorId: evt.actorId,
        assetHash,
      });

      if (recomputedHash !== evt.eventHash) {
        return {
          projectId,
          isValid: false,
          status: "INTEGRITY_FAILURE",
          totalEvents: events.length,
          rootHash: events[events.length - 1].eventHash,
          verifiedAt,
          checksPassed,
          totalChecks,
          failureReason: "Event hash recomputation failed. Payload or metadata was altered after sealing.",
          affectedEventId: evt.id,
          expectedHash: evt.eventHash,
          observedHash: recomputedHash,
          impactExplanation: `Integrity check failed at Event #${evt.sequenceNumber}. Stored event hash "${evt.eventHash.slice(0, 12)}..." differs from recomputed digest "${recomputedHash.slice(0, 12)}...". The event payload or signature was modified.`,
          eventsSummary,
        };
      }
      checksPassed++;

      previousHash = evt.eventHash;
    }

    const rootHash = events[events.length - 1].eventHash;

    return {
      projectId,
      isValid: true,
      status: "INTACT",
      totalEvents: events.length,
      rootHash,
      verifiedAt,
      checksPassed,
      totalChecks,
      impactExplanation: `Chain intact. All ${events.length} cryptographic events verified with unbroken SHA-256 state continuity.`,
      eventsSummary,
    };
  }

  /**
   * Returns latest root hash for a project.
   */
  static async getLatestRootHash(projectId: string): Promise<string | null> {
    const lastEvent = await db.provenanceEvent.findFirst({
      where: { projectId },
      orderBy: { sequenceNumber: "desc" },
      select: { eventHash: true },
    });
    return lastEvent?.eventHash || null;
  }

  /**
   * Returns the full provenance event ledger for a project.
   */
  static async getChain(projectId: string) {
    return db.provenanceEvent.findMany({
      where: { projectId },
      orderBy: { sequenceNumber: "asc" },
      include: {
        asset: {
          select: {
            id: true,
            assetType: true,
            sha256: true,
            secureUrl: true,
          },
        },
      },
    });
  }

  /**
   * Verifies an individual asset's provenance status.
   */
  static async verifyAsset(assetId: string): Promise<AssetVerificationResult> {
    const asset = await db.evidenceAsset.findUnique({
      where: { id: assetId },
      include: {
        provenanceEvents: {
          orderBy: { sequenceNumber: "asc" },
        },
      },
    });

    const disclaimer =
      "Integrity describes the TerraWitness evidence record. It does not independently prove camera originality or legal admissibility.";

    if (!asset) {
      return {
        assetId,
        status: "UNVERIFIED",
        storedSha256: "",
        chainValid: false,
        eventCount: 0,
        lastEventHash: null,
        details: "Asset record not found in system.",
        disclaimer,
      };
    }

    if (asset.parentAssetId) {
      return {
        assetId,
        status: "DERIVED",
        storedSha256: asset.sha256,
        chainValid: true,
        eventCount: asset.provenanceEvents.length,
        lastEventHash: asset.provenanceEvents[asset.provenanceEvents.length - 1]?.eventHash || null,
        derivedFromParentId: asset.parentAssetId,
        transformationSpec: asset.transformationSpec,
        details: `Derived asset generated from parent ${asset.parentAssetId}. Transformation applied: ${asset.transformationSpec || "standard derivative"}.`,
        disclaimer,
      };
    }

    if (asset.provenanceEvents.length === 0) {
      return {
        assetId,
        status: "UNVERIFIED",
        storedSha256: asset.sha256,
        chainValid: false,
        eventCount: 0,
        lastEventHash: null,
        details: "No provenance events recorded for this asset yet.",
        disclaimer,
      };
    }

    // Verify project chain where asset resides
    const projectChain = await this.verifyChain(asset.projectId);

    if (!projectChain.isValid) {
      return {
        assetId,
        status: "INTEGRITY_FAILURE",
        storedSha256: asset.sha256,
        chainValid: false,
        eventCount: asset.provenanceEvents.length,
        lastEventHash: asset.provenanceEvents[asset.provenanceEvents.length - 1]?.eventHash || null,
        details: `Project provenance chain failed integrity validation: ${projectChain.failureReason}`,
        disclaimer,
      };
    }

    if (asset.integrityStatus === "REVIEW_REQUIRED") {
      return {
        assetId,
        status: "REVIEW_REQUIRED",
        storedSha256: asset.sha256,
        chainValid: true,
        eventCount: asset.provenanceEvents.length,
        lastEventHash: asset.provenanceEvents[asset.provenanceEvents.length - 1]?.eventHash || null,
        details: "Automated checks detected metadata or perceptual anomalies requiring human review.",
        disclaimer,
      };
    }

    return {
      assetId,
      status: "INTACT",
      storedSha256: asset.sha256,
      chainValid: true,
      eventCount: asset.provenanceEvents.length,
      lastEventHash: asset.provenanceEvents[asset.provenanceEvents.length - 1]?.eventHash || null,
      details: "Provenance records and stored cryptographic fingerprint are internally consistent and unbroken.",
      disclaimer,
    };
  }
}
