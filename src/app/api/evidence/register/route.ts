import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeAllFingerprints } from "@/lib/cv/hasher";
import { extractExifAndMetadata } from "@/lib/cv/metadata-extractor";
import { detectAssetAnomalies } from "@/lib/cv/anomaly-detector";
import { defaultVisionProvider } from "@/lib/ai/vision-provider";
import { IntegrityService } from "@/lib/provenance/integrity-service";
import { CloudinaryUploadService } from "@/lib/cloudinary/upload-service";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let buffer: Buffer;
    let originalFilename = "field_capture.jpg";
    let projectId = "";
    let assetType = "BEFORE";
    let actorId = "system";
    let actorRole = "FIELD_WORKER";
    let secureUrl = "";
    let cloudinaryPublicId: string | null = null;
    let cloudinaryAssetId: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      projectId = (formData.get("projectId") as string) || "";
      assetType = (formData.get("assetType") as string) || "BEFORE";
      actorId = (formData.get("actorId") as string) || "field.worker@terrawitness";

      if (!file) {
        return NextResponse.json({ error: "No file provided in form data." }, { status: 400 });
      }

      originalFilename = file.name;
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      // JSON payload
      const body = await req.json();
      projectId = body.projectId;
      assetType = body.assetType || "BEFORE";
      actorId = body.actorId || "system";
      originalFilename = body.filename || "field_capture.jpg";

      if (body.base64) {
        buffer = Buffer.from(body.base64.replace(/^data:image\/\w+;base64,/, ""), "base64");
      } else if (body.secureUrl) {
        secureUrl = body.secureUrl;
        cloudinaryPublicId = body.publicId || null;
        // Fetch buffer from secureUrl for byte-level hashing
        const fetched = await fetch(secureUrl);
        const arrayBuf = await fetched.arrayBuffer();
        buffer = Buffer.from(arrayBuf);
      } else {
        return NextResponse.json(
          { error: "Provide either a file upload, base64 payload, or secureUrl." },
          { status: 400 }
        );
      }
    }

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required." }, { status: 400 });
    }

    // Verify project exists
    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: `Project ${projectId} not found.` }, { status: 404 });
    }

    // 1. Compute Cryptographic and Perceptual Fingerprints (SHA-256, pHash, dHash)
    const fingerprints = await computeAllFingerprints(buffer);

    // 2. Extract EXIF, Hardware GPS, and Software signatures
    const metadata = await extractExifAndMetadata(buffer);

    // 3. Upload to Cloudinary if not already uploaded
    if (!secureUrl) {
      try {
        const uploadResult = await CloudinaryUploadService.uploadBuffer(buffer, {
          folder: `terrawitness/${projectId}`,
          tags: ["terrawitness", project.category.toLowerCase(), assetType.toLowerCase()],
        });

        if (uploadResult) {
          secureUrl = uploadResult.secure_url;
          cloudinaryPublicId = uploadResult.public_id;
          cloudinaryAssetId = uploadResult.asset_id;
        } else {
          // Unconfigured demo mode: generate a local data URI or placeholder
          secureUrl = `data:image/${metadata.format || "jpeg"};base64,${buffer.toString("base64")}`;
          cloudinaryPublicId = `local_demo_${fingerprints.sha256.slice(0, 12)}`;
        }
      } catch (uploadErr) {
        console.warn("Cloudinary upload failed, storing media locally:", uploadErr);
        secureUrl = `data:image/${metadata.format || "jpeg"};base64,${buffer.toString("base64")}`;
        cloudinaryPublicId = `local_fallback_${fingerprints.sha256.slice(0, 12)}`;
      }
    }

    // 4. Run AI Vision Analysis (Cloudinary AI or Deterministic Fallback)
    const visionAnalysis = await defaultVisionProvider.analyzeImage(buffer);

    // 5. Run Anomaly Engine
    const anomalies = detectAssetAnomalies({
      id: "TEMP",
      captureTimestamp: metadata.captureTimestamp,
      gpsLat: metadata.gpsLat,
      gpsLon: metadata.gpsLon,
      softwareMetadata: metadata.softwareMetadata,
      phash: fingerprints.phash,
    });

    const hasSeriousAnomaly = anomalies.some((a) => a.severity === "HIGH");
    const integrityStatus = hasSeriousAnomaly ? "REVIEW_REQUIRED" : "INTACT";

    // 6. Generate Asset ID: EV-XXXX
    const count = await db.evidenceAsset.count({ where: { projectId } });
    const assetId = `EV-${project.category.slice(0, 4).toUpperCase()}-${String(count + 101).padStart(4, "0")}`;

    // 7. Save to Database
    const asset = await db.evidenceAsset.create({
      data: {
        id: assetId,
        projectId,
        cloudinaryAssetId,
        cloudinaryPublicId,
        secureUrl,
        originalFilename,
        resourceType: "image",
        assetType,
        sha256: fingerprints.sha256,
        phash: fingerprints.phash,
        dhash: fingerprints.dhash,
        fileSize: buffer.length,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        captureTimestamp: metadata.captureTimestamp || new Date(),
        uploadTimestamp: new Date(),
        gpsLat: metadata.gpsLat,
        gpsLon: metadata.gpsLon,
        cameraMake: metadata.cameraMake,
        cameraModel: metadata.cameraModel,
        softwareMetadata: metadata.softwareMetadata,
        metadataJson: JSON.stringify(metadata.rawExifJson),
        tagsJson: JSON.stringify(visionAnalysis.tags),
        integrityStatus,
        reviewStatus: "PENDING",
        isSynthetic: false,
      },
    });

    // 8. Record Immutable Provenance Events
    // Event A: UPLOADED
    await IntegrityService.appendEvent({
      projectId,
      assetId: asset.id,
      eventType: "UPLOADED",
      actorId,
      actorRole,
      payload: {
        filename: originalFilename,
        sizeBytes: buffer.length,
        sha256: fingerprints.sha256,
        cloudinaryPublicId,
      },
      assetHash: fingerprints.sha256,
    });

    // Event B: HASHED
    await IntegrityService.appendEvent({
      projectId,
      assetId: asset.id,
      eventType: "HASHED",
      actorId: "system",
      actorRole: "SYSTEM",
      payload: {
        sha256: fingerprints.sha256,
        phash: fingerprints.phash,
        dhash: fingerprints.dhash,
      },
      assetHash: fingerprints.sha256,
    });

    // Event C: METADATA_EXTRACTED
    await IntegrityService.appendEvent({
      projectId,
      assetId: asset.id,
      eventType: "METADATA_EXTRACTED",
      actorId: "system",
      actorRole: "SYSTEM",
      payload: {
        gpsLat: metadata.gpsLat,
        gpsLon: metadata.gpsLon,
        cameraMake: metadata.cameraMake,
        cameraModel: metadata.cameraModel,
        captureTimestamp: metadata.captureTimestampRaw,
        software: metadata.softwareMetadata,
      },
      assetHash: fingerprints.sha256,
    });

    // Store Analysis Run
    await db.analysisRun.create({
      data: {
        assetId: asset.id,
        analysisType: "SCENE_TAGGING",
        provider: visionAnalysis.provider,
        model: visionAnalysis.model,
        inputHash: fingerprints.sha256,
        rawResultJson: JSON.stringify(visionAnalysis.rawResponse),
        normalizedResultJson: JSON.stringify(visionAnalysis.tags),
        confidence: visionAnalysis.confidence,
      },
    });

    return NextResponse.json(
      {
        asset,
        fingerprints,
        metadata: {
          captureTimestamp: metadata.captureTimestamp,
          gpsLat: metadata.gpsLat,
          gpsLon: metadata.gpsLon,
          cameraMake: metadata.cameraMake,
          cameraModel: metadata.cameraModel,
          softwareMetadata: metadata.softwareMetadata,
        },
        visionAnalysis,
        anomalies,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Evidence registration error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
