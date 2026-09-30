"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GitCompare,
  ArrowRight,
  TrendingUp,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { EvidenceImage } from "@/components/evidence-image";

export default function ComparisonsCatalogPage() {
  const [relations, setRelations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/comparisons")
      .then((res) => res.json())
      .then((d) => {
        setRelations(d.relations || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load comparisons:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232a36] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
            <GitCompare className="h-4 w-4" />
            TERRAWITNESS COMPARATIVE FORENSICS
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 font-sans">
            Evidence Pairs & Change Sets
          </h1>
          <p className="text-xs font-mono text-zinc-400">
            Before-vs-after paired captures analyzed for feature alignment, SSIM structural difference, and geo-temporal drift.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center font-mono text-xs text-zinc-400">
          <span className="animate-pulse">LOADING FORENSIC COMPARISON SETS...</span>
        </div>
      ) : relations.length === 0 ? (
        <div className="forensic-panel rounded-md p-10 text-center space-y-3 font-mono">
          <GitCompare className="mx-auto h-8 w-8 text-zinc-600" />
          <div className="text-sm text-zinc-300">NO COMPARISON PAIRS REGISTERED</div>
          <p className="text-xs text-zinc-500">
            Intake baseline and follow-up field captures to compute optical change scores.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {relations.map((rel) => {
            const observation = rel.impactObservations?.[0];
            return (
              <div
                key={rel.id}
                className="forensic-panel rounded-md p-5 space-y-4 hover:border-zinc-500 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-[#232a36] pb-2 font-mono text-xs">
                  <span className="font-bold text-zinc-200">
                    {rel.beforeAssetId} ⇄ {rel.afterAssetId}
                  </span>
                  <span className="text-emerald-400 font-bold">
                    CHANGE: {rel.changeScore || 0}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <EvidenceImage
                      src={rel.beforeAsset?.secureUrl}
                      assetId={rel.beforeAsset?.id}
                      assetType={rel.beforeAsset?.assetType}
                      alt="Before"
                      className="aspect-video w-full rounded object-cover border border-[#232a36] bg-black"
                    />
                    <div className="font-mono text-[10px] text-zinc-400">
                      BEFORE · {new Date(rel.beforeAsset?.captureTimestamp).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <EvidenceImage
                      src={rel.afterAsset?.secureUrl}
                      assetId={rel.afterAsset?.id}
                      assetType={rel.afterAsset?.assetType}
                      alt="After"
                      className="aspect-video w-full rounded object-cover border border-[#232a36] bg-black"
                    />
                    <div className="font-mono text-[10px] text-zinc-400">
                      AFTER · {new Date(rel.afterAsset?.captureTimestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs font-mono text-zinc-300">
                  <div className="text-[11px] text-zinc-400">
                    PROJECT: <span className="text-zinc-200">{rel.project?.name}</span>
                  </div>
                  {observation && (
                    <div className="text-[11px] text-emerald-400 leading-snug">
                      OBSERVATION: {observation.description}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                    <span>ALIGNMENT: {(rel.alignmentQuality * 100).toFixed(0)}%</span>
                    <span>DRIFT: {rel.spatialDriftMeters || 0}m</span>
                    <span>GAP: {rel.temporalGapDays || 0} days</span>
                  </div>
                </div>

                <Link
                  href={`/comparisons/${rel.id}`}
                  className="w-full flex items-center justify-center gap-1.5 rounded border border-[#2b3442] bg-[#161a22] py-2 font-mono text-xs font-bold text-zinc-200 hover:text-white hover:bg-[#1f2430] transition-colors"
                >
                  OPEN FORENSIC COMPARISON WORKSTATION <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
