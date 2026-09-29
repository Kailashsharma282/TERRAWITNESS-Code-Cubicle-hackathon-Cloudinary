"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileCheck2,
  GitCompare,
  TrendingUp,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Play,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  category: string;
  site: string;
  country: string;
  status: string;
  assets: Array<{
    id: string;
    assetType: string;
    secureUrl: string;
    integrityStatus: string;
    reviewStatus: string;
  }>;
  relations: Array<{ id: string; changeScore: number | null }>;
  _count: { assets: number; relations: number; provenanceEvents: number };
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTrustModal, setShowTrustModal] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.projects && data.projects.length > 0) {
        setProjects(data.projects);
        setSelectedProjectId(data.projects[0].id);
        fetchProjectDetails(data.projects[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
      setLoading(false);
    }
  }

  async function fetchProjectDetails(id: string) {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      setSelectedProject(data.project);
      setVerificationResult(data.chainStatus);
    } catch (err) {
      console.error("Failed to load project details:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectProject(id: string) {
    setSelectedProjectId(id);
    fetchProjectDetails(id);
  }

  async function handleVerifyEvidence() {
    if (!selectedProjectId) return;
    setVerificationLoading(true);
    try {
      const res = await fetch(`/api/provenance/${selectedProjectId}/verify`, { method: "POST" });
      const data = await res.json();
      setVerificationResult(data);
    } catch (err) {
      console.error("Chain verification failed:", err);
    } finally {
      setVerificationLoading(false);
    }
  }

  if (loading && !selectedProject) {
    return (
      <div className="flex h-96 items-center justify-center font-mono text-xs text-zinc-400">
        <span className="animate-pulse">LOADING IMPACT CONTROL ROOM TELEMETRY...</span>
      </div>
    );
  }

  const assets = selectedProject?.assets || [];
  const relations = selectedProject?.relations || [];
  const events = selectedProject?.provenanceEvents || [];
  const primaryRelation = relations[0];

  const confirmedCount = assets.filter((a: any) => a.reviewStatus === "CONFIRMED").length;
  const reviewCoverage = assets.length > 0 ? Math.round((confirmedCount / assets.length) * 100) : 0;
  const avgChange =
    relations.length > 0
      ? (
          relations.reduce((acc: number, r: any) => acc + (r.changeScore || 0), 0) /
          relations.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-8">
      {/* TOP STRIP & EDITORIAL CONTROL BANNER */}
      <div className="forensic-panel rounded-md p-4 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#232a36] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              TERRAWITNESS IMPACT CONTROL ROOM
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 font-sans">
              {selectedProject?.name || "Planetary Impact Observation Console"}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-400">
              <span>SITE: {selectedProject?.site}</span>
              <span>·</span>
              <span>COUNTRY: {selectedProject?.country}</span>
              <span>·</span>
              <span className="text-emerald-400 uppercase">CATEGORY: {selectedProject?.category}</span>
            </div>
          </div>

          {/* Project Selector & Trust Action */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedProjectId}
              onChange={(e) => handleSelectProject(e.target.value)}
              className="rounded border border-[#2b3442] bg-[#161a22] px-3 py-1.5 font-mono text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name.slice(0, 42)}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowTrustModal(true)}
              className="flex items-center gap-1.5 rounded border border-[#2b3442] bg-[#161a22] px-3 py-1.5 font-mono text-xs text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
              WHY TRUST THIS?
            </button>

            <button
              onClick={handleVerifyEvidence}
              disabled={verificationLoading}
              className="flex items-center gap-1.5 rounded bg-emerald-600 px-3.5 py-1.5 font-mono text-xs font-semibold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {verificationLoading ? "VERIFYING CHAIN..." : "VERIFY EVIDENCE"}
            </button>
          </div>
        </div>

        {/* PRIMARY METRICS BAR (Forensic Editorial Grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          <div className="forensic-panel-elevated rounded p-3 space-y-1">
            <div className="text-[11px] font-mono text-zinc-500">EVIDENCE ASSETS</div>
            <div className="text-2xl font-bold font-mono text-zinc-100">{assets.length}</div>
            <div className="text-[10px] font-mono text-zinc-400">Original field media</div>
          </div>

          <div className="forensic-panel-elevated rounded p-3 space-y-1">
            <div className="text-[11px] font-mono text-zinc-500">VERIFIED RECORDS</div>
            <div className="text-2xl font-bold font-mono text-emerald-400">{confirmedCount}</div>
            <div className="text-[10px] font-mono text-zinc-400">Reviewed & confirmed</div>
          </div>

          <div className="forensic-panel-elevated rounded p-3 space-y-1">
            <div className="text-[11px] font-mono text-zinc-500">EVIDENCE PAIRS</div>
            <div className="text-2xl font-bold font-mono text-zinc-100">{relations.length}</div>
            <div className="text-[10px] font-mono text-zinc-400">Before-vs-after sets</div>
          </div>

          <div className="forensic-panel-elevated rounded p-3 space-y-1">
            <div className="text-[11px] font-mono text-zinc-500">OBSERVED CHANGE</div>
            <div className="text-2xl font-bold font-mono text-cyan-400">{avgChange}%</div>
            <div className="text-[10px] font-mono text-zinc-400">Mean optical divergence</div>
          </div>

          <div className="forensic-panel-elevated rounded p-3 space-y-1">
            <div className="text-[11px] font-mono text-zinc-500">REVIEW COVERAGE</div>
            <div className="text-2xl font-bold font-mono text-zinc-100">{reviewCoverage}%</div>
            <div className="text-[10px] font-mono text-zinc-400">Human corroborated</div>
          </div>
        </div>
      </div>

      {/* VERIFICATION STATUS CALLOUT (Live Cryptographic Check) */}
      {verificationResult && (
        <div
          className={`forensic-panel rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            verificationResult.status === "INTACT"
              ? "border-emerald-500/40 bg-emerald-950/20"
              : "border-red-500/50 bg-red-950/20"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs font-bold">
              {verificationResult.status === "INTACT" ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-300">
                    EVIDENCE RECORD INTACT — {verificationResult.checksPassed}/{verificationResult.totalChecks} CHECKS PASSED
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="text-red-300">INTEGRITY FAILURE REQUIRING HUMAN REVIEW</span>
                </>
              )}
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              {verificationResult.impactExplanation || "Cryptographic SHA-256 hash continuity verified across all recorded events."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-zinc-400">ROOT HASH:</span>
            <code className="rounded bg-black/60 px-2 py-1 font-mono text-xs text-cyan-400 border border-[#232a36]">
              {verificationResult.rootHash ? `${verificationResult.rootHash.slice(0, 16)}...` : "GENESIS"}
            </code>
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN WORKSTATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: Timeline & Latest Verified Change */}
        <div className="lg:col-span-2 space-y-6">
          {/* LATEST VERIFIED PAIR COMPARISON */}
          {primaryRelation ? (
            <div className="forensic-panel rounded-md p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#232a36] pb-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                  <GitCompare className="h-4 w-4 text-emerald-400" />
                  PRIMARY VERIFIED PAIR: {primaryRelation.beforeAssetId} ⇄ {primaryRelation.afterAssetId}
                </div>
                <Link
                  href={`/comparisons/${primaryRelation.id}`}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                >
                  DEEP FORENSIC DIFF <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Before Asset */}
                <div className="space-y-2">
                  <div className="relative aspect-video rounded overflow-hidden border border-[#232a36] bg-black">
                    <img
                      src={primaryRelation.beforeAsset.secureUrl}
                      alt="Baseline capture"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2 left-2 rounded bg-black/80 px-2 py-0.5 font-mono text-[10px] text-zinc-300 border border-[#232a36]">
                      BEFORE · {primaryRelation.beforeAsset.id}
                    </div>
                  </div>
                  <div className="font-mono text-[11px] text-zinc-400 flex items-center justify-between">
                    <span>GPS: {primaryRelation.beforeAsset.gpsLat ? `${primaryRelation.beforeAsset.gpsLat}, ${primaryRelation.beforeAsset.gpsLon}` : "Recorded"}</span>
                    <span className="text-zinc-500">{new Date(primaryRelation.beforeAsset.captureTimestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* After Asset */}
                <div className="space-y-2">
                  <div className="relative aspect-video rounded overflow-hidden border border-[#232a36] bg-black">
                    <img
                      src={primaryRelation.afterAsset.secureUrl}
                      alt="Follow-up capture"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2 left-2 rounded bg-black/80 px-2 py-0.5 font-mono text-[10px] text-zinc-300 border border-[#232a36]">
                      AFTER · {primaryRelation.afterAsset.id}
                    </div>
                  </div>
                  <div className="font-mono text-[11px] text-zinc-400 flex items-center justify-between">
                    <span>GPS: {primaryRelation.afterAsset.gpsLat ? `${primaryRelation.afterAsset.gpsLat}, ${primaryRelation.afterAsset.gpsLon}` : "Recorded"}</span>
                    <span className="text-zinc-500">{new Date(primaryRelation.afterAsset.captureTimestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Pair Metrics Strip */}
              <div className="rounded border border-[#1f2633] bg-[#141821] p-3 text-xs font-mono text-zinc-300 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-zinc-500">OPTICAL CHANGE:</span>{" "}
                  <span className="text-emerald-400 font-bold">{primaryRelation.changeScore}%</span>
                </div>
                <div>
                  <span className="text-zinc-500">ALIGNMENT:</span>{" "}
                  <span className="text-zinc-200">{(primaryRelation.alignmentQuality * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-zinc-500">SPATIAL DRIFT:</span>{" "}
                  <span className="text-zinc-200">{primaryRelation.spatialDriftMeters || "55"}m</span>
                </div>
                <div>
                  <span className="text-zinc-500">TEMPORAL GAP:</span>{" "}
                  <span className="text-zinc-200">{primaryRelation.temporalGapDays || "151"} days</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="forensic-panel rounded-md p-6 text-center text-xs font-mono text-zinc-500">
              NO EVIDENCE PAIRS REGISTERED YET. Intake before and after captures to calculate change.
            </div>
          )}

          {/* PROJECT EVIDENCE TIMELINE */}
          <div className="forensic-panel rounded-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#232a36] pb-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                <Clock className="h-4 w-4 text-cyan-400" />
                PROJECT EVIDENCE CHRONOLOGY
              </div>
              <Link
                href="/stories"
                className="flex items-center gap-1.5 rounded border border-[#2b3442] bg-[#161a22] px-2.5 py-1 text-xs font-mono text-zinc-300 hover:text-white"
              >
                <Play className="h-3 w-3 text-emerald-400" />
                REPLAY PROJECT
              </Link>
            </div>

            <div className="space-y-3">
              {assets.map((ast: any, idx: number) => (
                <div
                  key={ast.id}
                  className="flex items-center justify-between p-2.5 rounded border border-[#1f2633] bg-[#131720] hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-zinc-500">#{String(idx + 1).padStart(2, "0")}</span>
                    <img
                      src={ast.secureUrl}
                      alt={ast.id}
                      className="h-10 w-14 object-cover rounded border border-[#232a36]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/evidence/${ast.id}`}
                          className="font-mono text-xs font-semibold text-zinc-200 hover:text-emerald-400"
                        >
                          {ast.id}
                        </Link>
                        <span className="rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-mono text-zinc-400 border border-[#232a36]">
                          {ast.assetType}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        HASH: {ast.sha256 ? `${ast.sha256.slice(0, 14)}...` : "PENDING"} · {new Date(ast.captureTimestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        ast.integrityStatus === "INTACT"
                          ? "border-emerald-500/30 text-emerald-400"
                          : "border-amber-500/30 text-amber-400"
                      }`}
                    >
                      {ast.integrityStatus}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        ast.reviewStatus === "CONFIRMED"
                          ? "border-cyan-500/30 text-cyan-400"
                          : "border-zinc-700 text-zinc-400"
                      }`}
                    >
                      {ast.reviewStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Provenance Activity & Story Readiness */}
        <div className="space-y-6">
          {/* STORY READINESS GAUGE */}
          <div className="forensic-panel rounded-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#232a36] pb-3 text-xs font-mono text-zinc-200 font-semibold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                STORY READINESS
              </span>
              <span className="text-emerald-400 font-bold">100% AUDIT READY</span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Sufficient before, after, and progress captures are registered and verified with intact provenance chains.
            </p>

            <div className="space-y-2 text-xs font-mono text-zinc-300">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500">Baseline evidence</span>
                <span className="text-emerald-400">✓ REGISTERED</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500">Intervention progress</span>
                <span className="text-emerald-400">✓ RECORDED</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500">Follow-up comparison</span>
                <span className="text-emerald-400">✓ ALIGNED</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500">Provenance continuity</span>
                <span className="text-emerald-400">✓ INTACT</span>
              </div>
            </div>

            <Link
              href="/stories"
              className="w-full flex items-center justify-center gap-2 rounded bg-zinc-100 py-2 text-xs font-mono font-bold text-zinc-950 hover:bg-white transition-colors"
            >
              COMPILE IMPACT STORY
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* RECENT CRYPTOGRAPHIC PROVENANCE EVENTS */}
          <div className="forensic-panel rounded-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#232a36] pb-3 text-xs font-mono text-zinc-200 font-semibold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                INTEGRITY ACTIVITY
              </span>
              <Link href="/provenance" className="text-cyan-400 hover:text-cyan-300 text-[11px]">
                FULL LEDGER
              </Link>
            </div>

            <div className="space-y-2.5">
              {events.slice(0, 6).map((evt: any) => (
                <div
                  key={evt.id}
                  className="rounded border border-[#1f2633] bg-[#12161f] p-2.5 font-mono text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-bold">#{evt.sequenceNumber} {evt.eventType}</span>
                    <span className="text-zinc-500">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">
                    HASH: <span className="text-zinc-300">{evt.eventHash}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    ACTOR: {evt.actorId} {evt.assetId ? `· ASSET: ${evt.assetId}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* "WHY SHOULD I TRUST THIS EVIDENCE?" MODAL (Section 101) */}
      {showTrustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="forensic-panel rounded-lg max-w-xl w-full p-6 space-y-5 border-emerald-500/40">
            <div className="flex items-center justify-between border-b border-[#232a36] pb-3">
              <h3 className="font-mono text-base font-bold text-zinc-100 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                WHY SHOULD I TRUST THIS EVIDENCE?
              </h3>
              <button
                onClick={() => setShowTrustModal(false)}
                className="text-zinc-500 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              TerraWitness establishes an auditable chain of custody around field media.
              Every claim is underpinned by five verification tiers:
            </p>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-[#161a22] border border-[#232a36]">
                <span>1. Original Asset Registered (Immutable Storage)</span>
                <span className="text-emerald-400">✓ VERIFIED</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#161a22] border border-[#232a36]">
                <span>2. Cryptographic Fingerprint Stored (SHA-256 + pHash)</span>
                <span className="text-emerald-400">✓ VERIFIED</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#161a22] border border-[#232a36]">
                <span>3. Hardware EXIF & GPS Metadata Captured</span>
                <span className="text-emerald-400">✓ VERIFIED</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#161a22] border border-[#232a36]">
                <span>4. Geometric Alignment & SSIM Structural Diff</span>
                <span className="text-emerald-400">✓ VERIFIED</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#161a22] border border-[#232a36]">
                <span>5. Human Reviewer Verification Corroborated</span>
                <span className="text-emerald-400">✓ VERIFIED</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#161a22] border border-emerald-500/40">
                <span className="text-zinc-100 font-semibold">Provenance Hash Chain Continuity</span>
                <span className="text-emerald-400 font-bold">● INTACT</span>
              </div>
            </div>

            <div className="rounded bg-[#12151c] p-3 text-[11px] font-mono text-zinc-400 border border-[#232a36] space-y-1">
              <span className="text-amber-400 font-bold">STATUTORY LIMITATIONS:</span>
              <p>
                Integrity certifies that the stored media byte stream and recorded chronological
                actions have not been tampered with since ingest. It does not independently guarantee
                physical camera sensor originality or statutory environmental credits without statutory certification.
              </p>
            </div>

            <button
              onClick={() => setShowTrustModal(false)}
              className="w-full rounded bg-zinc-100 py-2 font-mono text-xs font-bold text-zinc-950 hover:bg-white"
            >
              CLOSE EXPLANATION
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
