"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ScrollText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  Check,
  Search,
  Code2,
  Layers,
  Sparkles,
} from "lucide-react";

export default function ProvenanceLedgerPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [events, setEvents] = useState<any[]>([]);
  const [rootHash, setRootHash] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.projects && data.projects.length > 0) {
          setProjects(data.projects);
          setSelectedProjectId(data.projects[0].id);
          fetchProvenance(data.projects[0].id);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load projects:", err);
        setLoading(false);
      });
  }, []);

  async function fetchProvenance(projectId: string) {
    setLoading(true);
    setVerifyResult(null);
    try {
      const res = await fetch(`/api/provenance/${projectId}`);
      const data = await res.json();
      setEvents(data.events || []);
      setRootHash(data.rootHash || null);
    } catch (err) {
      console.error("Failed to fetch provenance ledger:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectProject(id: string) {
    setSelectedProjectId(id);
    fetchProvenance(id);
  }

  async function handleVerifyChain() {
    if (!selectedProjectId) return;
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/provenance/${selectedProjectId}/verify`, { method: "POST" });
      const data = await res.json();
      setVerifyResult(data);
    } catch (err) {
      console.error("Chain verification error:", err);
    } finally {
      setIsVerifying(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232a36] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
            <ScrollText className="h-4 w-4" />
            TERRAWITNESS CRYPTOGRAPHIC PROVENANCE LEDGER
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 font-sans">
            Immutable Chain of Custody
          </h1>
          <p className="text-xs font-mono text-zinc-400">
            Deterministic SHA-256 state chain linking every ingest, fingerprint, alignment, review, and story compilation.
          </p>
        </div>

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
            onClick={handleVerifyChain}
            disabled={isVerifying}
            className="flex items-center gap-1.5 rounded bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 font-mono text-xs font-bold text-white transition-colors disabled:opacity-50"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {isVerifying ? "CHECKING HASH CHAIN..." : "VERIFY EVIDENCE CHAIN"}
          </button>
        </div>
      </div>

      {/* VERIFY CHAIN RESULT STRIP */}
      {verifyResult && (
        <div
          className={`forensic-panel rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            verifyResult.status === "INTACT"
              ? "border-emerald-500/50 bg-emerald-950/20"
              : "border-red-500/50 bg-red-950/20"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs font-bold">
              {verifyResult.status === "INTACT" ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-300">
                    CHAIN INTACT — {verifyResult.checksPassed}/{verifyResult.totalChecks} CHECKS PASSED
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="text-red-300">INTEGRITY FAILURE</span>
                </>
              )}
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              {verifyResult.impactExplanation}
            </p>
          </div>
          <div className="font-mono text-xs text-zinc-300 flex items-center gap-2">
            <span>VERIFIED ROOT:</span>
            <code className="bg-black/60 rounded px-2 py-1 text-cyan-400 border border-[#232a36]">
              {verifyResult.rootHash ? `${verifyResult.rootHash.slice(0, 16)}...` : "GENESIS"}
            </code>
          </div>
        </div>
      )}

      {/* TWO-COLUMN WORKSTATION: Event Chain + Event Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: Visual Chain of Custody */}
        <div className="lg:col-span-2 space-y-4">
          <div className="forensic-panel rounded-md p-4 flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-[#232a36]">
            <span>{events.length} CRYPTOGRAPHIC EVENTS IN SEQUENCE</span>
            <span className="text-cyan-400">ROOT HASH: {rootHash ? `${rootHash.slice(0, 14)}...` : "GENESIS"}</span>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center font-mono text-xs text-zinc-500">
              <span className="animate-pulse">PARSING PROVENANCE LEDGER...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="forensic-panel rounded-md p-8 text-center text-xs font-mono text-zinc-500">
              NO PROVENANCE EVENTS RECORDED FOR THIS PROJECT YET.
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((evt, idx) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className={`forensic-panel rounded-md p-4 space-y-2 cursor-pointer transition-colors relative hover:border-zinc-500 ${
                    selectedEvent?.id === evt.id ? "border-emerald-500 bg-[#161c26]" : ""
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400">
                        EVENT #{String(evt.sequenceNumber).padStart(4, "0")}
                      </span>
                      <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] text-zinc-300 border border-[#232a36]">
                        {evt.eventType}
                      </span>
                      {evt.assetId && (
                        <span className="text-cyan-400 text-[11px]">
                          [{evt.assetId}]
                        </span>
                      )}
                    </div>
                    <span className="text-zinc-500 text-[11px]">
                      {new Date(evt.timestamp).toUTCString().slice(17, 25)} UTC
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                    <div>
                      <span className="text-zinc-500">PREV HASH:</span>{" "}
                      <code className="text-zinc-400">{evt.previousHash.slice(0, 16)}...</code>
                    </div>
                    <div>
                      <span className="text-zinc-500">EVENT HASH:</span>{" "}
                      <code className="text-cyan-400 font-bold">{evt.eventHash.slice(0, 16)}...</code>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1 border-t border-[#1f2633]">
                    <span>ACTOR: {evt.actorId}</span>
                    <span>CLICK TO INSPECT RAW PAYLOAD</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Event Node Inspector (Section 29) */}
        <div className="space-y-4">
          <div className="forensic-panel rounded-md p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#232a36] pb-3 text-xs font-mono text-zinc-200 font-semibold">
              <Code2 className="h-4 w-4 text-emerald-400" />
              EVENT NODE INSPECTOR
            </div>

            {selectedEvent ? (
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <div className="text-[10px] text-zinc-500">EVENT SEQUENCE NUMBER</div>
                  <div className="text-zinc-200 font-bold text-sm">
                    #{selectedEvent.sequenceNumber} · {selectedEvent.eventType}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-zinc-500">FULL EVENT HASH (SHA-256)</div>
                  <div className="flex items-center gap-2 pt-1">
                    <code className="break-all rounded bg-[#161a22] p-2 border border-[#232a36] text-[11px] text-cyan-400 flex-1">
                      {selectedEvent.eventHash}
                    </code>
                    <button
                      onClick={() => copyToClipboard(selectedEvent.eventHash)}
                      className="rounded border border-[#2b3442] bg-[#161a22] p-2 text-zinc-300 hover:text-white"
                      title="Copy Hash"
                    >
                      {copiedHash === selectedEvent.eventHash ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-zinc-500">PREVIOUS EVENT POINTER</div>
                  <code className="break-all rounded bg-[#161a22] p-2 border border-[#232a36] text-[11px] text-zinc-400 block mt-1">
                    {selectedEvent.previousHash}
                  </code>
                </div>

                <div>
                  <div className="text-[10px] text-zinc-500">CANONICAL JSON PAYLOAD</div>
                  <pre className="rounded bg-[#0c0e12] p-2.5 border border-[#232a36] text-[11px] text-zinc-300 overflow-x-auto max-h-56">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(selectedEvent.payloadJson), null, 2);
                      } catch {
                        return selectedEvent.payloadJson;
                      }
                    })()}
                  </pre>
                </div>

                {selectedEvent.assetId && (
                  <Link
                    href={`/evidence/${selectedEvent.assetId}`}
                    className="w-full flex items-center justify-center gap-1.5 rounded border border-[#2b3442] bg-[#161a22] py-2 text-xs font-mono text-zinc-200 hover:text-white transition-colors"
                  >
                    VIEW LINKED EVIDENCE {selectedEvent.assetId} <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-xs font-mono text-zinc-500">
                Click any event in the sequence to inspect its cryptographic digest and canonical JSON payload.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
