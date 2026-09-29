import { NextResponse } from "next/server";
import { seedDemoData } from "@/lib/demo/seed-data";

export async function POST() {
  try {
    const result = await seedDemoData();
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
