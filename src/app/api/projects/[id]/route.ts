import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { IntegrityService } from "@/lib/provenance/integrity-service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await db.project.findUnique({
      where: { id },
      include: {
        organization: true,
        assets: {
          orderBy: { captureTimestamp: "asc" },
          include: {
            reviews: {
              include: { reviewer: true },
            },
            analysisRuns: true,
          },
        },
        relations: {
          include: {
            beforeAsset: true,
            afterAsset: true,
            impactObservations: true,
          },
        },
        provenanceEvents: {
          orderBy: { sequenceNumber: "desc" },
          take: 20,
        },
        impactObservations: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get current provenance chain status
    const chainStatus = await IntegrityService.verifyChain(id);

    return NextResponse.json({ project, chainStatus });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
