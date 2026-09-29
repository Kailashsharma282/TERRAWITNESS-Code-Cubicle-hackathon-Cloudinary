# TerraWitness System Architecture

## 1. High-Level Architecture Overview

TerraWitness is structured as a modular, evidence-grade platform connecting media infrastructure, cryptographic auditability, and computer vision forensics.

```text
                    ┌─────────────────────────────────────────┐
                    │               Web Client                │
                    │   TerraWitness Mission Control Console  │
                    └────────────────────┬────────────────────┘
                                         │
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │        Next.js Application Layer        │
                    │  API Routes / Edge Handlers / Services  │
                    └──────┬─────────────┬─────────────┬──────┘
                           │             │             │
              ┌────────────┘             │             └────────────┐
              ▼                          ▼                          ▼
     ┌─────────────────┐       ┌─────────────────┐        ┌─────────────────┐
     │   Cloudinary    │       │   Prisma ORM    │        │ Computer Vision │
     │  Media Storage  │       │  SQLite / PG    │        │    Forensics    │
     │ Transformations │       │   Persistence   │        │ SSIM / DCT / ExG│
     └────────┬────────┘       └────────┬────────┘        └────────┬────────┘
              │                         │                          │
              └─────────────────────────┼──────────────────────────┘
                                        ▼
                    ┌─────────────────────────────────────────┐
                    │        Cryptographic Provenance         │
                    │     Append-Only SHA-256 Event Chain     │
                    └─────────────────────────────────────────┘
```

---

## 2. Asset Ingestion Pipeline

```text
  [Field Worker / Station]
             │
             ▼
  [File Binary Selection]
             │
             ├──▶ [Compute SHA-256 Digest]
             ├──▶ [Compute 64-bit DCT pHash & dHash]
             ├──▶ [Extract EXIF, GPS, Hardware & Software Headers]
             │
             ▼
  [Cloudinary Signed Ingest] ──▶ (Original Asset Marked Immutable)
             │
             ▼
  [AI Vision Semantics] ──▶ [Cloudinary AI / Deterministic Chroma Tagging]
             │
             ▼
  [Anomaly Engine Check] ──▶ [Check GPS conflict, Software headers, Reuse signals]
             │
             ▼
  [Append Provenance Events] ──▶ [UPLOADED, HASHED, METADATA_EXTRACTED]
             │
             ▼
  [Database Persistence] ──▶ [EvidenceAsset Sealed as INTACT]
```

---

## 3. Cryptographic Provenance Hash Chain

The provenance ledger uses deterministic canonical JSON serialization and SHA-256 state chaining:

```text
Genesis Event (Seq #1)
[PREV: "GENESIS"] ──▶ [SHA256(...)] ──▶ Root Hash #1
                                            │
                                            ▼
Asset Upload Event (Seq #2)
[PREV: Root Hash #1] ──▶ [SHA256(...)] ──▶ Root Hash #2
                                            │
                                            ▼
Pairing & Diff Event (Seq #3)
[PREV: Root Hash #2] ──▶ [SHA256(...)] ──▶ Root Hash #3
                                            │
                                            ▼
Human Review Event (Seq #4)
[PREV: Root Hash #3] ──▶ [SHA256(...)] ──▶ Current Root Hash
```

Every event hash is computed deterministically:
$$\text{event\_hash} = \text{SHA256}(\text{previous\_event\_hash} + \text{event\_type} + \text{canonical\_json}(\text{payload}) + \text{timestamp\_utc} + \text{actor\_id} + \text{asset\_hash})$$

---

## 4. Before / After Comparison Pipeline

```text
Baseline Capture [EV-0101]          Follow-up Capture [EV-0102]
         │                                    │
         └─────────────────┬──────────────────┘
                           ▼
              [Geo-Temporal Drift Check]
              - Spatial offset in meters (Haversine)
              - Temporal delta in days & chronology check
              - Sensor model compatibility
                           │
                           ▼
             [Geometric Normalization (512x512)]
                           │
                           ▼
          [Multi-Metric Optical Divergence]
          - Illumination thresholded pixel diff (Δ > 28)
          - Sobel edge gradient divergence
          - Structural Similarity Index (SSIM)
                           │
                           ▼
          [Domain-Specific Analysis (ExG / Solar)]
                           │
                           ▼
          [Normalized Visible Change Score]
          - Change detected % · Alignment quality %
```

---

## 5. Story Generation Pipeline

```text
[Verified Project Assets]
           │
           ▼
[Filter Chronological Milestones]
(Baseline Before ──▶ Intervention Progress ──▶ Verified Follow-up)
           │
           ▼
[Construct Story Scenes]
- 01: Baseline Environmental Context [EV-BASE]
- 02: Initial Pre-Intervention Evidence
- 03: Field Intervention in Progress
- 04: Registered Visual Change [EV-AFTER]
- 05: Cryptographic Chain of Custody Seal
           │
           ▼
[Embed Strict Citations [EV-XXX]]
           │
           ▼
[Cloudinary Interactive Reel & Player Delivery]
```

---

## 6. What TerraWitness Proves vs What It Does Not Prove

### What TerraWitness Proves:
1. **Unbroken Chain of Custody**: Proves that the exact byte stream uploaded to Cloudinary has not been altered, replaced, or tampered with since ingest.
2. **Deterministic Fingerprints**: Establishes verifiable SHA-256 digests and perceptual hashes to prevent re-uploaded duplicate media fraud.
3. **Chronological Event Sequence**: Proves the sequence and timing of all recorded lifecycle actions (upload, alignment, change calculation, reviewer corroboration).
4. **Reproducible Computer Vision**: Changes are calculated using documented mathematical formulations (SSIM, illumination thresholding, ExG index) rather than ungrounded AI text generation.
5. **Traceable Narrative Claims**: Every assertion in a compiled impact story is linked to a concrete evidence record ID.

### What TerraWitness Does NOT Prove:
1. **Camera Sensor Originality**: Integrity describes the internal TerraWitness record. It does not independently prove that an external camera hardware sensor was physical reality or free from hardware-level spoofing.
2. **Biological Carbon Sequestration**: Visual canopy greenness is an optical metric; it does not measure real-world soil carbon, tree biomass, or survival longevity.
3. **Electrical Kilowatt Generation**: Visual presence of solar hardware proves physical deployment only; it does not prove active grid synchronization or kilowatt-hour generation.
4. **Statutory Admissibility**: TerraWitness does not independently guarantee courtroom or statutory admissibility without organizational corroboration.
