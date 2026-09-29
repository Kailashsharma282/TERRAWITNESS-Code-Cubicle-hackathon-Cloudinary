import { NextResponse } from "next/server";
import { CloudinaryUploadService } from "@/lib/cloudinary/upload-service";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const folder = body.folder || "terrawitness_evidence";
    const tags = Array.isArray(body.tags) ? body.tags : ["terrawitness", "evidence"];
    const publicId = body.publicId;

    const signatureData = CloudinaryUploadService.generateUploadSignature({
      folder,
      tags,
      publicId,
    });

    return NextResponse.json(signatureData);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
