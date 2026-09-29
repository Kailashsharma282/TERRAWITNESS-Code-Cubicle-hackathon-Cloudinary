import assert from "assert";
import crypto from "crypto";
import { canonicalJson } from "../src/lib/provenance/canonical-json.ts";
import { computeEventHash, GENESIS_PREVIOUS_HASH } from "../src/lib/provenance/hash-chain.ts";
import { hammingDistance, perceptualSimilarity } from "../src/lib/cv/hasher.ts";
import { haversineDistanceMeters, analyzeGeoTemporalDrift } from "../src/lib/cv/geotime-drift.ts";
import { detectPairAnomalies } from "../src/lib/cv/anomaly-detector.ts";

console.log("=================================================");
console.log("   TERRAWITNESS FORENSIC ENGINE TEST SUITE       ");
console.log("=================================================\n");

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}:`, err.message);
  }
}

// 1. Canonical JSON Tests
runTest("canonicalJson: sorts keys alphabetically regardless of insertion order", () => {
  const obj1 = { z: 1, a: 2, m: { y: "test", b: "hello" } };
  const obj2 = { a: 2, m: { b: "hello", y: "test" }, z: 1 };
  assert.strictEqual(canonicalJson(obj1), canonicalJson(obj2));
  assert.strictEqual(canonicalJson(obj1), '{"a":2,"m":{"b":"hello","y":"test"},"z":1}');
});

// 2. Cryptographic Hash Chain Calculation Tests
runTest("computeEventHash: produces deterministic SHA-256 digest with genesis pointer", () => {
  const payload = { site: "Plot A", lat: 3.91, lon: 98.43 };
  const timestamp = "2026-03-20T10:00:00.000Z";
  const actorId = "field.officer@terrawitness.demo";
  const assetHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

  const hash1 = computeEventHash({
    previousHash: GENESIS_PREVIOUS_HASH,
    eventType: "UPLOADED",
    payload,
    timestampUtc: timestamp,
    actorId,
    assetHash,
  });

  const hash2 = computeEventHash({
    previousHash: GENESIS_PREVIOUS_HASH,
    eventType: "UPLOADED",
    payload: { lon: 98.43, lat: 3.91, site: "Plot A" }, // reordered payload keys
    timestampUtc: timestamp,
    actorId,
    assetHash,
  });

  assert.strictEqual(hash1, hash2, "Reordered payload must produce identical cryptographic digest");
  assert.strictEqual(hash1.length, 64, "SHA-256 digest must be 64 hexadecimal characters");
});

// 3. Perceptual Similarity & Hamming Distance Tests
runTest("hasher: identical perceptual hashes yield 100% similarity", () => {
  const h1 = "f4a8e291c3d0b741";
  const h2 = "f4a8e291c3d0b741";
  assert.strictEqual(hammingDistance(h1, h2), 0);
  assert.strictEqual(perceptualSimilarity(h1, h2), 100);
});

runTest("hasher: single hex difference yields expected Hamming distance", () => {
  const h1 = "0000000000000000";
  const h2 = "0000000000000001"; // 1 bit different
  assert.strictEqual(hammingDistance(h1, h2), 1);
  const similarity = perceptualSimilarity(h1, h2);
  assert(similarity > 98, `Expected >98% similarity, got ${similarity}%`);
});

// 4. Geo-Temporal Drift Tests
runTest("geotime-drift: Haversine distance correctly calculates distance between GPS points", () => {
  // Distance between (3.9124, 98.4312) and (3.9128, 98.4315) is ~55 meters
  const dist = haversineDistanceMeters(3.9124, 98.4312, 3.9128, 98.4315);
  assert(dist > 45 && dist < 65, `Expected ~55m, got ${dist}m`);
});

runTest("geotime-drift: chronological order and delta computation", () => {
  const tBefore = "2026-03-20T10:00:00Z";
  const tAfter = "2026-08-18T10:00:00Z";
  const drift = analyzeGeoTemporalDrift({
    beforeTime: tBefore,
    afterTime: tAfter,
    beforeGps: { lat: 3.9124, lon: 98.4312 },
    afterGps: { lat: 3.9128, lon: 98.4315 },
  });

  assert.strictEqual(drift.isChronological, true);
  assert.strictEqual(drift.temporalStatus, "CHRONOLOGICAL");
  assert(drift.temporalGapDays >= 150 && drift.temporalGapDays <= 152, `Expected ~151 days, got ${drift.temporalGapDays}`);
  assert.strictEqual(drift.spatialStatus, "MODERATE_DRIFT");
});

// 5. Anomaly Detection Tests
runTest("anomaly-detector: flags inverted chronological sequence as HIGH severity anomaly", () => {
  const pairAnomalies = detectPairAnomalies({
    beforeAssetId: "EV-001",
    afterAssetId: "EV-002",
    isChronological: false, // After dated BEFORE baseline!
    temporalGapDays: -30,
    spatialDriftMeters: 20,
    alignmentConfidence: 0.9,
  });

  const chronoAnomaly = pairAnomalies.find((a) => a.type === "CHRONOLOGY_CONFLICT");
  assert(chronoAnomaly, "Must flag chronological inversion");
  assert.strictEqual(chronoAnomaly.severity, "HIGH");
});

runTest("anomaly-detector: flags identical perceptual hash as POTENTIAL_REUSE anomaly", () => {
  const pairAnomalies = detectPairAnomalies({
    beforeAssetId: "EV-001",
    afterAssetId: "EV-002",
    isChronological: true,
    temporalGapDays: 90,
    spatialDriftMeters: 10,
    perceptualSimilarity: 98.5, // 98.5% identical!
  });

  const reuseAnomaly = pairAnomalies.find((a) => a.type === "POTENTIAL_REUSE");
  assert(reuseAnomaly, "Must flag potential evidence reuse");
  assert.strictEqual(reuseAnomaly.severity, "HIGH");
});

console.log(`\n=================================================`);
console.log(`   TEST RESULTS: ${passed}/${total} TESTS PASSED `);
console.log(`=================================================\n`);

if (passed !== total) {
  process.exit(1);
}
