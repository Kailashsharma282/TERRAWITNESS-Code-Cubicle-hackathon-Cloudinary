"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  ArrowRight,
  Info,
  ExternalLink,
  ShieldCheck,
  FileCheck2,
} from "lucide-react";

export default function EvidenceSearchPage() {
  const [query, setQuery] = useState<string>("mangrove canopy");
  const [results, setResults] = useState<any[]>([]);
  const [searchMeta, setSearchMeta] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const suggestions = [
    "solar panel array",
    "mangrove canopy restoration",
    "baseline degraded ground",
    "tidal wetland",
    "rooftop clean energy",
  ];

  async function handleSearch(searchTerm?: string) {
    const q = searchTerm !== undefined ? searchTerm : query;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
      setSearchMeta({
        mode: data.mode,
        total: data.totalResults,
        notice: data.notice,
      });
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#232a36] pb-4 space-y-1">
        <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
          <Search className="h-4 w-4" />
          TERRAWITNESS SEMANTIC EVIDENCE SEARCH
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 font-sans">
          Explainable Evidence Query
        </h1>
        <p className="text-xs font-mono text-zinc-400">
          Search across visual semantics, project taxonomy, and hardware metadata with transparent match explanations.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="forensic-panel rounded-md p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Query impact evidence (e.g. 'solar panels', 'mangrove canopy', 'tidal estuary')..."
              className="w-full rounded border border-[#2b3442] bg-[#161a22] pl-10 pr-4 py-2.5 font-mono text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="rounded bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 font-mono text-xs font-bold text-white transition-colors disabled:opacity-50"
          >
            {loading ? "SEARCHING..." : "SEARCH ARCHIVE"}
          </button>
        </div>

        {/* Suggestion pills */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-zinc-400 pt-1">
          <span className="text-zinc-500">SUGGESTIONS:</span>
          {suggestions.map((sug) => (
            <button
              key={sug}
              onClick={() => {
                setQuery(sug);
                handleSearch(sug);
              }}
              className="rounded border border-[#232a36] bg-[#131720] px-2 py-0.5 hover:border-zinc-500 hover:text-white transition-colors"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Search mode status banner */}
      {searchMeta && (
        <div className="forensic-panel rounded-md p-3 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-zinc-400">
          <div>
            SEARCH MODE: <span className="text-zinc-200">{searchMeta.mode}</span> · {searchMeta.total} MATCHES
          </div>
          {searchMeta.notice && (
            <div className="text-[11px] text-zinc-500 flex items-center gap-1">
              <Info className="h-3 w-3 text-cyan-400 shrink-0" />
              <span>{searchMeta.notice}</span>
            </div>
          )}
        </div>
      )}

      {/* Results List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center font-mono text-xs text-zinc-500">
          <span className="animate-pulse">SCANNING AUDIT RECORDS AND VECTOR INDICES...</span>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          {results.map((res) => (
            <div
              key={res.assetId}
              className="forensic-panel rounded-md p-5 space-y-3 font-mono text-xs hover:border-zinc-500 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#232a36] pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-100 text-sm">{res.assetId}</span>
                  <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] text-zinc-400 border border-[#232a36]">
                    {res.assetType}
                  </span>
                  <span className="text-zinc-400">[{res.projectName}]</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">MATCH: {res.matchScore}%</span>
                  <Link
                    href={`/evidence/${res.assetId}`}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-[11px]"
                  >
                    VIEW EVIDENCE <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                <div className="sm:col-span-1">
                  <img
                    src={res.secureUrl}
                    alt={res.assetId}
                    className="aspect-video w-full rounded object-cover border border-[#232a36] bg-black"
                  />
                </div>

                {/* "WHY THIS MATCHED" BREAKDOWN (Section 37) */}
                <div className="sm:col-span-3 space-y-2">
                  <div className="text-[11px] text-zinc-500 font-semibold uppercase">
                    WHY THIS MATCHED:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {res.whyThisMatched?.map((reason: string, i: number) => (
                      <span
                        key={i}
                        className="rounded border border-emerald-500/30 bg-emerald-950/20 px-2 py-1 text-[11px] text-emerald-300"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[10px] text-zinc-500 pt-1">
                    <span>GPS: {res.location}</span>
                    <span>INTEGRITY: <strong className="text-emerald-400">{res.integrityStatus}</strong></span>
                    <span>REVIEW: <strong className="text-cyan-400">{res.reviewStatus}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : searchMeta ? (
        <div className="forensic-panel rounded-md p-8 text-center font-mono text-xs text-zinc-500">
          NO EVIDENCE ASSETS MATCHED YOUR QUERY "{query}". Try searching for "solar", "canopy", or "restoration".
        </div>
      ) : null}
    </div>
  );
}
