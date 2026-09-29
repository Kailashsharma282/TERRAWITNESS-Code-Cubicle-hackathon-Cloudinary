import { NextResponse } from "next/server";
import { SearchService } from "@/lib/search/search-service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const projectId = searchParams.get("projectId") || undefined;

    const result = await SearchService.searchEvidence(q, projectId);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const q = body.query || "";
    const projectId = body.projectId || undefined;

    const result = await SearchService.searchEvidence(q, projectId);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
