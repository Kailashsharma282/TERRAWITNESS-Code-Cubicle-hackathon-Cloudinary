# TerraWitness Production Deployment & Operations Guide

> **“The media doesn’t just show change. It testifies to it.”**

This comprehensive guide outlines the exact environment variables, architectural prerequisites, database migration steps, security controls, and zero-error verification procedures required to operate **TerraWitness** in a production environment.

---

## 1. Production Environment Variables Matrix

All configuration variables are managed via environment variables. Create a `.env.production` file or inject these secrets into your cloud orchestrator (AWS ECS, Kubernetes, Vercel, Supabase, Cloud Run, Render):

| Environment Variable | Required? | Default / Example | Purpose & Operational Impact | Where to Obtain |
|---|---|---|---|---|
| `DATABASE_URL` | **Yes** | `postgresql://user:pass@host:5432/terrawitness_db?schema=public` | Connection URI for the relational database. Supports PostgreSQL for multi-region production, or `file:./dev.db` for single-node SQLite. | Your database provider (Supabase, Neon, AWS RDS, GCP Cloud SQL, or Docker) |
| `CLOUDINARY_CLOUD_NAME` | **Yes** | `terrawitness-prod` | Unique Cloudinary account identifier for media storage, transformations, and AI analysis. | [Cloudinary Console](https://cloudinary.com/console) Dashboard |
| `CLOUDINARY_API_KEY` | **Yes** | `849281729482711` | Cloudinary API credentials used to authenticate signed server operations. | Cloudinary Console &rarr; Settings &rarr; Access Keys |
| `CLOUDINARY_API_SECRET` | **Yes** | `k93js...[secret]` | Cryptographic secret for signing uploads and validating incoming webhooks. **Never expose to client!** | Cloudinary Console &rarr; Settings &rarr; Access Keys |
| `CLOUDINARY_UPLOAD_PRESET` | Optional | `terrawitness_evidence_upload` | Preset defining storage folders, incoming transformations, and allowed formats. | Cloudinary Console &rarr; Settings &rarr; Upload |
| `CLOUDINARY_NOTIFICATION_URL` | Optional | `https://yourdomain.com/api/webhooks/cloudinary` | Webhook URL where Cloudinary posts async processing & delivery notifications. | Your public domain endpoint |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | **Yes** | `terrawitness-prod` | Client-accessible Cloudinary cloud name for direct signed browser uploads. | Same as `CLOUDINARY_CLOUD_NAME` |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Optional | `terrawitness_evidence_upload` | Client-accessible upload preset name. | Same as `CLOUDINARY_UPLOAD_PRESET` |
| `NEXT_PUBLIC_APP_URL` | **Yes** | `https://evidence.terrawitness.org` | Fully qualified public URL used to seal digital signatures, export passports, and QR verification URLs. | Your domain or production host |
| `PORT` | Optional | `3000` | Port for the Next.js production server. | Cloud runtime default |
| `HOSTNAME` | Optional | `0.0.0.0` | Binding network interface for Docker / containerized environments. | Default is `0.0.0.0` |
| `NODE_ENV` | **Yes** | `production` | Optimizes React 19 and Next.js 15 runtime performance. | Set to `production` |
| `ENABLE_DEMO_SEED` | Optional | `false` | When set to `false`, skips automated demo seeding on database push. Set to `true` for staging or hackathon evaluation. | Internal flag |
| `APPLY_MIGRATIONS` | Optional | `true` | Automatically synchronizes Prisma tables on container boot when using `scripts/entrypoint.mjs`. | Internal flag |
| `VISION_PROVIDER` | Optional | `CLOUDINARY` | Image vision provider interface (`CLOUDINARY` or `MOCK`). | Internal flag |
| `EMBEDDING_PROVIDER` | Optional | `FULLTEXT_FALLBACK` | Semantic search strategy. | Internal flag |

---

## 2. Cloudinary Production Configuration

To take full advantage of Cloudinary as the media infrastructure layer in production:

### Step 1: Create an Upload Preset
1. Navigate to **Cloudinary Console &rarr; Settings &rarr; Upload**.
2. Click **Add upload preset**.
3. Set **Preset name**: `terrawitness_production_preset`.
4. Set **Signing Mode**: `Signed` (recommended for evidence custody) or `Unsigned`.
5. Set **Folder**: `terrawitness`.
6. Enable **Auto-tagging** and **Quality: auto**.
7. Save the preset and add its name to `CLOUDINARY_UPLOAD_PRESET` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.

### Step 2: Configure Webhook Notifications
1. Navigate to **Cloudinary Console &rarr; Settings &rarr; Webhooks**.
2. Enter your notification URL:
   ```
   https://<YOUR_PRODUCTION_DOMAIN>/api/webhooks/cloudinary
   ```
3. Enable notifications for **Upload** and **Transformation Completed**.
4. Cloudinary signs all notifications using `CLOUDINARY_API_SECRET`. TerraWitness automatically verifies incoming signatures via `cloudinary.v2.utils.verifyNotificationSignature` in `src/app/api/webhooks/cloudinary/route.ts` and appends a cryptographically verified `CLOUDINARY_WEBHOOK_VERIFIED` event to the provenance hash chain.

---

## 3. Database Selection & Migration (PostgreSQL vs SQLite)

TerraWitness includes schemas for both zero-config local operation (SQLite) and enterprise production (PostgreSQL):

### Option A: Managed PostgreSQL (Recommended for Production)
1. Provision a PostgreSQL 15+ database (e.g., Supabase, Neon, AWS RDS, GCP Cloud SQL).
2. Set your `DATABASE_URL` in `.env.production`:
   ```bash
   DATABASE_URL="postgresql://user:password@host:5432/terrawitness_db?schema=public&sslmode=require"
   ```
3. Push the PostgreSQL schema:
   ```bash
   npm run prisma:postgres:push
   ```
4. Generate the Prisma client:
   ```bash
   npm run prisma:postgres:generate
   ```

### Option B: Local SQLite (Single-Server / Edge Appliance)
1. Set `DATABASE_URL="file:./dev.db"`.
2. Push schema and generate:
   ```bash
   npm run prisma:push
   npm run prisma:generate
   ```

---

## 4. Container Deployment (Docker & Docker Compose)

The repository provides a production-grade multi-stage `Dockerfile` and `docker-compose.yml`.

### Launching with Docker Compose
To boot both PostgreSQL and the TerraWitness Next.js application in isolated containers:

```bash
# 1. Provide your environment variables
cp .env.production.example .env

# 2. Build and launch containers
docker compose up --build -d

# 3. Inspect container logs
docker compose logs -f app
```

The container automatically:
1. Detects the `postgresql://` protocol in `DATABASE_URL`.
2. Applies the PostgreSQL schema (`prisma/schema.postgresql.prisma`).
3. Runs `prisma db push` to synchronize tables.
4. Generates Prisma client bindings.
5. Starts the production Next.js server with non-root security (`USER nextjs`).

---

## 5. Cloud Platform Deployments

### Vercel / Netlify
1. Connect your GitHub repository to Vercel.
2. In **Project Settings &rarr; Environment Variables**, paste all keys from `.env.production.example`.
3. In **Build Settings**, set the Build Command:
   ```bash
   npm run prisma:postgres:generate && npm run build
   ```
4. Deploy.

### AWS ECS / GCP Cloud Run / Kubernetes
1. Build the Docker container:
   ```bash
   docker build -t your-registry/terrawitness:latest .
   ```
2. Push to your registry:
   ```bash
   docker push your-registry/terrawitness:latest
   ```
3. Configure your container health probe:
   - **Protocol**: `HTTP`
   - **Path**: `/api/health`
   - **Port**: `3000`
   - **Expected Status**: `200 OK`

---

## 6. Production Health Monitoring (`/api/health`)

TerraWitness exposes a live health inspection endpoint at `/api/health`:

### Example Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-09-29T16:02:09.068Z",
  "latencyMs": 86,
  "services": {
    "database": {
      "status": "healthy",
      "latencyMs": 86
    },
    "cloudinary": {
      "configured": true,
      "cloudName": "terrawitness-prod"
    }
  },
  "version": "1.0.0",
  "environment": "production"
}
```

If the database is unreachable, the endpoint returns HTTP `503 Service Unavailable` with `status: "degraded"` so load balancers can safely route traffic.

---

## 7. Zero-Error Component & Test Verification

Before pushing to production, execute the automated verification suite:

```bash
# 1. Run the forensic and cryptographic test suite
npm test
# Result: 8/8 tests pass (Canonical JSON, SHA-256 genesis chaining, pHash, Haversine drift, Anomaly detection)

# 2. Run the strict ESLint verification
npm run lint
# Result: 0 errors, 0 warnings

# 3. Run full Next.js production build
npm run build
# Result: All 29 static & dynamic routes compile with exit code 0
```

---

## 8. Security & Data Custody Checklist

- [x] **No Secret Key Leakage**: `CLOUDINARY_API_SECRET` is only accessed in server-side API routes and lib services. Never exposed to browser bundle.
- [x] **Signed Upload Architecture**: Client uploads use server-generated HMAC-SHA1 signatures via `/api/evidence/upload-signature`.
- [x] **Webhook Replay Protection**: Cloudinary webhook notifications are verified using official SDK signature verification with a 3600-second replay window.
- [x] **Immutable Media Retention**: Original raw uploads are never overwritten. Derived transformed assets point back to `parentAssetId`.
- [x] **Cryptographic Audit Ledger**: Every upload, review, and verification appends an immutable SHA-256 block linked to `previous_event_hash`.
- [x] **Statutory Limitations Honored**: Clear disclaimers communicate that pHash and EXIF verify computational consistency and integrity, not statutory camera originality.
