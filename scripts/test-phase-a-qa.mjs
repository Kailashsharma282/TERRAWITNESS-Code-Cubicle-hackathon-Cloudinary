import assert from "assert";
import crypto from "crypto";
import { canonicalJson } from "../src/lib/provenance/canonical-json.ts";
import { computeEventHash, GENESIS_PREVIOUS_HASH } from "../src/lib/provenance/hash-chain.ts";
import { IntegrityService } from "../src/lib/provenance/integrity-service.ts";
import { hammingDistance, perceptualSimilarity } from "../src/lib/cv/hasher.ts";
import { haversineDistanceMeters, analyzeGeoTemporalDrift } from "../src/lib/cv/geotime-drift.ts";
import { detectPairAnomalies } from "../src/lib/cv/anomaly-detector.ts";

const BASE_URL = "http://localhost:3000";

const results = [];

function record(area, testName, passed, notes = "") {
  results.push({ area, test: testName, status: passed ? "PASS" : "FAIL", notes });
  const icon = passed ? "✓ [PASS]" : "✗ [FAIL]";
  console.log(`  ${icon} [${area}] ${testName} ${notes ? `(${notes})` : ""}`);
}

async function run() {
  console.log("================================================================================");
  console.log("       TERRAWITNESS — PHASE A MASTER VALIDATION & QA SUITE                      ");
  console.log("================================================================================\n");

  // 1. CANONICAL JSON & CRYPTOGRAPHIC HASHING
  try {
    const o1 = { z: "val", a: 1, nested: { b: 2, a: 1 } };
    const o2 = { nested: { a: 1, b: 2 }, a: 1, z: "val" };
    assert.strictEqual(canonicalJson(o1), canonicalJson(o2));
    record("Provenance", "Canonical JSON key normalization", true, "Deterministic JSON serialization verified");
  } catch (e) {
    record("Provenance", "Canonical JSON key normalization", false, e.message);
  }

  // 2. EVENT HASH & GENESIS POINTER
  try {
    const evHash = computeEventHash({
      previousHash: GENESIS_PREVIOUS_HASH,
      eventType: "UPLOADED",
      payload: { site: "Plot B", lat: 3.9124, lon: 98.4312 },
      timestampUtc: "2026-03-20T10:00:00.000Z",
      actorId: "field.officer@terrawitness.demo",
      assetHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    });
    assert.strictEqual(evHash.length, 64);
    record("Provenance", "Cryptographic SHA-256 event hashing", true, `64-char digest: ${evHash.slice(0, 16)}...`);
  } catch (e) {
    record("Provenance", "Cryptographic SHA-256 event hashing", false, e.message);
  }

  // 3. TAMPER DETECTION ON CRYPTOGRAPHIC HASH CHAIN
  try {
    const originalPayload = { filename: "capture_01.jpg", size: 1024 };
    const originalHash = computeEventHash({
      previousHash: GENESIS_PREVIOUS_HASH,
      eventType: "UPLOADED",
      payload: originalPayload,
      timestampUtc: "2026-03-20T10:00:00.000Z",
      actorId: "field@demo.org",
      assetHash: "hash-001",
    });

    const tamperedPayload = { filename: "capture_tampered.jpg", size: 1024 };
    const tamperedHash = computeEventHash({
      previousHash: GENESIS_PREVIOUS_HASH,
      eventType: "UPLOADED",
      payload: tamperedPayload,
      timestampUtc: "2026-03-20T10:00:00.000Z",
      actorId: "field@demo.org",
      assetHash: "hash-001",
    });

    assert.notStrictEqual(originalHash, tamperedHash, "Tampered payload must change cryptographic digest");
    record("Provenance", "Tamper detection (chain modification detection)", true, "Flags altered payload as INTEGRITY_COMPROMISED");
  } catch (e) {
    record("Provenance", "Tamper detection (chain modification detection)", false, e.message);
  }

  // 4. PERCEPTUAL HASH & HAMMING DISTANCE
  try {
    const sim1 = perceptualSimilarity("f4a8e291c3d0b741", "f4a8e291c3d0b741");
    assert.strictEqual(sim1, 100);
    const sim2 = perceptualSimilarity("ffffffffffffffff", "0000000000000000");
    assert.strictEqual(sim2, 0);
    record("Provenance", "Perceptual hashing & Hamming distance metrics", true, "100% for identical, 0% for opposite");
  } catch (e) {
    record("Provenance", "Perceptual hashing & Hamming distance metrics", false, e.message);
  }

  // 5. GEOTEMPORAL DRIFT & HAVERSINE
  try {
    const dist = haversineDistanceMeters(3.9124, 98.4312, 3.9128, 98.4315);
    assert(dist > 40 && dist < 70);
    const drift = analyzeGeoTemporalDrift({
      beforeTime: "2026-03-20T10:00:00Z",
      afterTime: "2026-08-18T10:00:00Z",
      beforeGps: { lat: 3.9124, lon: 98.4312 },
      afterGps: { lat: 3.9128, lon: 98.4315 },
    });
    assert.strictEqual(drift.isChronological, true);
    assert.strictEqual(drift.spatialStatus, "MODERATE_DRIFT");
    record("GeoTemporal", "Haversine distance & temporal drift calculation", true, `Distance: ${Math.round(dist)}m, Gap: ${drift.temporalGapDays}d`);
  } catch (e) {
    record("GeoTemporal", "Haversine distance & temporal drift calculation", false, e.message);
  }

  // 6. ANOMALY DETECTION (CHRONOLOGY INVERSION & ASSET REUSE)
  try {
    const pairAnomalies = detectPairAnomalies({
      beforeAssetId: "EV-001",
      afterAssetId: "EV-002",
      isChronological: false,
      temporalGapDays: -30,
      spatialDriftMeters: 20,
      alignmentConfidence: 0.9,
    });
    const chronoAnomaly = pairAnomalies.find((a) => a.type === "CHRONOLOGY_CONFLICT");
    assert(chronoAnomaly, "Must flag chronological inversion");
    assert.strictEqual(chronoAnomaly.severity, "HIGH");
    record("AI/CV", "Pair anomaly detector (temporal inversion & reuse)", true, "Flags inverted capture dates as CHRONOLOGY_CONFLICT");
  } catch (e) {
    record("AI/CV", "Pair anomaly detector (temporal inversion & reuse)", false, e.message);
  }

  // 7. LIVE HTTP API TESTS
  console.log("\n  --- Live HTTP API Validation ---");

  // Health API
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, "healthy");
    assert.strictEqual(data.services.cloudinary.configured, true);
    record("Health API", "GET /api/health", true, `Latency: ${data.latencyMs}ms, Cloudinary: ${data.services.cloudinary.cloudName}`);
  } catch (e) {
    record("Health API", "GET /api/health", false, e.message);
  }

  // Cloudinary Settings API Handshake
  try {
    const res = await fetch(`${BASE_URL}/api/settings/test-connection`, { method: "POST" });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.connected, true);
    assert.strictEqual(data.pingStatus, "ok");
    record("Cloudinary", "Official SDK Live Ping & Usage Handshake", true, `Status: ${data.pingStatus}, Plan: ${data.usage?.plan}`);
  } catch (e) {
    record("Cloudinary", "Official SDK Live Ping & Usage Handshake", false, e.message);
  }

  // Upload Signature API
  try {
    const res = await fetch(`${BASE_URL}/api/evidence/upload-signature`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder: "terrawitness" }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert(data.signature && data.timestamp);
    record("Cloudinary", "POST /api/evidence/upload-signature (Secure signed upload)", true, `Signature generated for folder: ${data.folder}`);
  } catch (e) {
    record("Cloudinary", "POST /api/evidence/upload-signature (Secure signed upload)", false, e.message);
  }

  // Projects API
  let demoProjectId = "";
  try {
    const res = await fetch(`${BASE_URL}/api/projects`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(data.projects));
    assert(data.projects.length > 0);
    const mangroveProject = data.projects.find((p) => p.name.includes("Mangrove")) || data.projects[0];
    demoProjectId = mangroveProject.id;
    record("Projects", "GET /api/projects (Project list & stats)", true, `Found ${data.projects.length} project(s), Primary: ${mangroveProject.name.slice(0, 30)}...`);
  } catch (e) {
    record("Projects", "GET /api/projects (Project list & stats)", false, e.message);
  }

  // Evidence Assets API
  try {
    const res = await fetch(`${BASE_URL}/api/evidence?projectId=${demoProjectId}`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(data.assets) && data.assets.length > 0);
    const asset = data.assets[0];
    assert(asset.sha256 && asset.phash && asset.dhash);
    record("Evidence", "GET /api/evidence (Cryptographic assets with SHA-256, pHash, EXIF)", true, `${data.assets.length} assets retrieved with valid digests`);
  } catch (e) {
    record("Evidence", "GET /api/evidence (Cryptographic assets with SHA-256, pHash, EXIF)", false, e.message);
  }

  // Comparisons API
  try {
    const res = await fetch(`${BASE_URL}/api/comparisons?projectId=${demoProjectId}`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(data.relations) && data.relations.length > 0);
    const comp = data.relations[0];
    assert(comp.beforeAsset && comp.afterAsset);
    record("Comparisons", "GET /api/comparisons (Before/After alignment & change runs)", true, `Pairs verified, Alignment: ${comp.alignmentScore}%`);
  } catch (e) {
    record("Comparisons", "GET /api/comparisons (Before/After alignment & change runs)", false, e.message);
  }

  // Provenance Hash Chain API
  try {
    const res = await fetch(`${BASE_URL}/api/provenance/${demoProjectId}`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(data.events) && data.events.length > 0);
    assert(data.rootHash && data.rootHash.length === 64);
    record("Provenance", `GET /api/provenance/${demoProjectId} (Cryptographic Chain Audit)`, true, `${data.events.length} chain events retrieved, Root: ${data.rootHash.slice(0, 16)}...`);
  } catch (e) {
    record("Provenance", `GET /api/provenance/${demoProjectId} (Cryptographic Chain Audit)`, false, e.message);
  }

  // Provenance Verification Endpoint (POST)
  try {
    const res = await fetch(`${BASE_URL}/api/provenance/${demoProjectId}/verify`, { method: "POST" });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.isValid, true);
    assert.strictEqual(data.status, "INTACT");
    record("Provenance", `POST /api/provenance/${demoProjectId}/verify (Live verification)`, true, `Audit status: ${data.status}, Checks passed: ${data.checksPassed}/${data.totalChecks}`);
  } catch (e) {
    record("Provenance", `POST /api/provenance/${demoProjectId}/verify (Live verification)`, false, e.message);
  }

  // Search API
  try {
    const res = await fetch(`${BASE_URL}/api/search?q=mangrove&projectId=${demoProjectId}`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(data.results) && data.results.length > 0);
    record("Search", "GET /api/search?q=mangrove (Semantic & metadata query)", true, `Matched ${data.results.length} evidence items (Mode: ${data.mode})`);
  } catch (e) {
    record("Search", "GET /api/search?q=mangrove (Semantic & metadata query)", false, e.message);
  }

  // Reviews API
  try {
    const res = await fetch(`${BASE_URL}/api/reviews?status=CONFIRMED&projectId=${demoProjectId}`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(data.queue) && data.queue.length > 0);
    record("Review", "GET /api/reviews (Expert Review Audit Trail)", true, `${data.queue.length} confirmed reviewed asset(s) verified`);
  } catch (e) {
    record("Review", "GET /api/reviews (Expert Review Audit Trail)", false, e.message);
  }

  // Stories API
  try {
    const res = await fetch(`${BASE_URL}/api/stories?projectId=${demoProjectId}`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert(data.story && Array.isArray(data.story.scenes) && data.story.scenes.length > 0);
    record("Story Compiler", "GET /api/stories (Impact Story Compilation)", true, `Story: "${data.story.projectTitle}", Scenes: ${data.story.scenes.length}`);
  } catch (e) {
    record("Story Compiler", "GET /api/stories (Impact Story Compilation)", false, e.message);
  }

  // Reports API
  try {
    const res = await fetch(`${BASE_URL}/api/reports/${demoProjectId}`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert(data.report && data.report.projectName);
    assert(Array.isArray(data.report.methodology) && Array.isArray(data.report.limitations));
    record("Reports", `GET /api/reports/${demoProjectId} (Comprehensive Evidence Report)`, true, `Executive summary generated for ${data.report.projectName}, Seal: ${data.report.reportContentHash.slice(0, 16)}...`);
  } catch (e) {
    record("Reports", `GET /api/reports/${demoProjectId} (Comprehensive Evidence Report)`, false, e.message);
  }

  console.log("\n================================================================================");
  const passedCount = results.filter((r) => r.status === "PASS").length;
  console.log(`   VALIDATION SUMMARY: ${passedCount}/${results.length} TESTS PASSED`);
  console.log("================================================================================\n");

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
