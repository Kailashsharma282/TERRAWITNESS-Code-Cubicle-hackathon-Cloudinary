export interface AnomalySignal {
  id: string;
  type:
    | "POTENTIAL_REUSE"
    | "METADATA_CONFLICT"
    | "CHRONOLOGY_CONFLICT"
    | "LOW_ALIGNMENT_CONFIDENCE"
    | "EDITING_SOFTWARE_DETECTED"
    | "LARGE_GPS_MISMATCH"
    | "PROVENANCE_GAP";
  severity: "LOW" | "MEDIUM" | "HIGH";
  title: string;
  description: string;
  recommendation: string;
  evidenceAssetId?: string;
}

export function detectAssetAnomalies(asset: {
  id: string;
  captureTimestamp?: Date | null;
  gpsLat?: number | null;
  gpsLon?: number | null;
  softwareMetadata?: string | null;
  phash?: string | null;
  otherProjectAssets?: Array<{ id: string; phash?: string | null }>;
}): AnomalySignal[] {
  const signals: AnomalySignal[] = [];

  // 1. Missing Metadata
  if (asset.gpsLat == null || asset.gpsLon == null) {
    signals.push({
      id: `ANOM-GPS-${asset.id}`,
      type: "METADATA_CONFLICT",
      severity: "LOW",
      title: "Geospatial Coordinates Absent",
      description: "Asset does not contain embedded GPS latitude/longitude in EXIF headers.",
      recommendation: "Field worker or reviewer should manually associate approved site coordinates.",
      evidenceAssetId: asset.id,
    });
  }

  if (!asset.captureTimestamp) {
    signals.push({
      id: `ANOM-TIME-${asset.id}`,
      type: "METADATA_CONFLICT",
      severity: "LOW",
      title: "Hardware Timestamp Absent",
      description: "EXIF DateTimeOriginal header is missing. Capture time defaulted to upload time.",
      recommendation: "Reviewer should verify capture chronology from site logbooks.",
      evidenceAssetId: asset.id,
    });
  }

  // 2. Editing Software Detected
  if (asset.softwareMetadata) {
    const sw = asset.softwareMetadata.toLowerCase();
    if (/photoshop|lightroom|gimp|canva|pixlr|affinity|picsart/.test(sw)) {
      signals.push({
        id: `ANOM-SW-${asset.id}`,
        type: "EDITING_SOFTWARE_DETECTED",
        severity: "MEDIUM",
        title: "Image Editing Software Signature",
        description: `EXIF Software metadata indicates potential post-processing (${asset.softwareMetadata}).`,
        recommendation: "Inspect whether edits were non-destructive color calibration or content modification.",
        evidenceAssetId: asset.id,
      });
    }
  }

  return signals;
}

export function detectPairAnomalies(pair: {
  beforeAssetId: string;
  afterAssetId: string;
  spatialDriftMeters?: number | null;
  temporalGapDays?: number | null;
  isChronological?: boolean | null;
  alignmentConfidence?: number | null;
  perceptualSimilarity?: number | null;
}): AnomalySignal[] {
  const signals: AnomalySignal[] = [];

  // 1. Chronology conflict
  if (pair.isChronological === false) {
    signals.push({
      id: `ANOM-CHRONO-${pair.beforeAssetId}-${pair.afterAssetId}`,
      type: "CHRONOLOGY_CONFLICT",
      severity: "HIGH",
      title: "Chronological Sequence Inversion",
      description: `Follow-up capture timestamp precedes baseline capture by ${Math.abs(pair.temporalGapDays || 0)} days.`,
      recommendation: "Confirm chronological labels and asset pairing order.",
    });
  }

  // 2. Large GPS mismatch
  if (pair.spatialDriftMeters != null && pair.spatialDriftMeters > 250) {
    signals.push({
      id: `ANOM-GPS-DRIFT-${pair.beforeAssetId}-${pair.afterAssetId}`,
      type: "LARGE_GPS_MISMATCH",
      severity: "MEDIUM",
      title: "Substantial Spatial Drift",
      description: `Physical capture points diverge by ${pair.spatialDriftMeters} meters.`,
      recommendation: "Verify that both captures represent the same target intervention plot.",
    });
  }

  // 3. Low alignment confidence
  if (pair.alignmentConfidence != null && pair.alignmentConfidence < 0.6) {
    signals.push({
      id: `ANOM-ALIGN-${pair.beforeAssetId}-${pair.afterAssetId}`,
      type: "LOW_ALIGNMENT_CONFIDENCE",
      severity: "MEDIUM",
      title: "Low Alignment Confidence",
      description: `Feature alignment confidence is ${(pair.alignmentConfidence * 100).toFixed(0)}%. Differing camera viewpoints or focal lengths detected.`,
      recommendation: "Visible change metrics should be interpreted with caution due to optical perspective shift.",
    });
  }

  // 4. Potential Reuse / Duplicate Media
  if (pair.perceptualSimilarity != null && pair.perceptualSimilarity >= 94) {
    signals.push({
      id: `ANOM-REUSE-${pair.beforeAssetId}-${pair.afterAssetId}`,
      type: "POTENTIAL_REUSE",
      severity: "HIGH",
      title: "Potential Reused Evidence",
      description: `Before and After images exhibit ${pair.perceptualSimilarity}% perceptual hash similarity. The images may be identical or minimally recompressed versions of the same file.`,
      recommendation: "Human reviewer must verify that separate temporal captures were submitted.",
    });
  }

  return signals;
}
