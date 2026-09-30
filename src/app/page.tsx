"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { EvidenceImage } from "@/components/evidence-image";
import {
  ShieldCheck,
  ArrowRight,
  Fingerprint,
  Cpu,
  GitCompare,
  FileCheck2,
  CheckCircle2,
  Radio,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  const [sliderPos, setSliderPos] = useState(52);

  const chainSteps = [
    {
      num: "01",
      title: "FIELD CAPTURE",
      desc: "Original imagery uploaded directly from field stations via Cloudinary infrastructure. Media is treated as strictly immutable evidence.",
      icon: Radio,
    },
    {
      num: "02",
      title: "FINGERPRINT",
      desc: "SHA-256 byte-level digests and 64-bit DCT perceptual hashes (pHash/dHash) establish hardware integrity and identify reused media.",
      icon: Fingerprint,
    },
    {
      num: "03",
      title: "EXTRACT & ANALYZE",
      desc: "Hardware EXIF, GPS coordinates, capture chronology, and Cloudinary AI semantic tags parsed without synthetic fabrication.",
      icon: Cpu,
    },
    {
      num: "04",
      title: "REGISTER & COMPARE",
      desc: "Before/after captures registered, normalized, and evaluated for geo-temporal drift and multi-metric structural change (SSIM).",
      icon: GitCompare,
    },
    {
      num: "05",
      title: "HUMAN VERIFICATION",
      desc: "Independent project reviewers corroborate automated indicators, inspect anomalies, and seal review decisions.",
      icon: CheckCircle2,
    },
    {
      num: "06",
      title: "AUDIT-READY STORY & REPORT",
      desc: "Traceable narratives compiled where every claim cites a specific evidence ID [EV-XXX] backed by a cryptographic root hash.",
      icon: FileCheck2,
    },
  ];

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* HERO SECTION */}
      <section className="space-y-6 max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded border border-emerald-500/30 bg-[#121815] px-2.5 py-1 text-xs font-mono text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          EVIDENCE-GRADE SUSTAINABILITY PLATFORM
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-zinc-100 leading-[1.08] font-sans">
          THE MEDIA DOESN’T<br />
          JUST SHOW CHANGE.<br />
          <span className="text-zinc-400">IT TESTIFIES TO IT.</span>
        </h1>

        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed">
          TerraWitness turns sustainability and ecological media into traceable,
          evidence-grade impact records through Cloudinary media infrastructure,
          cryptographic provenance chains, and forensic computer vision.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-white transition-colors"
          >
            OPEN IMPACT CONTROL ROOM
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/provenance"
            className="flex items-center gap-2 rounded border border-[#2b3442] bg-[#12151c] px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-[#1a1f29] hover:text-white transition-colors font-mono"
          >
            SEE HOW PROVENANCE WORKS
          </Link>
        </div>
      </section>

      {/* INTERACTIVE BEFORE / AFTER EVIDENCE CANVAS */}
      <section className="forensic-panel rounded-md p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#232a36] pb-3 text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="text-zinc-200 font-semibold">LIVE EVIDENCE COMPARISON DEMO</span>
            <span className="text-zinc-500">·</span>
            <span className="text-zinc-400">Mangrove Coastal Restoration Site 04 [SYNTHETIC DEMO]</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <span>PAIR: EV-MANG-0101 ⇄ EV-MANG-0102</span>
            <span className="text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded text-[10px]">
              CHAIN INTACT
            </span>
          </div>
        </div>

        {/* Interactive Split Canvas */}
        <div className="relative h-[380px] sm:h-[480px] w-full overflow-hidden rounded border border-[#232a36] select-none bg-black">
          {/* AFTER Image (Background) */}
          <div className="absolute inset-0">
            <EvidenceImage
              src="https://res.cloudinary.com/jfsfulbk/image/upload/v1790780610/terrawitness_demo/mangrove_after.jpg"
              fallbackSrc="/evidence/mangrove_after.jpg"
              assetId="EV-MANG-0102"
              label="Mangrove Canopy Restored"
              alt="Follow-up Restoration State"
              className="h-full w-full object-cover"
            />
            <div className="absolute top-4 right-4 rounded bg-black/80 border border-[#232a36] px-3 py-1 font-mono text-xs text-zinc-200">
              AFTER · AUG 2026 [EV-MANG-0102]
            </div>
          </div>

          {/* BEFORE Image (Clipped Left Side) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <EvidenceImage
              src="https://res.cloudinary.com/jfsfulbk/image/upload/v1790780609/terrawitness_demo/mangrove_before.jpg"
              fallbackSrc="/evidence/mangrove_before.jpg"
              assetId="EV-MANG-0101"
              label="Baseline Degraded Mudflat"
              alt="Baseline Degraded State"
              className="absolute inset-0 h-full w-[100vw] max-w-none object-cover"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div className="absolute top-4 left-4 rounded bg-black/80 border border-[#232a36] px-3 py-1 font-mono text-xs text-zinc-200">
              BEFORE · MAR 2026 [EV-MANG-0101]
            </div>
          </div>

          {/* Divider line and handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize z-20"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-zinc-900 border border-zinc-300 flex items-center justify-center text-[10px] text-zinc-200 shadow-lg">
              ↔
            </div>
          </div>

          {/* Hidden range input for accessible dragging */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-ew-resize z-30 w-full h-full"
            aria-label="Before and after split slider"
          />

          {/* Bottom telemetry overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div className="rounded bg-[#0c0e12]/90 border border-[#232a36] px-3 py-1.5 font-mono text-xs text-zinc-300">
              <span className="text-zinc-500">MEASURED VISIBLE CHANGE:</span>{" "}
              <span className="text-emerald-400 font-bold">41.2%</span>
              <span className="text-zinc-500 ml-2">CONFIDENCE:</span>{" "}
              <span className="text-zinc-200">0.88</span>
            </div>
            <div className="rounded bg-[#0c0e12]/90 border border-[#232a36] px-3 py-1.5 font-mono text-xs text-zinc-300">
              <span className="text-zinc-500">PROVENANCE ROOT:</span>{" "}
              <span className="text-cyan-400 font-mono">c78a...b912</span>
              <span className="text-emerald-400 ml-2">● INTACT</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-500 font-mono text-center">
          Drag the slider to observe registered visual progression across field captures.
        </p>
      </section>

      {/* CHAIN OF CUSTODY SHOWCASE SECTION */}
      <section className="space-y-8">
        <div className="space-y-2">
          <div className="text-xs font-mono text-emerald-400">UNBROKEN LINEAGE</div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            THE TERRAWITNESS CHAIN OF CUSTODY
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl">
            Every piece of evidence follows an immutable path from intake to audit-ready verification.
          </p>
        </div>

        {/* 6 Step Linear Grid with connecting line effect */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chainSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="forensic-panel rounded-md p-5 space-y-3 relative group hover:border-[#3b4759] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-emerald-400 font-bold">
                    {step.num}
                  </span>
                  <div className="h-7 w-7 rounded border border-[#2a3442] bg-[#161a22] flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 transition-colors">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>
                <h3 className="font-mono text-sm font-semibold text-zinc-100">
                  {step.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* QUICK LAUNCH CALLOUT */}
      <section className="forensic-panel rounded-md p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-4 border-l-emerald-500">
        <div className="space-y-1">
          <div className="text-xs font-mono text-emerald-400">ACTIVE MISSIONS</div>
          <h3 className="text-xl font-bold text-zinc-100">
            Ready to explore verified planetary evidence?
          </h3>
          <p className="text-sm text-zinc-400 max-w-xl">
            Inspect pre-seeded high-fidelity restoration and solar projects or intake fresh field captures.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded bg-emerald-500 px-4 py-2 text-xs font-mono font-bold text-zinc-950 hover:bg-emerald-400 transition-colors"
          >
            LAUNCH CONTROL ROOM
          </Link>
          <Link
            href="/evidence/ingest"
            className="rounded border border-[#2b3442] bg-[#161b24] px-4 py-2 text-xs font-mono font-medium text-zinc-300 hover:text-white transition-colors"
          >
            INTAKE EVIDENCE
          </Link>
        </div>
      </section>
    </div>
  );
}
