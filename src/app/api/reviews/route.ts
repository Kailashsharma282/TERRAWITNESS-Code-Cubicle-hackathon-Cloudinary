import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { IntegrityService } from "@/lib/provenance/integrity-service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING";
    const projectId = searchParams.get("projectId");

    const where: Record<string, unknown> = { reviewStatus: status };
    if (projectId) where.projectId = projectId;

    const queue = await db.evidenceAsset.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, category: true, site: true } },
        reviews: { include: { reviewer: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ queue });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { assetId, decision, reason, reviewerId } = body;

    if (!assetId || !decision || !reason) {
      return NextResponse.json(
        { error: "assetId, decision (CONFIRMED/REJECTED/REQUEST_REVIEW/INCONCLUSIVE), and reason are required." },
        { status: 400 }
      );
    }

    const asset = await db.evidenceAsset.findUnique({
      where: { id: assetId },
      include: { project: true },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found." }, { status: 404 });
    }

    // Resolve reviewer
    let revId = reviewerId;
    if (!revId) {
      const reviewer = await db.user.findFirst({ where: { role: "REVIEWER" } });
      revId = reviewer ? reviewer.id : "system_reviewer";
    }

    // Record review
    const review = await db.review.create({
      data: {
        assetId,
        reviewerId: revId,
        decision,
        reason,
      },
    });

    // Update asset review status
    await db.evidenceAsset.update({
      where: { id: assetId },
      data: {
        reviewStatus: decision,
      },
    });

    // Record Immutable REVIEWED Provenance Event
    await IntegrityService.appendEvent({
      projectId: asset.projectId,
      assetId: asset.id,
      eventType: "REVIEWED",
      actorId: revId,
      actorRole: "REVIEWER",
      payload: {
        decision,
        reason,
        assetId,
        timestamp: new Date().toISOString(),
      },
      assetHash: asset.sha256,
    });

    return NextResponse.json({ review, success: true }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Review creation error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
