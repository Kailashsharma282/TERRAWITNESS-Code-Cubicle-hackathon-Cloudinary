import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const assetType = searchParams.get("assetType");
    const integrityStatus = searchParams.get("integrityStatus");
    const reviewStatus = searchParams.get("reviewStatus");

    const where: Record<string, unknown> = {};
    if (projectId) where.projectId = projectId;
    if (assetType) where.assetType = assetType;
    if (integrityStatus) where.integrityStatus = integrityStatus;
    if (reviewStatus) where.reviewStatus = reviewStatus;

    const assets = await db.evidenceAsset.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true, category: true, site: true },
        },
        reviews: {
          include: { reviewer: { select: { name: true, role: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ assets });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
