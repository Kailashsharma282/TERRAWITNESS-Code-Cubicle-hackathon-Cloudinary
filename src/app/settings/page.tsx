"use client";

import { useState } from "react";
import {
  Settings,
  ShieldCheck,
  Cpu,
  Database,
  Radio,
  Lock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function SettingsPage() {
  const [reseedLoading, setReseedLoading] = useState(false);
  const [reseedMsg, setReseedMsg] = useState<string | null>(null);
  const [testingCloudinary, setTestingCloudinary] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);

  async function handleReseedDemo() {
    setReseedLoading(true);
    setReseedMsg(null);
    try {
      const res = await fetch("/api/demo/seed", { method: "POST" });
      const data = await res.json();
      setReseedMsg(data.message || "Synthetic demo data synchronized successfully.");
    } catch (err) {
      setReseedMsg("Failed to synchronize demo data.");
    } finally {
      setReseedLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-mono text-xs">
      <div className="border-b border-[#232a36] pb-4 space-y-1">
        <div className="flex items-center gap-2 text-emerald-400">
          <Settings className="h-4 w-4" />
          TERRAWITNESS SYSTEM TELEMETRY & CONFIGURATION
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 font-sans">
          Platform Architecture Settings
        </h1>
        <p className="text-zinc-400 text-xs">
          Inspect media infrastructure health, AI provider endpoints, cryptographic ledger parameters, and data privacy policies.
        </p>
      </div>

      <div className="space-y-6">
        {/* Cloudinary Media Tier */}
        <div className="forensic-panel rounded-md p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#232a36] pb-3">
            <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
              <Radio className="h-4 w-4 text-cyan-400" />
              1. CLOUDINARY MEDIA INFRASTRUCTURE
            </div>
            <span className="rounded bg-cyan-950/40 border border-cyan-500/40 px-2 py-0.5 text-cyan-300 text-[11px]">
              SDK v2.11.0 ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-300">
            <div className="p-3 rounded bg-[#161a22] border border-[#232a36] space-y-1">
              <span className="text-zinc-500 text-[10px] block">CLOUD NAME</span>
              <span className="text-zinc-200 font-bold">{process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo"}</span>
            </div>
            <div className="p-3 rounded bg-[#161a22] border border-[#232a36] space-y-1">
              <span className="text-zinc-500 text-[10px] block">WEBHOOK NOTIFICATION URL</span>
              <span className="text-zinc-200">/api/webhooks/cloudinary (Signature Verified)</span>
            </div>
          </div>

          {/* Live Connection Test Block */}
          <div className="pt-2">
            <button
              onClick={async () => {
                setTestingCloudinary(true);
                setConnectionStatus(null);
                try {
                  const res = await fetch("/api/settings/test-connection", { method: "POST" });
                  const data = await res.json();
                  setConnectionStatus(data);
                } catch (err) {
                  setConnectionStatus({ connected: false, message: "Network error calling test endpoint." });
                } finally {
                  setTestingCloudinary(false);
                }
              }}
              disabled={testingCloudinary}
              className="flex items-center gap-1.5 rounded border border-cyan-500/40 bg-cyan-950/20 px-3 py-1.5 text-cyan-300 hover:bg-cyan-950/40 transition-colors text-xs"
            >
              <Radio className="h-3.5 w-3.5" />
              {testingCloudinary ? "PINGING CLOUDINARY API..." : "TEST CLOUDINARY CONNECTION"}
            </button>

            {connectionStatus && (
              <div
                className={`mt-2 p-3 rounded border text-[11px] leading-snug ${
                  connectionStatus.connected
                    ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                    : "border-amber-500/40 bg-amber-950/20 text-amber-300"
                }`}
              >
                <div className="font-bold">{connectionStatus.mode}</div>
                <div>{connectionStatus.message}</div>
              </div>
            )}
          </div>

          <p className="text-zinc-400 text-[11px] leading-relaxed">
            TerraWitness utilizes Cloudinary as an immutable media layer. Original assets are strictly append-only; derived assets (such as thumbnails, normalized comparison canvases, and redacted frames) maintain explicit parent references.
          </p>
        </div>

        {/* Cryptographic Ledger & Hash Chain */}
        <div className="forensic-panel rounded-md p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#232a36] pb-3">
            <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              2. CRYPTOGRAPHIC PROVENANCE ENGINE
            </div>
            <span className="rounded bg-emerald-950/40 border border-emerald-500/40 px-2 py-0.5 text-emerald-300 text-[11px]">
              SHA-256 HASH CHAIN ACTIVE
            </span>
          </div>

          <div className="space-y-2 text-zinc-300">
            <div className="p-3 rounded bg-[#161a22] border border-[#232a36]">
              <span className="text-zinc-500 text-[10px] block">GENESIS SPECIFICATION</span>
              <code>previous_event_hash = "GENESIS"</code>
            </div>
            <div className="p-3 rounded bg-[#161a22] border border-[#232a36]">
              <span className="text-zinc-500 text-[10px] block">EVENT HASH ALGORITHM</span>
              <code>event_hash = SHA256(prev_hash + event_type + canonical_json(payload) + timestamp + actor + asset_hash)</code>
            </div>
          </div>
        </div>

        {/* Database & Vector Tier */}
        <div className="forensic-panel rounded-md p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#232a36] pb-3">
            <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
              <Database className="h-4 w-4 text-emerald-400" />
              3. DATABASE & PERSISTENCE TIER
            </div>
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300 text-[11px]">
              PRISMA ORM CONNECTED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-300">
            <div className="p-3 rounded bg-[#161a22] border border-[#232a36]">
              <span className="text-zinc-500 text-[10px] block">DATABASE ENGINE</span>
              <span className="text-zinc-200 font-bold">Local SQLite / PostgreSQL Switchable</span>
            </div>
            <div className="p-3 rounded bg-[#161a22] border border-[#232a36]">
              <span className="text-zinc-500 text-[10px] block">SEARCH STRATEGY</span>
              <span className="text-zinc-200">Semantic Vector & Explainable Keyword Fallback</span>
            </div>
          </div>
        </div>

        {/* Demo Mode & Seed Control */}
        <div className="forensic-panel rounded-md p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#232a36] pb-3">
            <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
              <RotateCcw className="h-4 w-4 text-amber-400" />
              4. SYNTHETIC DEMO MODE CONTROLS
            </div>
            <span className="rounded bg-amber-950/40 border border-amber-500/40 px-2 py-0.5 text-amber-300 text-[11px]">
              DEMO SEED AVAILABLE
            </span>
          </div>

          <p className="text-zinc-400 text-[11px] leading-relaxed">
            Reset or refresh the pre-seeded high-fidelity sustainability demo datasets (Mangrove Restoration Site 04, Solar Microgrid Site 02, Riparian Corridor) with verified cryptographic event chains.
          </p>

          {reseedMsg && (
            <div className="p-3 rounded bg-emerald-950/20 border border-emerald-500/40 text-emerald-300 text-[11px]">
              {reseedMsg}
            </div>
          )}

          <button
            onClick={handleReseedDemo}
            disabled={reseedLoading}
            className="flex items-center gap-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 px-4 py-2 font-bold transition-colors disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {reseedLoading ? "SYNCHRONIZING DEMO DATASETS..." : "RESET / SEED DEMO DATA"}
          </button>
        </div>
      </div>
    </div>
  );
}
