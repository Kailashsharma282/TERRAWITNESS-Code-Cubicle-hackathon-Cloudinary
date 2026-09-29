"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowLeft,
  Plus,
  GitCompare,
  Film,
  FileCheck2,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
} from "lucide-react";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<any>(null);
  const [chainStatus, setChainStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((res) => res.json())
      .then((d) => {
        setProject(d.project);
        setChainStatus(d.chainStatus);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load project:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center font-mono text-xs text-zinc-400">
        <span className="animate-pulse">LOADING PROJECT DOSSIER & VERIFYING PROVENANCE...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="forensic-panel rounded-md p-8 text-center space-y-4 font-mono">
        <div className="text-sm text-zinc-400">PROJECT NOT FOUND</div>
        <Link href="/projects" className="text-xs text-emerald-400">
          ← RETURN TO PROJECTS
        </Link>
      </div>
    );
  }

  const assets = project.assets || [];
  const relations = project.relations || [];
  const events = project.provenanceEvents || [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232a36] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="flex items-center gap-1 font-mono text-xs text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> PROJECTS
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="font-mono text-xs font-bold text-zinc-200">{project.name}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/evidence/ingest"
            className="flex items-center gap-1.5 rounded border border-[#2b3442] bg-[#161a22] px-3 py-1.5 font-mono text-xs text-zinc-200 hover:text-white transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-emerald-400" /> INTAKE MEDIA
          </Link>
          <Link
            href="/stories"
            className="flex items-center gap-1.5 rounded border border-[#2b3442] bg-[#161a22] px-3 py-1.5 font-mono text-xs text-zinc-200 hover:text-white transition-colors"
          >
            <Film className="h-3.5 w-3.5 text-cyan-400" /> STORY REEL
          </Link>
          <Link
            href="/reports"
            className="flex items-center gap-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 px-3.5 py-1.5 font-mono text-xs font-bold transition-colors"
          >
            <FileCheck2 className="h-3.5 w-3.5" /> AUDIT REPORT
          </Link>
        </div>
      </div>

      {/* Project Overview Card */}
      <div className="forensic-panel rounded-md p-6 space-y-4 font-mono text-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#232a36] pb-4">
          <div className="space-y-1">
            <span className="text-[10px] text-emerald-400 uppercase font-bold">
              {project.category} · {project.status}
            </span>
            <h1 className="text-2xl font-bold text-zinc-100 font-sans">
              {project.name}
            </h1>
            <div className="flex items-center gap-3 text-zinc-400 text-[11px]">
              <span>SITE: {project.site}, {project.country}</span>
              <span>·</span>
              <span>START: {new Date(project.startDate).toLocaleDateString()}</span>
            </div>
          </div>

          {chainStatus && (
            <div className="rounded bg-[#141821] border border-[#232a36] p-3 text-right space-y-1">
              <div className="text-[10px] text-zinc-500">PROVENANCE LEDGER</div>
              <div className="text-emerald-400 font-bold">● {chainStatus.status}</div>
              <div className="text-[10px] text-zinc-400">
                ROOT: {chainStatus.rootHash ? `${chainStatus.rootHash.slice(0, 12)}...` : "GENESIS"}
              </div>
            </div>
          )}
        </div>

        <p className="text-zinc-300 text-xs leading-relaxed max-w-3xl">
          {project.description}
        </p>

        {/* Health stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded bg-[#161a22] border border-[#232a36]">
            <span className="text-[10px] text-zinc-500 block">EVIDENCE ASSETS</span>
            <span className="text-lg font-bold text-zinc-100">{assets.length}</span>
          </div>
          <div className="p-3 rounded bg-[#161a22] border border-[#232a36]">
            <span className="text-[10px] text-zinc-500 block">COMPARISON PAIRS</span>
            <span className="text-lg font-bold text-zinc-100">{relations.length}</span>
          </div>
          <div className="p-3 rounded bg-[#161a22] border border-[#232a36]">
            <span className="text-[10px] text-zinc-500 block">CHAIN EVENTS</span>
            <span className="text-lg font-bold text-emerald-400">{events.length}</span>
          </div>
          <div className="p-3 rounded bg-[#161a22] border border-[#232a36]">
            <span className="text-[10px] text-zinc-500 block">STORY READINESS</span>
            <span className="text-lg font-bold text-cyan-400">100% AUDIT READY</span>
          </div>
        </div>
      </div>

      {/* Project Assets Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#232a36] pb-2 font-mono text-xs">
          <span className="font-bold text-zinc-200">PROJECT EVIDENCE MEDIA ({assets.length})</span>
          <Link href="/evidence/ingest" className="text-emerald-400 hover:text-emerald-300">
            + INTAKE FRESH CAPTURE
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((ast: any) => (
            <div
              key={ast.id}
              className="forensic-panel rounded-md p-3 space-y-2 hover:border-zinc-500 transition-colors"
            >
              <div className="relative aspect-video rounded overflow-hidden border border-[#232a36] bg-black">
                <img
                  src={ast.secureUrl}
                  alt={ast.id}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-2 left-2 rounded bg-black/80 px-2 py-0.5 font-mono text-[9px] text-zinc-300 border border-[#232a36]">
                  {ast.assetType} · {ast.id}
                </div>
              </div>

              <div className="flex items-center justify-between font-mono text-xs pt-1">
                <code className="text-[10px] text-zinc-400">
                  {ast.sha256 ? `${ast.sha256.slice(0, 12)}...` : "PENDING"}
                </code>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  ● {ast.integrityStatus}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-[10px] text-zinc-500">
                  {new Date(ast.captureTimestamp).toLocaleDateString()}
                </span>
                <Link
                  href={`/evidence/${ast.id}`}
                  className="rounded border border-[#2b3442] bg-[#161a22] px-2 py-0.5 font-mono text-[10px] text-zinc-300 hover:text-white"
                >
                  PASSPORT
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
