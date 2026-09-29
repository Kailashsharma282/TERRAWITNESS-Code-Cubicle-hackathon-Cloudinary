import { NextResponse } from "next/server";
import { IntegrityService } from "@/lib/provenance/integrity-service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const chain = await IntegrityService.getChain(projectId);
    const rootHash = await IntegrityService.getLatestRootHash(projectId);

    return NextResponse.json({
      projectId,
      totalEvents: chain.length,
      rootHash,
      events: chain,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
