"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Keyboard,
  Camera,
  AlertTriangle,
} from "lucide-react";

export default function ReviewQueuePage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [decisionReason, setDecisionReason] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  async function fetchQueue() {
    setLoading(true);
    try {
      // Fetch both PENDING and already confirmed for expert re-audit
      const res = await fetch("/api/evidence");
      const data = await res.json();
      setQueue(data.assets || []);
    } catch (err) {
      console.error("Failed to load review queue:", err);
    } finally {
      setLoading(false);
    }
  }

  const currentAsset = queue[currentIndex];

  // Submit human review decision
  async function submitDecision(decision: "CONFIRMED" | "REJECTED" | "REQUEST_REVIEW" | "INCONCLUSIVE") {
    if (!currentAsset) return;
    if (!decisionReason.trim()) {
      setNotice("Reviewer justification note is required for audit trail.");
      return;
    }

    setSubmitting(true);
    setNotice(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: currentAsset.id,
          decision,
          reason: decisionReason,
        }),
      });

      if (!res.ok) throw new Error("Failed to record review decision.");

      setNotice(`Decision [${decision}] sealed on cryptographic ledger.`);
      setDecisionReason("");

      // Advance to next asset
      if (currentIndex < queue.length - 1) {
        setCurrentIndex((i) => i + 1);
      }
      fetchQueue();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setNotice(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // Keyboard shortcuts (Section 77)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Only process when not focused in input/textarea
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) return;

      const key = e.key.toUpperCase();
      if (key === "A") submitDecision("CONFIRMED");
      else if (key === "X") submitDecision("REJECTED");
      else if (key === "R") submitDecision("REQUEST_REVIEW");
      else if (key === "N" && currentIndex < queue.length - 1) setCurrentIndex((i) => i + 1);
      else if (key === "P" && currentIndex > 0) setCurrentIndex((i) => i - 1);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, queue, decisionReason, currentAsset]);

  return (
    <div className="space-y-6">
      {/* Header and Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232a36] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
            <CheckSquare className="h-4 w-4" />
            TERRAWITNESS HUMAN REVIEW STATION
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 font-sans">
            Expert Review Queue
          </h1>
          <p className="text-xs font-mono text-zinc-400">
            Automated AI and CV observations require human corroboration before final audit sealing.
          </p>
        </div>

        {/* Keyboard shortcut legend (Section 77) */}
        <div className="hidden lg:flex items-center gap-2 rounded border border-[#232a36] bg-[#12161f] px-3 py-1.5 font-mono text-[11px] text-zinc-400">
          <Keyboard className="h-3.5 w-3.5 text-zinc-400" />
          <span>SHORTCUTS:</span>
          <kbd className="rounded bg-black px-1.5 py-0.5 border border-[#333f52] text-emerald-400">A</kbd> Confirm
          <kbd className="rounded bg-black px-1.5 py-0.5 border border-[#333f52] text-red-400 ml-1">X</kbd> Reject
          <kbd className="rounded bg-black px-1.5 py-0.5 border border-[#333f52] text-amber-400 ml-1">R</kbd> Flag
          <kbd className="rounded bg-black px-1.5 py-0.5 border border-[#333f52] text-zinc-200 ml-1">N</kbd> Next
          <kbd className="rounded bg-black px-1.5 py-0.5 border border-[#333f52] text-zinc-200 ml-1">P</kbd> Prev
        </div>
      </div>

      {loading ? (
        <div className="flex h-96 items-center justify-center font-mono text-xs text-zinc-400">
          <span className="animate-pulse">LOADING ASSETS FOR REVIEW...</span>
        </div>
      ) : !currentAsset ? (
        <div className="forensic-panel rounded-md p-10 text-center font-mono text-xs text-zinc-500">
          ALL EVIDENCE ASSETS HAVE BEEN CORROBORATED.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: Evidence Media & Capture Telemetry */}
          <div className="lg:col-span-2 space-y-4">
            <div className="forensic-panel rounded-md p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono border-b border-[#232a36] pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-200">{currentAsset.id}</span>
                  <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] text-zinc-400 border border-[#232a36]">
                    {currentAsset.assetType}
                  </span>
                  <span className="text-zinc-500">
                    ({currentIndex + 1} of {queue.length})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                    disabled={currentIndex === 0}
                    className="h-7 w-7 rounded border border-[#2b3442] bg-[#161a22] flex items-center justify-center text-zinc-300 hover:text-white disabled:opacity-30"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setCurrentIndex((i) => Math.min(queue.length - 1, i + 1))}
                    disabled={currentIndex === queue.length - 1}
                    className="h-7 w-7 rounded border border-[#2b3442] bg-[#161a22] flex items-center justify-center text-zinc-300 hover:text-white disabled:opacity-30"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Media viewer */}
              <div className="relative aspect-video rounded overflow-hidden border border-[#232a36] bg-black flex items-center justify-center">
                <img
                  src={currentAsset.secureUrl}
                  alt={currentAsset.id}
                  className="max-h-[460px] w-full object-contain"
                />
              </div>

              {/* Asset Technical Telemetry Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] p-2.5 rounded bg-[#141821] border border-[#232a36] text-zinc-400">
                <div>
                  <span className="text-zinc-500 block text-[10px]">PROJECT</span>
                  <span className="text-zinc-200 truncate block">{currentAsset.project?.name}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">EXIF TIMESTAMP</span>
                  <span className="text-zinc-200">
                    {currentAsset.captureTimestamp
                      ? new Date(currentAsset.captureTimestamp).toLocaleDateString()
                      : "Absent"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">GPS LOCATION</span>
                  <span className="text-zinc-200">
                    {currentAsset.gpsLat != null ? `${currentAsset.gpsLat.toFixed(3)}, ${currentAsset.gpsLon?.toFixed(3)}` : "Absent"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">SHA-256 STATE</span>
                  <span className="text-emerald-400 font-semibold">{currentAsset.integrityStatus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Review Actions & Justification Log */}
          <div className="space-y-4">
            <div className="forensic-panel rounded-md p-5 space-y-4 font-mono text-xs">
              <div className="text-zinc-200 font-semibold border-b border-[#232a36] pb-2 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                CORROBORATION DECISION
              </div>

              {/* Current status */}
              <div className="flex justify-between items-center p-2 rounded bg-[#161a22] border border-[#232a36]">
                <span className="text-zinc-400">CURRENT STATUS:</span>
                <span className="font-bold text-zinc-100">{currentAsset.reviewStatus}</span>
              </div>

              {/* Mandatory justification input */}
              <div className="space-y-1.5">
                <label className="text-zinc-300 block">
                  REVIEWER JUSTIFICATION / NOTES (MANDATORY):
                </label>
                <textarea
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="State evidence alignment with field logbooks, site plot verification, or reasons for rejection..."
                  className="w-full h-28 rounded border border-[#2b3442] bg-[#161a22] p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              {notice && (
                <div className="rounded p-2 text-[11px] border border-emerald-500/40 bg-emerald-950/20 text-emerald-300">
                  {notice}
                </div>
              )}

              {/* Decision Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => submitDecision("CONFIRMED")}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 rounded bg-emerald-600 hover:bg-emerald-500 py-2.5 font-bold text-white transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  CONFIRM & SEAL EVIDENCE [A]
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => submitDecision("REQUEST_REVIEW")}
                    disabled={submitting}
                    className="flex items-center justify-center gap-1.5 rounded border border-amber-500/40 bg-amber-950/20 text-amber-300 hover:bg-amber-950/40 py-2 transition-colors disabled:opacity-50"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    FLAG / RE-CHECK [R]
                  </button>

                  <button
                    onClick={() => submitDecision("REJECTED")}
                    disabled={submitting}
                    className="flex items-center justify-center gap-1.5 rounded border border-red-500/40 bg-red-950/20 text-red-300 hover:bg-red-950/40 py-2 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    REJECT RECORD [X]
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-zinc-500 leading-snug border-t border-[#232a36] pt-3">
                Audit Rule: Reviewer decisions cannot silently overwrite past verdicts; each action appends an immutable REVIEWED event to the project ledger.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
