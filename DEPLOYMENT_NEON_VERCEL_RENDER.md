# Complete Deployment Guide: Neon PostgreSQL, Vercel & Render

This guide provides end-to-end instructions for deploying **TerraWitness** to **Vercel** and **Render** backed by **Neon Serverless PostgreSQL** and **Cloudinary**.

---

## Table of Contents
1. [How to Get Each Environment Variable Step-by-Step](#1-how-to-get-each-environment-variable-step-by-step)
   - [A. Neon PostgreSQL (`DATABASE_URL`)](#a-neon-postgresql-database_url)
   - [B. Cloudinary Media Credentials](#b-cloudinary-media-credentials)
   - [C. Application Host & Public Keys](#c-application-host--public-keys)
2. [Step-by-Step Deployment: Vercel](#2-step-by-step-deployment-vercel)
3. [Step-by-Step Deployment: Render](#3-step-by-step-deployment-render)
4. [Database Initialization & Seeding on Neon](#4-database-initialization--seeding-on-neon)
5. [Production Healthcheck & Verification](#5-production-healthcheck--verification)

---

## 1. How to Get Each Environment Variable Step-by-Step

### A. Neon PostgreSQL (`DATABASE_URL`)

1. **Sign Up / Log In**:
   - Navigate to [https://neon.tech](https://neon.tech) and sign up (GitHub login recommended).
2. **Create a New Project**:
   - Click **"New Project"** in the top-right.
   - Project Name: `terrawitness` (or any preferred name).
   - Database Name: leave default as `neondb`.
   - Region: Choose the AWS region closest to your Vercel/Render deployment (e.g., `US East (N. Virginia)` or `EU Central (Frankfurt)`).
   - Click **"Create Project"**.
3. **Copy the Connection String**:
   - On your project dashboard, find the **Connection Details** box.
   - Select **"Prisma"** or **"Node.js"** from the language dropdown.
   - Check the **"Pooled connection"** checkbox (recommended for serverless environments like Vercel).
   - Click **"Copy"**.
   - Your connection string will look like this:
     ```text
     postgresql://neondb_owner:npg_AbCdEf123456@ep-cool-fog-987654-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
   - **Assign this to:** `DATABASE_URL`.

---

### B. Cloudinary Media Credentials

1. **Sign Up / Log In**:
   - Go to [https://cloudinary.com](https://cloudinary.com) and create an account.
2. **Copy Cloud Name, API Key & API Secret**:
   - On the [Cloudinary Console Dashboard](https://cloudinary.com/console):
     - **Cloud Name**: Copy from the top-left account panel (e.g., `dxyza1234`).
       &rarr; Assign to `CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.
     - In the Dashboard or click **Settings (gear icon)** &rarr; **Access Keys**:
       - **API Key**: Copy the 15-digit number (e.g., `817294827163829`).
         &rarr; Assign to `CLOUDINARY_API_KEY`.
       - **API Secret**: Click the eyeball icon to unhide and copy.
         &rarr; Assign to `CLOUDINARY_API_SECRET`.
3. **Create an Upload Preset**:
   - Click the **Gear icon (Settings)** at the bottom left &rarr; **Upload**.
   - Scroll down to the **"Upload presets"** section and click **"Add upload preset"**.
   - **Name**: Enter `terrawitness_preset`.
   - **Signing Mode**: Choose `Signed` (recommended) or `Unsigned`.
   - **Folder**: Enter `terrawitness`.
   - **Media analysis & AI**: Leave default or enable auto-tagging.
   - Click **"Save"** in the top right.
   - **Assign this to:** `CLOUDINARY_UPLOAD_PRESET` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.
4. **Configure Webhook Notifications**:
   - In Cloudinary Settings &rarr; **Webhooks**:
   - Enter your public notification URL:
     - For Vercel: `https://<YOUR_VERCEL_PROJECT>.vercel.app/api/webhooks/cloudinary`
     - For Render: `https://<YOUR_RENDER_SERVICE>.onrender.com/api/webhooks/cloudinary`
   - Select notification events: **Upload** and **Transformation Completed**.
   - **Assign this to:** `CLOUDINARY_NOTIFICATION_URL`.

---

### C. Application Host & Public Keys

| Variable | Local Development | Vercel Production | Render Production |
|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://your-project.vercel.app` | `https://your-service.onrender.com` |
| `NODE_ENV` | `development` | `production` | `production` |
| `ENABLE_DEMO_SEED` | `true` | `true` | `true` |
| `VISION_PROVIDER` | `CLOUDINARY` | `CLOUDINARY` | `CLOUDINARY` |
| `EMBEDDING_PROVIDER` | `FULLTEXT_FALLBACK` | `FULLTEXT_FALLBACK` | `FULLTEXT_FALLBACK` |

---

## 2. Step-by-Step Deployment: Vercel

### Step 1: Push Code to GitHub
Ensure your repository is pushed to GitHub:
```bash
git init
git add .
git commit -m "feat: TerraWitness production setup for Vercel and Render"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
git push -u origin main
```

### Step 2: Import into Vercel
1. Log in to [https://vercel.com](https://vercel.com).
2. Click **"Add New..."** &rarr; **"Project"**.
3. Under "Import Git Repository", find your `terrawitness` repository and click **"Import"**.

### Step 3: Configure Build & Framework Settings
Vercel automatically detects Next.js. The repository includes [vercel.json](file:///c:/Users/kaila/OneDrive/Desktop/Projects/TERRAWITNESS_code_cubicle_Hackathon_Cloudinary/vercel.json) preconfigured:
- **Framework Preset**: `Next.js`
- **Build Command**: `npm run vercel-build` (or leave default `next build`, as our `build` script automatically executes `scripts/prepare-prisma.mjs`)
- **Install Command**: `npm ci`

### Step 4: Add Environment Variables in Vercel
In the **Environment Variables** section of the Vercel import screen, add the following key-value pairs:

```env
DATABASE_URL=postgresql://neondb_owner:password@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=terrawitness_preset
CLOUDINARY_NOTIFICATION_URL=https://your-project.vercel.app/api/webhooks/cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=terrawitness_preset
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
NODE_ENV=production
ENABLE_DEMO_SEED=true
```

### Step 5: Initialize the Neon Database
Before or immediately after the first deploy, push your database schema to Neon from your terminal:
```bash
# Push tables to Neon PostgreSQL
npm run db:push
```
*Note: Ensure your local `.env` has the Neon `DATABASE_URL` set when running this command.*

### Step 6: Deploy
Click **"Deploy"** in Vercel. In ~1-2 minutes, your deployment will be live with a URL like `https://terrawitness.vercel.app`.

---

## 3. Step-by-Step Deployment: Render

Render offers two deployment methods: **Blueprint (render.yaml)** or **Manual Web Service**.

### Option A: 1-Click Blueprint via `render.yaml`
1. Go to [https://dashboard.render.com](https://dashboard.render.com).
2. Click **"New"** &rarr; **"Blueprint"**.
3. Connect your GitHub repository.
4. Render detects the included [render.yaml](file:///c:/Users/kaila/OneDrive/Desktop/Projects/TERRAWITNESS_code_cubicle_Hackathon_Cloudinary/render.yaml).
5. Enter the values for the synced environment variables (`DATABASE_URL`, `CLOUDINARY_*`, etc.).
6. Click **"Apply"**.

### Option B: Manual Web Service
1. In Render Dashboard, click **"New +"** &rarr; **"Web Service"**.
2. Connect your repository.
3. Configure the settings:
   - **Name**: `terrawitness`
   - **Language**: `Node`
   - **Branch**: `main`
   - **Region**: `Oregon (US West)` or `Ohio (US East)` (closest to Neon)
   - **Build Command**:
     ```bash
     npm install && npm run render-build
     ```
     *(This automatically runs `prepare-prisma.mjs`, synchronizes the Neon database tables, and executes `next build`)*
   - **Start Command**:
     ```bash
     npm start
     ```
4. **Environment Variables**:
   Under the "Environment" tab, add all keys from `.env.production`:
   - `DATABASE_URL` (Neon Postgres URL)
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `CLOUDINARY_UPLOAD_PRESET`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
   - `NEXT_PUBLIC_APP_URL`: `https://terrawitness.onrender.com`
   - `NODE_ENV`: `production`
   - `ENABLE_DEMO_SEED`: `true`
5. **Health Check Path**:
   - In "Advanced Settings", set **Health Check Path** to `/api/health`.
6. Click **"Create Web Service"**.

---

## 4. Database Initialization & Seeding on Neon

Once your `DATABASE_URL` is set to your Neon Postgres instance:

### Synchronize Schema:
```bash
npm run db:push
```
This runs `prisma db push` to generate all tables (`Organization`, `User`, `Project`, `EvidenceAsset`, `EvidenceRelation`, `ProvenanceEvent`, `Review`, `Story`, `ImpactObservation`, etc.).

### Seed Realistic Demonstrations:
```bash
npm run db:seed
```
This populates:
1. **Harapan Rainforest Canopy Recovery** (Reforestation with temporal satellite pairs)
2. **Atacama Bifacial Solar Farm Phase 2** (Solar irradiance & tracking data)
3. **Turkana Groundwater Borehole Network** (Aquifer forensic water level markers)

---

## 5. Production Healthcheck & Verification

Once deployed, verify your live system by visiting:

```http
GET https://<YOUR_DEPLOYED_URL>/api/health
```

Expected Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-09-29T16:02:09.068Z",
  "latencyMs": 42,
  "services": {
    "database": {
      "status": "healthy",
      "latencyMs": 42
    },
    "cloudinary": {
      "configured": true,
      "cloudName": "your-cloud-name"
    }
  },
  "version": "1.0.0",
  "environment": "production"
}
```

Visit the following key pages to confirm full operation:
- **`/dashboard`**: Mission Control metrics and live telemetry
- **`/comparisons/comp-harapan-01`**: Interactive split slider, thermal heatmap, and forensic "Show Me Why" explanation
- **`/provenance`**: Cryptographic SHA-256 hash chain ledger with copyable digests and independent verification
- **`/evidence/ingest`**: Intake workstation with EXIF parsing and live pHash extraction
- **`/verify`**: Public independent report verification portal
- **`/settings`**: Live Cloudinary API ping and diagnostic telemetry
