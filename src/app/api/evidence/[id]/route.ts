import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { IntegrityService } from "@/lib/provenance/integrity-service";
import { ReportGenerator } from "@/lib/reports/report-generator";
import { detectAssetAnomalies } from "@/lib/cv/anomaly-detector";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const asset = await db.evidenceAsset.findUnique({
      where: { id },
      include: {
        project: true,
        reviews: {
          include: { reviewer: true },
          orderBy: { createdAt: "desc" },
        },
        analysisRuns: {
          orderBy: { createdAt: "desc" },
        },
        provenanceEvents: {
          orderBy: { sequenceNumber: "asc" },
        },
        beforeRelations: {
          include: { afterAsset: true, impactObservations: true },
        },
        afterRelations: {
          include: { beforeAsset: true, impactObservations: true },
        },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const verification = await IntegrityService.verifyAsset(id);
    const passport = await ReportGenerator.getEvidencePassport(id);
    const anomalies = detectAssetAnomalies({
      id: asset.id,
      captureTimestamp: asset.captureTimestamp,
      gpsLat: asset.gpsLat,
      gpsLon: asset.gpsLon,
      softwareMetadata: asset.softwareMetadata,
      phash: asset.phash,
    });

    return NextResponse.json({
      asset,
      verification,
      passport,
      anomalies,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
