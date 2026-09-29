# TERRAWITNESS

> **“The media doesn’t just show change. It testifies to it.”**

TerraWitness is an **evidence-grade AI impact and sustainability media platform** engineered to establish an unbroken, auditable chain of custody around field environmental media.

Instead of serving as a generic photo gallery, an ungrounded AI caption generator, or a simplistic before/after slider, TerraWitness solves the foundational crisis of modern sustainability verification: **trustworthy provenance, geometric alignment, verifiable change quantification, and traceable impact storytelling.**

---

## Core Product Capabilities

1. **Cloudinary as Immutable Media Infrastructure**: Upload, signed asset ingestion, non-destructive derivative transformations, authenticated delivery, and video reel compilation.
2. **Cryptographic Provenance Engine**: Append-only SHA-256 state chain sealing every lifecycle event from ingest to audit report.
3. **Hardware EXIF & Geo-Temporal Drift Forensics**: Extraction of true camera hardware metadata, GPS coordinates, and spatial/temporal drift computation.
4. **Cinematic Comparative Forensics**: Multi-mode comparison workstation (Slider, Side-by-Side, Fade, Difference Inversion, Heatmap) with synchronized zoom, alignment grid, and Evidence Lens overlay.
5. **Computer-Vision Change Detection**: Multi-metric structural divergence (SSIM, illumination-normalized pixel difference, edge divergence, normalized visible change score).
6. **Domain-Specific Impact Analyzers**: Modular analyzers for Vegetation (ExG index), Solar arrays, Surface Water, and Infrastructure.
7. **Traceable Evidence-to-Story Compiler**: Compiles verified evidence into impact story reels where every claim cites a specific evidence ID (`[EV-XXX]`) linking directly back to raw source data and cryptographic proofs.
8. **Explainable Semantic Evidence Search**: Search across visual semantics, project taxonomy, and hardware metadata with explicit "Why This Matched" breakdowns.
9. **Audit-Ready Evidence Reports**: Cryptographically signed reports with root provenance hashes, inventory manifests, methodology documentation, and statutory limitation disclosures.
10. **Expert Human Review Station**: Dedicated review queue with keyboard shortcuts (`A`, `R`, `X`, `N`, `P`) and mandatory reviewer justification logging.

---

## Architectural Principles & Anti-Hallucination Guarantees

* **Strict Cloudinary SDK Conformity**: Uses official `cloudinary` v2.11.0 SDK methods (`utils.api_sign_request`, `utils.verifyNotificationSignature`, `uploader.upload_stream`, `url`). Zero fabricated APIs.
* **Original Media Immutability**: Uploaded media binaries are never overwritten. Any transformation (crop, watermark, face blur) produces an explicit derivative with parent lineage.
* **Deterministic Application Hashes**: Byte-level SHA-256 fingerprints, 64-bit DCT perceptual hashes (pHash), and difference hashes (dHash) are computed directly within the application engine.
* **Explicit Diagnostic Integrity**: Cryptographic chain verification provides exact diagnostic reasons (expected vs observed hash, affected event, human review impact).
* **Statutory Limitations Disclosure**: Every report, passport, and observation visibly discloses that optical indicators and recorded provenance do not independently prove physical camera originality or legal carbon credits without statutory certification.

---

## Quickstart & Local Setup

### 1. Prerequisites

* **Node.js**: v18+ (tested on Node v25.9)
* **npm**: v9+
* **Database**: Local SQLite (zero-config, default) or PostgreSQL 14+

### 2. Installation

```bash
git clone <repo-url>
cd terrawitness
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your credentials:

```ini
# Local SQLite database (default) or PostgreSQL URL
DATABASE_URL="file:./dev.db"

# Cloudinary Media Infrastructure
CLOUDINARY_CLOUD_NAME="demo"
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
CLOUDINARY_UPLOAD_PRESET=""

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="demo"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

ENABLE_DEMO_SEED="true"
```

### 4. Database Setup & Seeding

```bash
# Push Prisma schema to database
npx prisma db push

# Seed high-fidelity synthetic demo datasets (Mangrove Restoration, Solar Microgrid, Riparian Corridor)
npx tsx scripts/seed.mjs
```

### 5. Launch Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the TerraWitness Control Room.

---

## Documentation Directory

* [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture, module boundaries, and end-to-end data flows.
* [DATA_MODEL.md](./DATA_MODEL.md) — Complete database schema, Prisma models, and relationships.
* [PROVENANCE.md](./PROVENANCE.md) — Cryptographic hash chain specification and integrity algorithms.
* [CLOUDINARY_INTEGRATION.md](./CLOUDINARY_INTEGRATION.md) — Official Cloudinary SDK integration, webhook verification, and transformations.
* [AI_PIPELINE.md](./AI_PIPELINE.md) — AI vision semantics, provider interfaces, and auditability.
* [CV_PIPELINE.md](./CV_PIPELINE.md) — Image registration, SSIM structural difference, ExG vegetation index, and anomaly detection.
* [SECURITY.md](./SECURITY.md) — Webhook security, replay protection, signed uploads, and role enforcement.
* [LIMITATIONS.md](./LIMITATIONS.md) — Transparent boundaries: what TerraWitness proves vs what it does not prove.
* [DEMO_GUIDE.md](./DEMO_GUIDE.md) — 3-to-5 minute judge demonstration walkthrough.

---

## License

MIT License. Engineered for planetary impact and sustainability accountability.
