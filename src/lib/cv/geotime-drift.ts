export interface GeoTemporalAnalysis {
  spatialDriftMeters: number | null;
  spatialDriftFormatted: string;
  spatialStatus: "ALIGNED" | "MODERATE_DRIFT" | "SIGNIFICANT_DRIFT" | "LOCATION_UNAVAILABLE";
  temporalGapDays: number | null;
  temporalGapFormatted: string;
  isChronological: boolean | null;
  temporalStatus: "CHRONOLOGICAL" | "REVERSED" | "IDENTICAL_TIMESTAMP" | "TIMESTAMP_UNAVAILABLE";
  cameraConsistency: {
    matchingMake: boolean | null;
    matchingModel: boolean | null;
    description: string;
  };
  overallConsistencyScore: number; // 0 - 100%
  summary: string;
  disclaimer: string;
}

/**
 * Computes great-circle distance between two points on the Earth's surface in meters (Haversine formula).
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function analyzeGeoTemporalDrift(params: {
  beforeGps?: { lat: number | null; lon: number | null } | null;
  afterGps?: { lat: number | null; lon: number | null } | null;
  beforeTime?: Date | string | null;
  afterTime?: Date | string | null;
  beforeCamera?: { make?: string | null; model?: string | null } | null;
  afterCamera?: { make?: string | null; model?: string | null } | null;
}): GeoTemporalAnalysis {
  const disclaimer =
    "Geo-temporal metrics evaluate metadata consistency between captures. They do not independently prove physical authenticity or camera originality.";

  // 1. Spatial Drift
  let spatialDriftMeters: number | null = null;
  let spatialStatus: GeoTemporalAnalysis["spatialStatus"] = "LOCATION_UNAVAILABLE";
  let spatialDriftFormatted = "Location unavailable (GPS absent)";

  if (
    params.beforeGps?.lat != null &&
    params.beforeGps?.lon != null &&
    params.afterGps?.lat != null &&
    params.afterGps?.lon != null
  ) {
    spatialDriftMeters = haversineDistanceMeters(
      params.beforeGps.lat,
      params.beforeGps.lon,
      params.afterGps.lat,
      params.afterGps.lon
    );

    if (spatialDriftMeters < 50) {
      spatialStatus = "ALIGNED";
      spatialDriftFormatted = `${spatialDriftMeters}m (Strong proximity)`;
    } else if (spatialDriftMeters <= 250) {
      spatialStatus = "MODERATE_DRIFT";
      spatialDriftFormatted = `${spatialDriftMeters}m (Acceptable field drift)`;
    } else {
      spatialStatus = "SIGNIFICANT_DRIFT";
      spatialDriftFormatted = `${spatialDriftMeters}m (Wide spatial offset)`;
    }
  }

  // 2. Temporal Gap
  let temporalGapDays: number | null = null;
  let temporalStatus: GeoTemporalAnalysis["temporalStatus"] = "TIMESTAMP_UNAVAILABLE";
  let temporalGapFormatted = "Timestamp unavailable";
  let isChronological: boolean | null = null;

  const tBefore = params.beforeTime ? new Date(params.beforeTime).getTime() : NaN;
  const tAfter = params.afterTime ? new Date(params.afterTime).getTime() : NaN;

  if (!isNaN(tBefore) && !isNaN(tAfter)) {
    const deltaMs = tAfter - tBefore;
    temporalGapDays = Math.round((deltaMs / (1000 * 60 * 60 * 24)) * 10) / 10;

    if (deltaMs > 0) {
      isChronological = true;
      temporalStatus = "CHRONOLOGICAL";
      temporalGapFormatted = `${temporalGapDays} days elapsed (${Math.round(deltaMs / (1000 * 60 * 60))} hours)`;
    } else if (deltaMs === 0) {
      isChronological = true;
      temporalStatus = "IDENTICAL_TIMESTAMP";
      temporalGapFormatted = "Identical timestamp recorded";
    } else {
      isChronological = false;
      temporalStatus = "REVERSED";
      temporalGapFormatted = `ANOMALY: After capture dated ${Math.abs(temporalGapDays)} days BEFORE baseline`;
    }
  }

  // 3. Camera Consistency
  let matchingMake: boolean | null = null;
  let matchingModel: boolean | null = null;
  let cameraDescription = "Hardware metadata not fully recorded";

  if (params.beforeCamera?.make && params.afterCamera?.make) {
    matchingMake =
      params.beforeCamera.make.toLowerCase() === params.afterCamera.make.toLowerCase();
  }
  if (params.beforeCamera?.model && params.afterCamera?.model) {
    matchingModel =
      params.beforeCamera.model.toLowerCase() === params.afterCamera.model.toLowerCase();
  }

  if (matchingMake && matchingModel) {
    cameraDescription = `Identical capture hardware (${params.beforeCamera?.make} ${params.beforeCamera?.model})`;
  } else if (matchingMake && matchingModel === false) {
    cameraDescription = `Same manufacturer (${params.beforeCamera?.make}), different sensor models`;
  } else if (matchingMake === false) {
    cameraDescription = "Distinct capture devices recorded";
  }

  // 4. Overall Consistency Score (0 - 100%)
  let score = 50; // neutral baseline
  if (spatialStatus === "ALIGNED") score += 25;
  else if (spatialStatus === "MODERATE_DRIFT") score += 15;
  else if (spatialStatus === "SIGNIFICANT_DRIFT") score -= 20;

  if (temporalStatus === "CHRONOLOGICAL") score += 25;
  else if (temporalStatus === "REVERSED") score -= 40;

  if (matchingModel) score += 10;
  score = Math.max(0, Math.min(100, score));

  const summary = `Spatial drift: ${spatialDriftFormatted} · Temporal delta: ${temporalGapFormatted} · Consistency index: ${score}%`;

  return {
    spatialDriftMeters,
    spatialDriftFormatted,
    spatialStatus,
    temporalGapDays,
    temporalGapFormatted,
    isChronological,
    temporalStatus,
    cameraConsistency: {
      matchingMake,
      matchingModel,
      description: cameraDescription,
    },
    overallConsistencyScore: score,
    summary,
    disclaimer,
  };
}
