"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Filter,
  Search,
  ExternalLink,
  Plus,
  ShieldCheck,
  Radio,
  Eye,
} from "lucide-react";

export default function EvidenceArchivePage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("");
  const [filterIntegrity, setFilterIntegrity] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchAssets();
  }, [filterType, filterIntegrity]);

  async function fetchAssets() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType) params.append("assetType", filterType);
      if (filterIntegrity) params.append("integrityStatus", filterIntegrity);
      const res = await fetch(`/api/evidence?${params.toString()}`);
      const data = await res.json();
      setAssets(data.assets || []);
    } catch (err) {
      console.error("Failed to load evidence assets:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredAssets = assets.filter((ast) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ast.id.toLowerCase().includes(q) ||
      ast.project?.name.toLowerCase().includes(q) ||
      ast.sha256.toLowerCase().includes(q) ||
      (ast.tagsJson && ast.tagsJson.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232a36] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
            <Radio className="h-4 w-4" />
            TERRAWITNESS EVIDENCE ARCHIVE
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 font-sans">
            Planetary Evidence Library
          </h1>
          <p className="text-xs font-mono text-zinc-400">
            Immutable media assets sealed with cryptographic fingerprints, hardware EXIF, and AI observations.
          </p>
        </div>

        <Link
          href="/evidence/ingest"
          className="flex items-center gap-1.5 rounded bg-emerald-600 hover:bg-emerald-500 px-4 py-2 font-mono text-xs font-bold text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
          INTAKE EVIDENCE
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="forensic-panel rounded-md p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, SHA-256 digest, or visual tag..."
              className="w-full rounded border border-[#2b3442] bg-[#161a22] pl-9 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded border border-[#2b3442] bg-[#161a22] px-3 py-1.5 text-zinc-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">ALL CLASSIFICATIONS</option>
            <option value="BEFORE">BEFORE (BASELINE)</option>
            <option value="AFTER">AFTER (FOLLOW-UP)</option>
            <option value="PROGRESS">PROGRESS</option>
            <option value="SUPPORTING">SUPPORTING</option>
          </select>

          <select
            value={filterIntegrity}
            onChange={(e) => setFilterIntegrity(e.target.value)}
            className="rounded border border-[#2b3442] bg-[#161a22] px-3 py-1.5 text-zinc-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">ALL INTEGRITY STATES</option>
            <option value="INTACT">INTACT</option>
            <option value="REVIEW_REQUIRED">REVIEW REQUIRED</option>
            <option value="DERIVED">DERIVED</option>
          </select>
        </div>

        <div className="text-zinc-500">
          SHOWING {filteredAssets.length} EVIDENCE RECORDS
        </div>
      </div>

      {/* Evidence Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center font-mono text-xs text-zinc-500">
          <span className="animate-pulse">LOADING FORENSIC ARCHIVE...</span>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="forensic-panel rounded-md p-10 text-center space-y-3 font-mono">
          <FileCheck2 className="mx-auto h-8 w-8 text-zinc-600" />
          <div className="text-sm text-zinc-300">NO EVIDENCE ASSETS MATCH CRITERIA</div>
          <p className="text-xs text-zinc-500">
            Intake a field capture or reset filter options to inspect stored media records.
          </p>
        </div>
      ) : (
        <div className="forensic-panel rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#161a22] border-b border-[#232a36] text-[11px] text-zinc-400">
                <tr>
                  <th className="p-3">EVIDENCE ID</th>
                  <th className="p-3">PREVIEW</th>
                  <th className="p-3">PROJECT & CLASSIFICATION</th>
                  <th className="p-3">CRYPTOGRAPHIC SHA-256</th>
                  <th className="p-3">GPS / HARDWARE</th>
                  <th className="p-3">INTEGRITY</th>
                  <th className="p-3">REVIEW</th>
                  <th className="p-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2533]">
                {filteredAssets.map((ast) => (
                  <tr key={ast.id} className="hover:bg-[#151922] transition-colors">
                    <td className="p-3 font-bold text-zinc-200">
                      <Link href={`/evidence/${ast.id}`} className="hover:text-emerald-400">
                        {ast.id}
                      </Link>
                      {ast.isSynthetic && (
                        <span className="block text-[9px] text-zinc-500 font-normal">
                          [SYNTHETIC DEMO]
                        </span>
                      )}
                    </td>

                    <td className="p-3">
                      <img
                        src={ast.secureUrl}
                        alt={ast.id}
                        className="h-10 w-14 rounded object-cover border border-[#232a36] bg-black"
                      />
                    </td>

                    <td className="p-3">
                      <div className="text-zinc-200 font-medium truncate max-w-[180px]">
                        {ast.project?.name || "General Project"}
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        TYPE: {ast.assetType}
                      </span>
                    </td>

                    <td className="p-3 text-zinc-400">
                      <code className="text-[11px] text-zinc-300">
                        {ast.sha256 ? `${ast.sha256.slice(0, 14)}...` : "PENDING"}
                      </code>
                      <span className="block text-[10px] text-zinc-500">
                        pHash: {ast.phash || "—"}
                      </span>
                    </td>

                    <td className="p-3 text-zinc-400">
                      <div>
                        {ast.gpsLat != null ? `${ast.gpsLat.toFixed(4)}, ${ast.gpsLon?.toFixed(4)}` : "GPS Absent"}
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        {ast.cameraMake ? `${ast.cameraMake} ${ast.cameraModel || ""}` : "Camera absent"}
                      </span>
                    </td>

                    <td className="p-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded border ${
                          ast.integrityStatus === "INTACT"
                            ? "border-emerald-500/30 text-emerald-400 bg-emerald-950/20"
                            : "border-amber-500/30 text-amber-400 bg-amber-950/20"
                        }`}
                      >
                        {ast.integrityStatus}
                      </span>
                    </td>

                    <td className="p-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded border ${
                          ast.reviewStatus === "CONFIRMED"
                            ? "border-cyan-500/30 text-cyan-400"
                            : "border-zinc-700 text-zinc-400"
                        }`}
                      >
                        {ast.reviewStatus}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <Link
                        href={`/evidence/${ast.id}`}
                        className="rounded border border-[#2b3442] bg-[#161a22] px-2.5 py-1 text-[11px] text-zinc-300 hover:text-white hover:border-zinc-500 inline-flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" /> PASSPORT
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
