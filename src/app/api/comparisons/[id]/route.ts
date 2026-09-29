import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyzeGeoTemporalDrift } from "@/lib/cv/geotime-drift";
import { detectPairAnomalies } from "@/lib/cv/anomaly-detector";
import { perceptualSimilarity } from "@/lib/cv/hasher";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const relation = await db.evidenceRelation.findUnique({
      where: { id },
      include: {
        beforeAsset: true,
        afterAsset: true,
        impactObservations: true,
        project: true,
      },
    });

    if (!relation) {
      return NextResponse.json({ error: "Comparison pair not found" }, { status: 404 });
    }

    const driftAnalysis = analyzeGeoTemporalDrift({
      beforeGps: { lat: relation.beforeAsset.gpsLat, lon: relation.beforeAsset.gpsLon },
      afterGps: { lat: relation.afterAsset.gpsLat, lon: relation.afterAsset.gpsLon },
      beforeTime: relation.beforeAsset.captureTimestamp,
      afterTime: relation.afterAsset.captureTimestamp,
      beforeCamera: { make: relation.beforeAsset.cameraMake, model: relation.beforeAsset.cameraModel },
      afterCamera: { make: relation.afterAsset.cameraMake, model: relation.afterAsset.cameraModel },
    });

    let pSimilarity = 0;
    if (relation.beforeAsset.phash && relation.afterAsset.phash) {
      pSimilarity = perceptualSimilarity(relation.beforeAsset.phash, relation.afterAsset.phash);
    }

    const anomalies = detectPairAnomalies({
      beforeAssetId: relation.beforeAssetId,
      afterAssetId: relation.afterAssetId,
      spatialDriftMeters: relation.spatialDriftMeters,
      temporalGapDays: relation.temporalGapDays,
      isChronological: driftAnalysis.isChronological,
      alignmentConfidence: relation.alignmentQuality,
      perceptualSimilarity: pSimilarity,
    });

    return NextResponse.json({
      relation,
      driftAnalysis,
      anomalies,
      perceptualSimilarity: pSimilarity,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
