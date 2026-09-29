import { NextResponse } from "next/server";
import { CloudinaryWebhookVerifier } from "@/lib/cloudinary/webhook-verifier";
import { db } from "@/lib/db";
import { IntegrityService } from "@/lib/provenance/integrity-service";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-cld-signature") || "";
    const timestampStr = req.headers.get("x-cld-timestamp") || "";
    const timestamp = parseInt(timestampStr, 10) || Math.round(Date.now() / 1000);

    // 1. Verify Webhook Signature
    const verification = CloudinaryWebhookVerifier.verify({
      rawBody,
      timestamp,
      signature,
    });

    if (!verification.isValid) {
      return NextResponse.json(
        { error: "Invalid Cloudinary notification signature", reason: verification.reason },
        { status: 401 }
      );
    }

    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 });
    }

    const notificationType = (payload.notification_type as string) || "upload";
    const publicId = (payload.public_id as string) || "";
    const assetId = (payload.asset_id as string) || "";

    // 2. Idempotent check
    const existingAsset = await db.evidenceAsset.findFirst({
      where: {
        OR: [{ cloudinaryPublicId: publicId }, { cloudinaryAssetId: assetId }],
      },
    });

    if (existingAsset) {
      // Record provenance event for webhook confirmation
      await IntegrityService.appendEvent({
        projectId: existingAsset.projectId,
        assetId: existingAsset.id,
        eventType: "CLOUDINARY_WEBHOOK_VERIFIED",
        actorId: "cloudinary_webhook",
        actorRole: "SYSTEM",
        payload: {
          notificationType,
          publicId,
          bytes: payload.bytes,
          format: payload.format,
          signatureVerified: true,
        },
        assetHash: existingAsset.sha256,
      });
    }

    return NextResponse.json({
      status: "received",
      verified: true,
      publicId,
      notificationType,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Cloudinary webhook error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
