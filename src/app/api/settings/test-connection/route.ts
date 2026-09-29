import { NextResponse } from "next/server";
import { cloudinary, isCloudinaryConfigured } from "@/lib/cloudinary/cloudinary-client";

export async function POST() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "demo";
  const apiKeyConfigured = Boolean(process.env.CLOUDINARY_API_KEY);
  const apiSecretConfigured = Boolean(process.env.CLOUDINARY_API_SECRET);

  if (!isCloudinaryConfigured) {
    return NextResponse.json({
      connected: false,
      mode: "DEMO_UNCONFIGURED",
      cloudName,
      apiKeyConfigured,
      apiSecretConfigured,
      message:
        "Cloudinary credentials are not configured or using 'demo'. Field uploads will run in local simulated mode.",
    });
  }

  try {
    // Official Cloudinary SDK ping method: cloudinary.v2.api.ping()
    const pingResult = await cloudinary.api.ping();

    // Query usage info if permissions allow
    let usageInfo: Record<string, unknown> | null = null;
    try {
      const usage = await cloudinary.api.usage();
      usageInfo = {
        plan: usage.plan,
        creditsUsed: usage.credits?.used_percent,
        storageBytes: usage.storage?.usage,
      };
    } catch {
      // Usage API might be restricted by API key permissions
    }

    return NextResponse.json({
      connected: true,
      mode: "PRODUCTION_CLOUDINARY_ACTIVE",
      cloudName,
      pingStatus: pingResult.status,
      usage: usageInfo,
      message: "Successfully connected to Cloudinary media infrastructure via official SDK.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      connected: false,
      mode: "CONNECTION_FAILED",
      cloudName,
      error: message,
      message: `Failed to connect to Cloudinary: ${message}. Check CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.`,
    });
  }
}
