import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { IntegrityService } from "@/lib/provenance/integrity-service";

export async function GET() {
  try {
    const projects = await db.project.findMany({
      include: {
        organization: true,
        assets: {
          select: {
            id: true,
            assetType: true,
            secureUrl: true,
            integrityStatus: true,
            reviewStatus: true,
          },
        },
        relations: {
          select: {
            id: true,
            changeScore: true,
          },
        },
        _count: {
          select: {
            assets: true,
            relations: true,
            provenanceEvents: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      description,
      category,
      country,
      region,
      site,
      startDate,
      targetDate,
      organizationId,
    } = body;

    if (!name || !category || !site) {
      return NextResponse.json(
        { error: "Name, impact category, and site location are required." },
        { status: 400 }
      );
    }

    // Ensure default organization exists if not passed
    let orgId = organizationId;
    if (!orgId) {
      let defaultOrg = await db.organization.findFirst();
      if (!defaultOrg) {
        defaultOrg = await db.organization.create({
          data: { name: "TerraWitness Collective" },
        });
      }
      orgId = defaultOrg.id;
    }

    const project = await db.project.create({
      data: {
        organizationId: orgId,
        name,
        description: description || "",
        category,
        country: country || "Unspecified",
        region: region || "Unspecified",
        site,
        startDate: startDate ? new Date(startDate) : new Date(),
        targetDate: targetDate ? new Date(targetDate) : null,
        status: "ACTIVE",
      },
    });

    // Append genesis provenance event
    await IntegrityService.appendEvent({
      projectId: project.id,
      eventType: "PROJECT_CREATED",
      actorId: "system",
      actorRole: "ADMIN",
      payload: {
        projectName: project.name,
        category: project.category,
        site: project.site,
        country: project.country,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
