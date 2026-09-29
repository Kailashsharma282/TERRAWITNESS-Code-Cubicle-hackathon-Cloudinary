"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Radio,
  Upload,
  CheckCircle2,
  Clock,
  Fingerprint,
  Cpu,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  ArrowRight,
} from "lucide-react";

export default function EvidenceIngestPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [assetType, setAssetType] = useState<string>("BEFORE");
  const [actorId, setActorId] = useState<string>("field.worker@terrawitness");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [registeredResult, setRegisteredResult] = useState<any>(null);

  const steps = [
    { num: 1, label: "Cloudinary Secure Upload", desc: "Transmitting original binary to media infrastructure" },
    { num: 2, label: "Asset Registered", desc: "Generating immutable record and persistent asset reference" },
    { num: 3, label: "Hardware EXIF & GPS Extraction", desc: "Parsing camera sensor, GPS coordinates, and timestamp" },
    { num: 4, label: "Integrity Fingerprint Sealed", desc: "Computing SHA-256 byte digest and DCT perceptual hash (pHash)" },
    { num: 5, label: "Visual & Semantic AI Analysis", desc: "Tagging environmental objects and assessing anomaly signals" },
    { num: 6, label: "Provenance Ledger Sealed", desc: "Appending SHA-256 chained event to project ledger" },
  ];

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.projects && data.projects.length > 0) {
          setProjects(data.projects);
          setSelectedProjectId(data.projects[0].id);
        }
      })
      .catch((err) => console.error("Error fetching projects:", err));
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setRegisteredResult(null);
      setErrorMsg(null);
    }
  }

  async function handleIngestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !selectedProjectId) {
      setErrorMsg("Please select a valid image file and project target.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setActiveStep(1);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectId", selectedProjectId);
    formData.append("assetType", assetType);
    formData.append("actorId", actorId);

    // Simulate animated timeline milestones
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev < 5 ? prev + 1 : prev));
    }, 450);

    try {
      const res = await fetch("/api/evidence/register", {
        method: "POST",
        body: formData,
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Evidence ingestion failed.");
      }

      const data = await res.json();
      setActiveStep(6);
      setRegisteredResult(data);
    } catch (err: unknown) {
      clearInterval(stepInterval);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-[#232a36] pb-4 space-y-1">
        <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
          <Radio className="h-4 w-4 animate-pulse" />
          FIELD EVIDENCE INTAKE WORKSTATION
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 font-sans">
          Intake Environmental Evidence Record
        </h1>
        <p className="text-xs font-mono text-zinc-400">
          Original media will be sealed with cryptographic SHA-256 fingerprints and immutable provenance chaining.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: Intake Parameters & File Selection */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleIngestSubmit} className="forensic-panel rounded-md p-5 space-y-5">
            {/* Target Project */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-zinc-300">
                1. TARGET IMPACT PROJECT
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full rounded border border-[#2b3442] bg-[#161a22] px-3 py-2 font-mono text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} [{p.category}]
                  </option>
                ))}
              </select>
            </div>

            {/* Evidence Classification Mode */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-zinc-300">
                2. EVIDENCE CAPTURE CLASSIFICATION
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { type: "BEFORE", label: "BEFORE BASELINE" },
                  { type: "AFTER", label: "AFTER FOLLOW-UP" },
                  { type: "PROGRESS", label: "PROGRESS" },
                  { type: "SUPPORTING", label: "SUPPORTING" },
                ].map((mode) => (
                  <button
                    key={mode.type}
                    type="button"
                    onClick={() => setAssetType(mode.type)}
                    className={`rounded border px-3 py-2 text-center font-mono text-xs transition-colors ${
                      assetType === mode.type
                        ? "border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold"
                        : "border-[#2b3442] bg-[#141821] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actor identity */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-zinc-300">
                3. SUBMITTING FIELD AGENT / STATION ID
              </label>
              <input
                type="text"
                value={actorId}
                onChange={(e) => setActorId(e.target.value)}
                className="w-full rounded border border-[#2b3442] bg-[#161a22] px-3 py-2 font-mono text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                placeholder="agent@organization.org or FIELD-STATION-01"
              />
            </div>

            {/* Media Dropzone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-zinc-300">
                4. EVIDENCE BINARY PAYLOAD
              </label>
              <div className="relative border-2 border-dashed border-[#2b3442] hover:border-zinc-500 rounded-md p-6 text-center cursor-pointer transition-colors bg-[#131720]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  disabled={isProcessing}
                />
                {previewUrl ? (
                  <div className="space-y-3">
                    <img
                      src={previewUrl}
                      alt="Selected preview"
                      className="mx-auto max-h-48 rounded object-cover border border-[#232a36]"
                    />
                    <div className="font-mono text-xs text-zinc-300">
                      {file?.name} ({(file?.size || 0 / 1024).toFixed(1)} KB)
                    </div>
                    <div className="text-[11px] font-mono text-emerald-400">
                      Click to replace binary file
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <Upload className="mx-auto h-8 w-8 text-zinc-500" />
                    <div className="font-mono text-xs text-zinc-300">
                      SELECT RAW FIELD CAPTURE (JPEG / PNG / TIFF)
                    </div>
                    <div className="text-[11px] font-mono text-zinc-500">
                      EXIF and GPS headers will be parsed automatically
                    </div>
                  </div>
                )}
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 rounded border border-red-500/40 bg-red-950/20 p-3 font-mono text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing || !file}
              className="w-full flex items-center justify-center gap-2 rounded bg-emerald-600 hover:bg-emerald-500 py-3 font-mono text-xs font-bold text-white transition-colors disabled:opacity-50"
            >
              <FileCheck2 className="h-4 w-4" />
              {isProcessing ? "PROCESSING & SEALING EVIDENCE CHAIN..." : "INTAKE & SEAL EVIDENCE RECORD"}
            </button>
          </form>

          {/* Success Summary if ingested */}
          {registeredResult && (
            <div className="forensic-panel rounded-md p-5 space-y-4 border-emerald-500/40 bg-emerald-950/10">
              <div className="flex items-center justify-between border-b border-[#232a36] pb-3">
                <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  EVIDENCE REGISTERED: {registeredResult.asset.id}
                </div>
                <Link
                  href={`/evidence/${registeredResult.asset.id}`}
                  className="flex items-center gap-1 font-mono text-xs text-cyan-400 hover:text-cyan-300"
                >
                  VIEW PASSPORT <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-300">
                <div>
                  <span className="text-zinc-500">SHA-256:</span>{" "}
                  <code className="text-zinc-200">{registeredResult.fingerprints.sha256.slice(0, 16)}...</code>
                </div>
                <div>
                  <span className="text-zinc-500">pHash:</span>{" "}
                  <code className="text-cyan-400">{registeredResult.fingerprints.phash}</code>
                </div>
                <div>
                  <span className="text-zinc-500">GPS:</span>{" "}
                  <span>
                    {registeredResult.metadata.gpsLat != null
                      ? `${registeredResult.metadata.gpsLat}, ${registeredResult.metadata.gpsLon}`
                      : "Not available in EXIF"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500">INTEGRITY:</span>{" "}
                  <span className="text-emerald-400 font-bold">{registeredResult.asset.integrityStatus}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Real-time Ingestion Pipeline Timeline */}
        <div className="forensic-panel rounded-md p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#232a36] pb-3 font-mono text-xs text-zinc-200 font-semibold">
            <Clock className="h-4 w-4 text-emerald-400" />
            EVIDENCE INTAKE TIMELINE
          </div>

          <div className="space-y-4 relative">
            {steps.map((st) => {
              const isDone = activeStep >= st.num;
              const isCurrent = activeStep === st.num && isProcessing;

              return (
                <div key={st.num} className="flex items-start gap-3 text-xs">
                  <div className="mt-0.5 flex flex-col items-center">
                    <div
                      className={`h-5 w-5 rounded-full flex items-center justify-center font-mono text-[10px] ${
                        isDone
                          ? "bg-emerald-500 text-black font-bold"
                          : isCurrent
                          ? "border-2 border-emerald-400 text-emerald-400 animate-spin"
                          : "border border-zinc-700 text-zinc-600"
                      }`}
                    >
                      {isDone ? "✓" : st.num}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div
                      className={`font-mono text-xs ${
                        isDone
                          ? "text-zinc-100 font-semibold"
                          : isCurrent
                          ? "text-emerald-400 font-semibold"
                          : "text-zinc-600"
                      }`}
                    >
                      {st.label}
                    </div>
                    <div className="text-[11px] text-zinc-500 leading-snug">
                      {st.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#232a36] text-[11px] font-mono text-zinc-500">
            Immutable Chain of Custody Rule: Original media bytes are never overwritten; derived assets maintain strict parent references.
          </div>
        </div>
      </div>
    </div>
  );
}
