import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isCloudinaryConfigured } from "@/lib/cloudinary/cloudinary-client";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "healthy";
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    await db.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
  } catch (err: unknown) {
    dbStatus = "unreachable";
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Healthcheck DB ping failed:", errorMessage);
  }

  const isHealthy = dbStatus === "healthy";

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
      services: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
        cloudinary: {
          configured: isCloudinaryConfigured,
          cloudName: process.env.CLOUDINARY_CLOUD_NAME || "demo",
        },
      },
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
    },
    { status: isHealthy ? 200 : 503 }
  );
}
