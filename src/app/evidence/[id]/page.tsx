"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileCheck2,
  Fingerprint,
  Cpu,
  MapPin,
  Clock,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Download,
  ArrowLeft,
  ExternalLink,
  Eye,
  Layers,
} from "lucide-react";

export default function EvidenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [evidenceLens, setEvidenceLens] = useState(false);
  const [stampMode, setStampMode] = useState(false);

  useEffect(() => {
    fetch(`/api/evidence/${id}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load asset details:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center font-mono text-xs text-zinc-400">
        <span className="animate-pulse">DECRYPTING AND VERIFYING EVIDENCE RECORD {id}...</span>
      </div>
    );
  }

  if (!data?.asset) {
    return (
      <div className="forensic-panel rounded-md p-8 text-center space-y-4">
        <div className="text-sm font-mono text-zinc-400">EVIDENCE RECORD NOT FOUND</div>
        <Link href="/evidence" className="text-xs font-mono text-emerald-400">
          ← RETURN TO EVIDENCE ARCHIVE
        </Link>
      </div>
    );
  }

  const { asset, verification, passport, anomalies } = data;
  let rawExif: Record<string, unknown> = {};
  try {
    if (asset.metadataJson) rawExif = JSON.parse(asset.metadataJson);
  } catch {
    rawExif = {};
  }

  let tags: string[] = [];
  try {
    if (asset.tagsJson) tags = JSON.parse(asset.tagsJson);
  } catch {
    tags = [];
  }

  function downloadPassportJson() {
    const jsonStr = JSON.stringify(passport, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EVIDENCE-PASSPORT-${asset.id}.json`;
    a.click();
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232a36] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/evidence"
            className="flex items-center gap-1 font-mono text-xs text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> ARCHIVE
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="font-mono text-xs font-bold text-zinc-200">{asset.id}</span>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              asset.integrityStatus === "INTACT"
                ? "border-emerald-500/30 text-emerald-400 bg-emerald-950/20"
                : "border-amber-500/30 text-amber-400 bg-amber-950/20"
            }`}
          >
            {asset.integrityStatus}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#232a36] text-zinc-400">
            {asset.assetType}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEvidenceLens(!evidenceLens)}
            className={`flex items-center gap-1.5 rounded border px-3 py-1.5 font-mono text-xs transition-colors ${
              evidenceLens
                ? "border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold"
                : "border-[#2b3442] bg-[#161a22] text-zinc-300 hover:text-white"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            EVIDENCE LENS: {evidenceLens ? "ACTIVE" : "OFF"}
          </button>

          <button
            onClick={downloadPassportJson}
            className="flex items-center gap-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 px-3 py-1.5 font-mono text-xs font-bold transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            EVIDENCE PASSPORT
          </button>
        </div>
      </div>

      {/* THREE-COLUMN FORENSIC LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* COLUMN 1: Metadata & Capture Telemetry */}
        <div className="space-y-4 lg:col-span-1">
          <div className="forensic-panel rounded-md p-4 space-y-4">
            <div className="flex items-center gap-1.5 border-b border-[#232a36] pb-2 text-xs font-mono text-zinc-200 font-semibold">
              <Camera className="h-4 w-4 text-emerald-400" />
              HARDWARE METADATA
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="text-[10px] text-zinc-500">CAPTURE HARDWARE</div>
                <div className="text-zinc-200">
                  {asset.cameraMake || asset.cameraModel
                    ? `${asset.cameraMake || ""} ${asset.cameraModel || ""}`
                    : "Not available in EXIF"}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-zinc-500">EXIF TIMESTAMP (UTC)</div>
                <div className="text-zinc-200">
                  {asset.captureTimestamp
                    ? new Date(asset.captureTimestamp).toISOString().replace("T", " ").slice(0, 19)
                    : "Not recorded"}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-zinc-500">GEOSPATIAL COORDINATES (GPS)</div>
                <div className="text-zinc-200">
                  {asset.gpsLat != null && asset.gpsLon != null
                    ? `${asset.gpsLat.toFixed(5)}, ${asset.gpsLon.toFixed(5)}`
                    : "Not recorded in image headers"}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-zinc-500">SENSOR PROFILE</div>
                <div className="text-zinc-300 text-[11px]">
                  Focal: {rawExif.focalLength ? `${String(rawExif.focalLength)}mm` : "—"} · ISO: {rawExif.iso ? String(rawExif.iso) : "—"} · f/{rawExif.fNumber ? String(rawExif.fNumber) : "—"}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-zinc-500">SOFTWARE / EDITOR HEADER</div>
                <div className="text-zinc-300">
                  {asset.softwareMetadata ? (
                    <span className="text-amber-400">{asset.softwareMetadata}</span>
                  ) : (
                    "None (Clean camera capture)"
                  )}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-zinc-500">DIMENSIONS & FILE SIZE</div>
                <div className="text-zinc-200">
                  {asset.width && asset.height ? `${asset.width} × ${asset.height} px` : "—"} · {(asset.fileSize / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>
          </div>

          {/* Anomaly Alerts (if any) */}
          {anomalies && anomalies.length > 0 && (
            <div className="forensic-panel rounded-md p-4 space-y-3 border-amber-500/30 bg-amber-950/10">
              <div className="flex items-center gap-1.5 font-mono text-xs text-amber-400 font-semibold border-b border-amber-500/20 pb-2">
                <AlertTriangle className="h-4 w-4" />
                ANOMALY SIGNALS ({anomalies.length})
              </div>
              <div className="space-y-2">
                {anomalies.map((an: any) => (
                  <div key={an.id} className="text-xs font-mono space-y-0.5">
                    <div className="text-amber-300 font-medium">{an.title}</div>
                    <div className="text-[11px] text-zinc-400 leading-snug">{an.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* COLUMN 2: Center Media Viewer */}
        <div className="space-y-4 lg:col-span-2">
          <div className="forensic-panel rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-[#232a36] pb-2">
              <span>MEDIA BINARY: {asset.originalFilename || "field_capture.jpg"}</span>
              <span className="text-cyan-400">CLOUDINARY SECURE URL</span>
            </div>

            <div className="relative rounded overflow-hidden border border-[#232a36] bg-black aspect-video flex items-center justify-center">
              <img
                src={asset.secureUrl}
                alt={asset.id}
                className="max-h-[460px] w-full object-contain"
              />

              {/* EVIDENCE LENS FORENSIC OVERLAY (Section 27) */}
              {evidenceLens && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] p-4 flex flex-col justify-between pointer-events-none alignment-grid-overlay font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="rounded bg-black/80 border border-emerald-500/40 p-2 space-y-1">
                      <div className="text-emerald-400 font-bold">EVIDENCE LENS ACTIVATED</div>
                      <div className="text-zinc-300 text-[10px]">ASSET ID: {asset.id}</div>
                      <div className="text-zinc-300 text-[10px]">
                        GPS: {asset.gpsLat != null ? `${asset.gpsLat}, ${asset.gpsLon}` : "COORDINATES ABSENT"}
                      </div>
                      <div className="text-zinc-300 text-[10px]">
                        TIME: {asset.captureTimestamp ? new Date(asset.captureTimestamp).toUTCString() : "PENDING"}
                      </div>
                    </div>
                    <div className="rounded bg-black/80 border border-cyan-500/40 p-2 text-right">
                      <div className="text-cyan-400 font-bold">SHA-256 STATE</div>
                      <div className="text-zinc-300 text-[10px]">{asset.sha256.slice(0, 16)}...</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="rounded bg-black/80 border border-zinc-700 p-2 text-[10px] text-zinc-300">
                      CLASSIFICATION: {asset.assetType}
                    </div>
                    <div className="rounded bg-black/80 border border-emerald-500/40 p-2 text-[10px] text-emerald-400 font-bold">
                      ● CRYPTOGRAPHIC LEDGER SEALED
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-mono text-[11px] text-zinc-500">
              <span>Cloudinary Public ID: {asset.cloudinaryPublicId || "local_registered"}</span>
              <a
                href={asset.secureUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
              >
                OPEN RAW ASSET <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* COLUMN 3: Provenance & Fingerprints */}
        <div className="space-y-4 lg:col-span-1">
          <div className="forensic-panel rounded-md p-4 space-y-4">
            <div className="flex items-center gap-1.5 border-b border-[#232a36] pb-2 text-xs font-mono text-zinc-200 font-semibold">
              <Fingerprint className="h-4 w-4 text-cyan-400" />
              PROVENANCE & INTEGRITY
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="text-[10px] text-zinc-500">SHA-256 DIGEST</div>
                <code className="text-xs text-zinc-200 block break-all rounded bg-[#161a22] p-1.5 border border-[#232a36]">
                  {asset.sha256}
                </code>
              </div>

              <div>
                <div className="text-[10px] text-zinc-500">PERCEPTUAL HASH (DCT pHash)</div>
                <code className="text-xs text-cyan-400 block rounded bg-[#161a22] p-1.5 border border-[#232a36]">
                  {asset.phash || "Computed on ingest"}
                </code>
              </div>

              <div>
                <div className="text-[10px] text-zinc-500">DIFFERENCE HASH (dHash)</div>
                <code className="text-xs text-zinc-300 block rounded bg-[#161a22] p-1.5 border border-[#232a36]">
                  {asset.dhash || "Computed on ingest"}
                </code>
              </div>

              <div>
                <div className="text-[10px] text-zinc-500">CHAIN OF CUSTODY VERIFICATION</div>
                <div className="text-emerald-400 font-bold pt-0.5">
                  ● {verification.status}
                </div>
                <div className="text-[10px] text-zinc-500 leading-snug pt-1">
                  {verification.details}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-zinc-500">AI VISION TAGS</div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {tags.map((tg) => (
                    <span
                      key={tg}
                      className="rounded bg-[#161a22] border border-[#232a36] px-1.5 py-0.5 text-[10px] text-zinc-300"
                    >
                      {tg}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#232a36]">
                <div className="text-[10px] text-zinc-500">HUMAN REVIEW STATUS</div>
                <div className="text-zinc-200 font-semibold pt-0.5">
                  {asset.reviewStatus}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
