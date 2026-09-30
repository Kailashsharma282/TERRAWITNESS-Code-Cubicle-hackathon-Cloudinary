import { db } from "../db";
import { IntegrityService } from "../provenance/integrity-service";
import crypto from "crypto";

export async function seedDemoData() {
  // Check if demo org already exists
  const existingOrg = await db.organization.findFirst({
    where: { name: "TerraWitness Demo Environmental Collective" },
  });

  if (existingOrg) {
    return { success: true, message: "Demo data already seeded." };
  }

  // 1. Create Organization
  const org = await db.organization.create({
    data: {
      name: "TerraWitness Demo Environmental Collective",
    },
  });

  // 2. Create Users
  const reviewer = await db.user.create({
    data: {
      organizationId: org.id,
      name: "Dr. Elena Rostova",
      email: "reviewer@terrawitness.demo",
      role: "REVIEWER",
    },
  });

  await db.user.create({
    data: {
      organizationId: org.id,
      name: "Amina Okonjo",
      email: "field.officer@terrawitness.demo",
      role: "FIELD_WORKER",
    },
  });

  // PROJECT 1: Mangrove Restoration — Demo Site 04
  const proj1 = await db.project.create({
    data: {
      organizationId: org.id,
      name: "Mangrove Coastal Restoration — Demo Site 04 [SYNTHETIC DEMO]",
      description:
        "[SYNTHETIC DEMO DATA] 24-hectare coastal mangrove stabilization to mitigate storm surges and re-establish estuarine nursery habitat.",
      category: "Reforestation",
      country: "Indonesia",
      region: "North Sumatra",
      site: "Langkat Estuary Plot B",
      startDate: new Date("2026-03-15T08:00:00Z"),
      targetDate: new Date("2026-12-31T18:00:00Z"),
      status: "ACTIVE",
    },
  });

  // Baseline Before Asset
  const bAsset1Sha = crypto.createHash("sha256").update("DEMO_MANGROVE_BASELINE_2026").digest("hex");
  const bAsset1 = await db.evidenceAsset.create({
    data: {
      id: "EV-MANG-0101",
      projectId: proj1.id,
      cloudinaryPublicId: "terrawitness_demo/mangrove_before",
      secureUrl:
        "https://res.cloudinary.com/jfsfulbk/image/upload/v1790780609/terrawitness_demo/mangrove_before.jpg",
      originalFilename: "field_capture_baseline_plot_b_001.jpg",
      resourceType: "image",
      assetType: "BEFORE",
      sha256: bAsset1Sha,
      phash: "f4a8e291c3d0b741",
      dhash: "a1b2c3d4e5f60718",
      fileSize: 2451920,
      width: 1200,
      height: 800,
      format: "jpg",
      captureTimestamp: new Date("2026-03-20T09:14:22Z"),
      uploadTimestamp: new Date("2026-03-20T10:02:11Z"),
      gpsLat: 3.9124,
      gpsLon: 98.4312,
      cameraMake: "Sony",
      cameraModel: "ILCE-7RM4",
      softwareMetadata: null,
      metadataJson: JSON.stringify({
        focalLength: 35,
        iso: 100,
        fNumber: 5.6,
        orientation: 1,
        colorSpace: "sRGB",
      }),
      tagsJson: JSON.stringify([
        "mudflat",
        "tidal_estuary",
        "bare_ground",
        "degraded_wetland",
        "coastal_zone",
      ]),
      integrityStatus: "INTACT",
      reviewStatus: "CONFIRMED",
      isSynthetic: true,
    },
  });

  // Follow-up After Asset
  const aAsset1Sha = crypto.createHash("sha256").update("DEMO_MANGROVE_FOLLOWUP_2026").digest("hex");
  const aAsset1 = await db.evidenceAsset.create({
    data: {
      id: "EV-MANG-0102",
      projectId: proj1.id,
      cloudinaryPublicId: "terrawitness_demo/mangrove_after",
      secureUrl:
        "https://res.cloudinary.com/jfsfulbk/image/upload/v1790780610/terrawitness_demo/mangrove_after.jpg",
      originalFilename: "field_capture_followup_plot_b_001.jpg",
      resourceType: "image",
      assetType: "AFTER",
      sha256: aAsset1Sha,
      phash: "c294a739e8f1b250",
      dhash: "e9f0d1c2b3a49586",
      fileSize: 2618400,
      width: 1200,
      height: 800,
      format: "jpg",
      captureTimestamp: new Date("2026-08-18T10:28:44Z"),
      uploadTimestamp: new Date("2026-08-18T11:15:30Z"),
      gpsLat: 3.9128,
      gpsLon: 98.4315,
      cameraMake: "Sony",
      cameraModel: "ILCE-7RM4",
      softwareMetadata: null,
      metadataJson: JSON.stringify({
        focalLength: 35,
        iso: 100,
        fNumber: 5.6,
        orientation: 1,
        colorSpace: "sRGB",
      }),
      tagsJson: JSON.stringify([
        "mangrove_canopy",
        "rhizophora",
        "vegetation",
        "tidal_wetland",
        "estuarine_flora",
      ]),
      integrityStatus: "INTACT",
      reviewStatus: "CONFIRMED",
      isSynthetic: true,
    },
  });

  // Intermediate Progress Asset
  const pAsset1Sha = crypto.createHash("sha256").update("DEMO_MANGROVE_PROGRESS_2026").digest("hex");
  const pAsset1 = await db.evidenceAsset.create({
    data: {
      id: "EV-MANG-0103",
      projectId: proj1.id,
      cloudinaryPublicId: "terrawitness_demo/mangrove_progress",
      secureUrl:
        "https://res.cloudinary.com/jfsfulbk/image/upload/v1790780611/terrawitness_demo/mangrove_progress.jpg",
      originalFilename: "field_capture_nursery_planting_001.jpg",
      resourceType: "image",
      assetType: "PROGRESS",
      sha256: pAsset1Sha,
      phash: "b183d942e7c0a619",
      dhash: "d8e7c6b5a4938271",
      fileSize: 2314500,
      width: 1200,
      height: 800,
      format: "jpg",
      captureTimestamp: new Date("2026-05-12T07:45:10Z"),
      uploadTimestamp: new Date("2026-05-12T08:30:00Z"),
      gpsLat: 3.9126,
      gpsLon: 98.4313,
      cameraMake: "Sony",
      cameraModel: "ILCE-7RM4",
      softwareMetadata: null,
      tagsJson: JSON.stringify(["planting_stakes", "seedling_nursery", "field_work", "mudflat"]),
      integrityStatus: "INTACT",
      reviewStatus: "CONFIRMED",
      isSynthetic: true,
    },
  });

  // Pairing Relation
  const relation1 = await db.evidenceRelation.create({
    data: {
      projectId: proj1.id,
      beforeAssetId: bAsset1.id,
      afterAssetId: aAsset1.id,
      relationType: "BEFORE_AFTER_PAIR",
      pairConfidence: 0.95,
      spatialDriftMeters: 55.4,
      temporalGapDays: 151.0,
      alignmentQuality: 0.88,
      changeScore: 41.2,
      changeDetailsJson: JSON.stringify({
        pixelDifferencePercentage: 43.8,
        edgeChangePercentage: 37.3,
        ssimEstimate: 0.62,
        normalizedChangeScore: 41.2,
      }),
    },
  });

  // Impact Observation
  await db.impactObservation.create({
    data: {
      projectId: proj1.id,
      relationId: relation1.id,
      category: "VEGETATION",
      metric: "visible_canopy_vegetation_coverage",
      value: 29.5,
      unit: "percentage points",
      description:
        "Estimated visible vegetation coverage shifted from 12.3% to 41.8% (+29.5 percentage points).",
      method: "Excess Green Index (ExG = 2G - R - B) thresholding + AI semantic tagging",
      confidence: 0.88,
      source: "TerraWitness CV Engine (ExG) + Cloudinary AI Semantics",
    },
  });

  // Human Review Record
  await db.review.create({
    data: {
      assetId: aAsset1.id,
      reviewerId: reviewer.id,
      decision: "CONFIRMED",
      reason:
        "Verified GPS waypoint alignment with plot boundary. Visual vegetation increase confirmed against planting records.",
    },
  });

  // Provenance Events for Project 1
  await IntegrityService.appendEvent({
    projectId: proj1.id,
    assetId: bAsset1.id,
    eventType: "UPLOADED",
    actorId: "field.officer@terrawitness.demo",
    actorRole: "FIELD_WORKER",
    payload: { filename: bAsset1.originalFilename, sizeBytes: bAsset1.fileSize, format: "jpg" },
    assetHash: bAsset1.sha256,
  });

  await IntegrityService.appendEvent({
    projectId: proj1.id,
    assetId: bAsset1.id,
    eventType: "METADATA_EXTRACTED",
    actorId: "system",
    actorRole: "SYSTEM",
    payload: { gpsLat: 3.9124, gpsLon: 98.4312, camera: "Sony ILCE-7RM4", iso: 100 },
    assetHash: bAsset1.sha256,
  });

  await IntegrityService.appendEvent({
    projectId: proj1.id,
    assetId: pAsset1.id,
    eventType: "UPLOADED",
    actorId: "field.officer@terrawitness.demo",
    actorRole: "FIELD_WORKER",
    payload: { filename: pAsset1.originalFilename, sizeBytes: pAsset1.fileSize },
    assetHash: pAsset1.sha256,
  });

  await IntegrityService.appendEvent({
    projectId: proj1.id,
    assetId: aAsset1.id,
    eventType: "UPLOADED",
    actorId: "field.officer@terrawitness.demo",
    actorRole: "FIELD_WORKER",
    payload: { filename: aAsset1.originalFilename, sizeBytes: aAsset1.fileSize },
    assetHash: aAsset1.sha256,
  });

  await IntegrityService.appendEvent({
    projectId: proj1.id,
    assetId: aAsset1.id,
    eventType: "PAIRED",
    actorId: "system",
    actorRole: "SYSTEM",
    payload: {
      beforeAssetId: bAsset1.id,
      afterAssetId: aAsset1.id,
      relationId: relation1.id,
      spatialDriftMeters: 55.4,
      temporalGapDays: 151.0,
    },
    assetHash: aAsset1.sha256,
  });

  await IntegrityService.appendEvent({
    projectId: proj1.id,
    assetId: aAsset1.id,
    eventType: "REVIEWED",
    actorId: reviewer.id,
    actorRole: "REVIEWER",
    payload: {
      decision: "CONFIRMED",
      reason: "Verified GPS waypoint alignment with plot boundary.",
      reviewer: "Dr. Elena Rostova",
    },
    assetHash: aAsset1.sha256,
  });

  // PROJECT 2: Solar Microgrid Installation — Demo Site 02
  const proj2 = await db.project.create({
    data: {
      organizationId: org.id,
      name: "Solar Microgrid Clean Energy — Demo Site 02 [SYNTHETIC DEMO]",
      description:
        "[SYNTHETIC DEMO DATA] 120kW community microgrid deployment to displace diesel generation across rural clinic and school facilities.",
      category: "Solar",
      country: "Kenya",
      region: "Turkana Basin",
      site: "Lodwar Health Substation",
      startDate: new Date("2026-01-10T08:00:00Z"),
      targetDate: new Date("2026-09-30T18:00:00Z"),
      status: "VERIFIED",
    },
  });

  const bAsset2Sha = crypto.createHash("sha256").update("DEMO_SOLAR_BASELINE_2026").digest("hex");
  const bAsset2 = await db.evidenceAsset.create({
    data: {
      id: "EV-SOL-0201",
      projectId: proj2.id,
      cloudinaryPublicId: "terrawitness_demo/solar_before",
      secureUrl:
        "https://res.cloudinary.com/jfsfulbk/image/upload/v1790780612/terrawitness_demo/solar_before.jpg",
      originalFilename: "substation_rooftop_empty_baseline.jpg",
      resourceType: "image",
      assetType: "BEFORE",
      sha256: bAsset2Sha,
      phash: "a819c4d2e7b0f135",
      dhash: "b7a6958473625140",
      fileSize: 1984200,
      width: 1200,
      height: 800,
      format: "jpg",
      captureTimestamp: new Date("2026-01-15T11:20:00Z"),
      uploadTimestamp: new Date("2026-01-15T12:05:00Z"),
      gpsLat: 3.1192,
      gpsLon: 35.5973,
      cameraMake: "Nikon",
      cameraModel: "Z6_2",
      tagsJson: JSON.stringify(["rooftop", "bare_roof", "corrugated_iron", "substation"]),
      integrityStatus: "INTACT",
      reviewStatus: "CONFIRMED",
      isSynthetic: true,
    },
  });

  const aAsset2Sha = crypto.createHash("sha256").update("DEMO_SOLAR_FOLLOWUP_2026").digest("hex");
  const aAsset2 = await db.evidenceAsset.create({
    data: {
      id: "EV-SOL-0202",
      projectId: proj2.id,
      cloudinaryPublicId: "terrawitness_demo/solar_after",
      secureUrl:
        "https://res.cloudinary.com/jfsfulbk/image/upload/v1790780613/terrawitness_demo/solar_after.jpg",
      originalFilename: "substation_rooftop_solar_array_installed.jpg",
      resourceType: "image",
      assetType: "AFTER",
      sha256: aAsset2Sha,
      phash: "7e92b1a8d4c3f065",
      dhash: "415263748596a7b8",
      fileSize: 2154100,
      width: 1200,
      height: 800,
      format: "jpg",
      captureTimestamp: new Date("2026-06-22T13:40:00Z"),
      uploadTimestamp: new Date("2026-06-22T14:15:00Z"),
      gpsLat: 3.1194,
      gpsLon: 35.5975,
      cameraMake: "Nikon",
      cameraModel: "Z6_2",
      tagsJson: JSON.stringify([
        "solar_panel",
        "photovoltaic",
        "panel_array",
        "rooftop",
        "clean_energy",
      ]),
      integrityStatus: "INTACT",
      reviewStatus: "CONFIRMED",
      isSynthetic: true,
    },
  });

  const relation2 = await db.evidenceRelation.create({
    data: {
      projectId: proj2.id,
      beforeAssetId: bAsset2.id,
      afterAssetId: aAsset2.id,
      relationType: "BEFORE_AFTER_PAIR",
      pairConfidence: 0.98,
      spatialDriftMeters: 28.1,
      temporalGapDays: 158.0,
      alignmentQuality: 0.91,
      changeScore: 48.6,
      changeDetailsJson: JSON.stringify({
        pixelDifferencePercentage: 51.2,
        edgeChangePercentage: 44.7,
        ssimEstimate: 0.54,
        normalizedChangeScore: 48.6,
      }),
    },
  });

  await db.impactObservation.create({
    data: {
      projectId: proj2.id,
      relationId: relation2.id,
      category: "SOLAR",
      metric: "solar_array_visual_evidence",
      value: 1,
      unit: "boolean",
      description:
        "Baseline: Solar panel evidence not detected. Follow-up: High-density photovoltaic panel array installed across rooftop frame.",
      method: "Semantic object classification & structural contrast",
      confidence: 0.92,
      source: "Cloudinary AI Vision + TerraWitness CV",
    },
  });

  await IntegrityService.appendEvent({
    projectId: proj2.id,
    assetId: bAsset2.id,
    eventType: "UPLOADED",
    actorId: "field.officer@terrawitness.demo",
    payload: { filename: bAsset2.originalFilename },
    assetHash: bAsset2.sha256,
  });

  await IntegrityService.appendEvent({
    projectId: proj2.id,
    assetId: aAsset2.id,
    eventType: "UPLOADED",
    actorId: "field.officer@terrawitness.demo",
    payload: { filename: aAsset2.originalFilename },
    assetHash: aAsset2.sha256,
  });

  await IntegrityService.appendEvent({
    projectId: proj2.id,
    assetId: aAsset2.id,
    eventType: "ALIGNED",
    actorId: "system",
    payload: { alignmentConfidence: 0.91, relationId: relation2.id },
    assetHash: aAsset2.sha256,
  });

  await IntegrityService.appendEvent({
    projectId: proj2.id,
    assetId: aAsset2.id,
    eventType: "REVIEWED",
    actorId: reviewer.id,
    payload: { decision: "CONFIRMED", reason: "Approved solar installation documentation." },
    assetHash: aAsset2.sha256,
  });

  return { success: true, message: "Demo datasets seeded with cryptographic hash chains." };
}
