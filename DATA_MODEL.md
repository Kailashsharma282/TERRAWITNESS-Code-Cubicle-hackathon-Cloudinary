# TerraWitness Data Model

TerraWitness uses a relational persistence architecture via Prisma ORM with native support for PostgreSQL (with pgvector) and SQLite local development.

```prisma
// Core Tables and Entity Schema
```

## 1. Organization & User Hierarchy

* **Organization**: Top-level entity representing an NGO, impact fund, or auditing body.
* **User**: Represents team members with strict server-enforced roles:
  * `ADMIN`: Full configuration, policy management, audit exports.
  * `PROJECT_MANAGER`: Project creation, objective definitions, pair authorization.
  * `FIELD_WORKER`: Direct intake, hardware uploads, field notes.
  * `REVIEWER`: Independent corroboration, review queue decisions, anomaly evaluation.
  * `VIEWER`: Read-only access to published projects, passports, and stories.

---

## 2. Core Entities

### `Project`
Main container for field evidence campaigns.
* `id`: String (cuid)
* `organizationId`: String (FK Organization)
* `name`: String
* `description`: String
* `category`: Impact taxonomy (Reforestation, Solar, Water, Waste, Infrastructure, Agriculture, etc.)
* `country`, `region`, `site`: Geospatial context
* `startDate`, `targetDate`: Temporal boundaries
* `status`: ACTIVE, UNDER_REVIEW, VERIFIED, ARCHIVED

### `EvidenceAsset`
Immutable record representing an uploaded media binary.
* `id`: Formal identifier (`EV-XXXX` format)
* `projectId`: FK Project
* `cloudinaryAssetId`: Cloudinary internal ID
* `cloudinaryPublicId`: Public ID for delivery and transformations
* `secureUrl`: Primary HTTPS delivery URL
* `resourceType`: `image`, `video`, `raw`
* `assetType`: `BEFORE`, `AFTER`, `PROGRESS`, `SUPPORTING`, `DOCUMENT`, `VIDEO`
* `sha256`: 256-bit cryptographic byte fingerprint
* `phash`: 64-bit DCT perceptual hash in hex
* `dhash`: 64-bit difference gradient hash in hex
* `captureTimestamp`: UTC hardware capture timestamp
* `gpsLat`, `gpsLon`: Decimal latitude and longitude
* `cameraMake`, `cameraModel`: Hardware sensor identification
* `softwareMetadata`: EXIF software tags (e.g. Photoshop detection)
* `metadataJson`: Complete unparsed EXIF dictionary
* `tagsJson`: Array of semantic classification tags
* `integrityStatus`: `INTACT`, `DERIVED`, `UNVERIFIED`, `REVIEW_REQUIRED`, `INTEGRITY_FAILURE`
* `reviewStatus`: `PENDING`, `CONFIRMED`, `REJECTED`, `INCONCLUSIVE`
* `parentAssetId`: Link to parent asset if this is a derived asset
* `transformationSpec`: Transformation parameters if derived

### `EvidenceRelation`
Represents paired comparative evidence (Before vs After).
* `beforeAssetId`: FK EvidenceAsset
* `afterAssetId`: FK EvidenceAsset
* `relationType`: `BEFORE_AFTER_PAIR`
* `pairConfidence`: Mathematical consistency score (0.0 to 1.0)
* `spatialDriftMeters`: Distance between capture coordinates
* `temporalGapDays`: Elapsed duration between captures
* `alignmentQuality`: Feature alignment confidence
* `changeScore`: Normalized visible change score (0 to 100%)
* `changeDetailsJson`: Full breakdown of SSIM, edge divergence, and pixel diff

### `ProvenanceEvent`
Append-only cryptographic hash chain events.
* `id`: Event UUID
* `projectId`: FK Project
* `assetId`: Nullable FK EvidenceAsset
* `eventType`: `PROJECT_CREATED`, `UPLOADED`, `HASHED`, `METADATA_EXTRACTED`, `AI_ANALYZED`, `PAIRED`, `ALIGNED`, `REVIEWED`, `DERIVED`, `EXPORTED`
* `actorId`: Agent, reviewer, or system identifier
* `payloadJson`: Canonical JSON dictionary of event inputs
* `previousHash`: Previous event hash in project sequence (or "GENESIS")
* `eventHash`: SHA256(previousHash + eventType + canonicalJson + timestamp + actor + assetHash)
* `sequenceNumber`: Monotonically increasing sequence number

### `ImpactObservation`
Quantitative and qualitative impact findings.
* `category`: `VEGETATION`, `SOLAR`, `WATER`, `INFRASTRUCTURE`, `WASTE`, `GENERIC`
* `metric`: Formal indicator key (e.g. `visible_canopy_vegetation_coverage`)
* `value`: Quantitative numerical measure
* `unit`: Percentage points, boolean, counts
* `method`: Analytical technique (e.g. ExG thresholding)
* `confidence`: Statistical confidence score (0.0 to 1.0)
* `source`: Sensor or AI provider

### `Review`
Human review corroboration records.
* `assetId`: FK EvidenceAsset
* `reviewerId`: FK User
* `decision`: `CONFIRMED`, `REJECTED`, `REQUEST_REVIEW`, `INCONCLUSIVE`
* `reason`: Mandatory audit justification

### `Story` & `StoryScene`
Compiled impact narrative with citations.
* `storyboardJson`: Full scene manifest
* `evidenceReferences`: Citations linking narrative assertions to evidence IDs
