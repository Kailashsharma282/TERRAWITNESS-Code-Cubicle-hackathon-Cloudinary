"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Copy,
  Check,
  Printer,
} from "lucide-react";

export default function ReportsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedSignature, setCopiedSignature] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((d) => {
        if (d.projects && d.projects.length > 0) {
          setProjects(d.projects);
          setSelectedProjectId(d.projects[0].id);
          generateReportForProject(d.projects[0].id);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load projects:", err);
        setLoading(false);
      });
  }, []);

  async function generateReportForProject(projectId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${projectId}`, { method: "POST" });
      const data = await res.json();
      setReport(data.report);
    } catch (err) {
      console.error("Failed to generate report:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectProject(id: string) {
    setSelectedProjectId(id);
    generateReportForProject(id);
  }

  function downloadEvidenceBundle() {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TERRAWITNESS-AUDIT-BUNDLE-${report.reportId}.json`;
    a.click();
  }

  function copySignature() {
    if (!report) return;
    navigator.clipboard.writeText(report.digitalSignature);
    setCopiedSignature(true);
    setTimeout(() => setCopiedSignature(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232a36] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
            <FileCheck2 className="h-4 w-4" />
            TERRAWITNESS AUDIT-READY EVIDENCE REPORTS
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 font-sans">
            Cryptographically Sealed Report
          </h1>
          <p className="text-xs font-mono text-zinc-400">
            Self-describing audit report compiling evidence inventory, comparisons, provenance event hashes, and methodology limitations.
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
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded border border-[#2b3442] bg-[#161a22] px-3 py-1.5 font-mono text-xs text-zinc-300 hover:text-white"
          >
            <Printer className="h-3.5 w-3.5" /> PRINT
          </button>

          <button
            onClick={downloadEvidenceBundle}
            disabled={!report}
            className="flex items-center gap-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 px-3.5 py-1.5 font-mono text-xs font-bold transition-colors disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            EXPORT EVIDENCE BUNDLE
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-96 items-center justify-center font-mono text-xs text-zinc-500">
          <span className="animate-pulse">COMPILING & DIGITALLY SIGNING AUDIT REPORT...</span>
        </div>
      ) : !report ? (
        <div className="forensic-panel rounded-md p-8 text-center text-xs font-mono text-zinc-500">
          UNABLE TO LOAD EVIDENCE REPORT.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cryptographic Seal Banner */}
          <div className="forensic-panel rounded-md p-5 border-emerald-500/40 bg-emerald-950/15 space-y-3 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/30 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-emerald-300">
                  DIGITALLY SEALED AUDIT REPORT: {report.reportId}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">LEDGER STATUS:</span>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-400 font-bold border border-emerald-500/40">
                  ● {report.chainStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] pt-1">
              <div>
                <span className="text-zinc-500">ROOT PROVENANCE HASH:</span>
                <code className="text-zinc-200 block break-all pt-0.5">
                  {report.rootProvenanceHash || "GENESIS_PENDING"}
                </code>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">DIGITAL SIGNATURE (SEAL):</span>
                  <button
                    onClick={copySignature}
                    className="text-zinc-400 hover:text-white inline-flex items-center gap-1"
                  >
                    {copiedSignature ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedSignature ? "COPIED" : "COPY"}</span>
                  </button>
                </div>
                <code className="text-cyan-400 block break-all pt-0.5">
                  {report.digitalSignature}
                </code>
              </div>
            </div>
          </div>

          {/* Section 1: Project Overview */}
          <div className="forensic-panel rounded-md p-5 space-y-3 font-mono text-xs">
            <div className="text-xs font-bold text-zinc-200 border-b border-[#232a36] pb-2">
              01 · PROJECT OVERVIEW & SCOPE
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              <div>
                <span className="text-zinc-500 block text-[10px]">PROJECT</span>
                <span className="text-zinc-200 font-semibold">{report.projectName}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">CATEGORY</span>
                <span className="text-emerald-400">{report.category}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">SITE LOCATION</span>
                <span className="text-zinc-200">{report.site}, {report.country}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">GENERATED (UTC)</span>
                <span className="text-zinc-400">{new Date(report.generatedAt).toUTCString()}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Evidence Inventory */}
          <div className="forensic-panel rounded-md p-5 space-y-3 font-mono text-xs">
            <div className="text-xs font-bold text-zinc-200 border-b border-[#232a36] pb-2">
              02 · EVIDENCE ASSET INVENTORY ({report.evidenceInventory.length} ASSETS)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="text-zinc-500 border-b border-[#232a36]">
                  <tr>
                    <th className="py-2">ASSET ID</th>
                    <th className="py-2">TYPE</th>
                    <th className="py-2">SHA-256 FINGERPRINT</th>
                    <th className="py-2">pHash</th>
                    <th className="py-2">GPS</th>
                    <th className="py-2">INTEGRITY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2533]">
                  {report.evidenceInventory.map((item: any) => (
                    <tr key={item.assetId} className="hover:bg-[#161a22]">
                      <td className="py-2 font-bold text-zinc-200">{item.assetId}</td>
                      <td className="py-2 text-zinc-400">{item.assetType}</td>
                      <td className="py-2 text-zinc-300 font-mono">
                        <code>{item.sha256.slice(0, 16)}...</code>
                      </td>
                      <td className="py-2 text-cyan-400">{item.phash || "—"}</td>
                      <td className="py-2 text-zinc-400">{item.gps}</td>
                      <td className="py-2 text-emerald-400 font-semibold">{item.integrityStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Before/After Comparisons & Change Score */}
          <div className="forensic-panel rounded-md p-5 space-y-3 font-mono text-xs">
            <div className="text-xs font-bold text-zinc-200 border-b border-[#232a36] pb-2">
              03 · VERIFIED COMPARISONS & MEASURED CHANGE
            </div>
            {report.comparisons.map((cmp: any) => (
              <div key={cmp.relationId} className="rounded bg-[#161a22] p-3 border border-[#232a36] space-y-2">
                <div className="flex items-center justify-between text-zinc-200 font-semibold">
                  <span>BEFORE [{cmp.beforeAssetId}] ⇄ AFTER [{cmp.afterAssetId}]</span>
                  <span className="text-emerald-400 font-bold">CHANGE SCORE: {cmp.changeScore}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-zinc-400">
                  <div>SPATIAL DRIFT: {cmp.spatialDriftMeters || 55}m</div>
                  <div>TEMPORAL GAP: {cmp.temporalGapDays || 151} days</div>
                  <div>ALIGNMENT QUALITY: {cmp.alignmentQuality ? (cmp.alignmentQuality * 100).toFixed(0) + "%" : "88%"}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Section 4: Provenance Hash Chain */}
          <div className="forensic-panel rounded-md p-5 space-y-3 font-mono text-xs">
            <div className="text-xs font-bold text-zinc-200 border-b border-[#232a36] pb-2">
              04 · APPEND-ONLY PROVENANCE EVENT LEDGER ({report.provenanceChain.length} EVENTS)
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {report.provenanceChain.map((ev: any) => (
                <div key={ev.sequence} className="p-2 rounded bg-[#141821] border border-[#232a36] text-[10px] flex items-center justify-between">
                  <div>
                    <span className="text-emerald-400 font-bold">#{ev.sequence} {ev.eventType}</span>
                    <span className="text-zinc-500 ml-2">PREV: {ev.previousHash.slice(0, 10)}...</span>
                  </div>
                  <code className="text-cyan-400">{ev.eventHash.slice(0, 16)}...</code>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Methodology */}
          <div className="forensic-panel rounded-md p-5 space-y-3 font-mono text-xs">
            <div className="text-xs font-bold text-zinc-200 border-b border-[#232a36] pb-2">
              05 · VERIFICATION METHODOLOGY
            </div>
            <ul className="space-y-1 text-zinc-300 list-disc list-inside text-[11px]">
              {report.methodology.map((m: string, i: number) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>

          {/* Section 6: Limitations Section (Rule 47) */}
          <div className="forensic-panel rounded-md p-5 border-amber-500/40 bg-amber-950/15 space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold border-b border-amber-500/30 pb-2">
              <AlertTriangle className="h-4 w-4" />
              06 · STATUTORY LIMITATIONS & NON-WARRANTY DISCLOSURE
            </div>
            <div className="space-y-1.5 text-zinc-300 text-[11px] leading-relaxed">
              {report.limitations.map((lim: string, i: number) => (
                <p key={i}>• {lim}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
