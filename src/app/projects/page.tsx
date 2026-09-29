"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Plus,
  ArrowRight,
  MapPin,
  Clock,
  Layers,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";

export default function ProjectsDirectoryPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.projects || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load projects:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232a36] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            TERRAWITNESS IMPACT MISSIONS
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 font-sans">
            Impact Projects Directory
          </h1>
          <p className="text-xs font-mono text-zinc-400">
            Field programs tracking verifiable planetary interventions with cryptographic provenance.
          </p>
        </div>

        <Link
          href="/projects/new"
          className="flex items-center gap-1.5 rounded bg-emerald-600 hover:bg-emerald-500 px-4 py-2 font-mono text-xs font-bold text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
          CREATE IMPACT PROJECT
        </Link>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center font-mono text-xs text-zinc-500">
          <span className="animate-pulse">LOADING IMPACT PROJECTS...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="forensic-panel rounded-md p-10 text-center space-y-3 font-mono">
          <ShieldCheck className="mx-auto h-8 w-8 text-zinc-600" />
          <div className="text-sm text-zinc-300">NO IMPACT PROJECTS FOUND</div>
          <Link
            href="/projects/new"
            className="text-xs text-emerald-400 hover:underline"
          >
            Create your first project to start an evidence chain.
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="forensic-panel rounded-md p-5 space-y-4 hover:border-zinc-500 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 border-b border-[#232a36] pb-3">
                <div>
                  <span className="rounded bg-[#161a22] border border-[#232a36] px-2 py-0.5 font-mono text-[10px] text-emerald-400 uppercase">
                    {proj.category}
                  </span>
                  <h2 className="text-base font-bold text-zinc-100 font-sans mt-1.5">
                    {proj.name}
                  </h2>
                </div>
                <span className="rounded border border-emerald-500/30 bg-emerald-950/20 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
                  ● {proj.status}
                </span>
              </div>

              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                {proj.description || "Field evidence project tracking ecological interventions."}
              </p>

              <div className="grid grid-cols-3 gap-2 font-mono text-xs p-3 rounded bg-[#141821] border border-[#232a36] text-zinc-300">
                <div>
                  <span className="text-zinc-500 block text-[10px]">ASSETS</span>
                  <span className="font-bold text-zinc-100">{proj._count?.assets || 0}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">PAIRS</span>
                  <span className="font-bold text-zinc-100">{proj._count?.relations || 0}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">EVENTS</span>
                  <span className="font-bold text-emerald-400">{proj._count?.provenanceEvents || 0}</span>
                </div>
              </div>

              <div className="flex items-center justify-between font-mono text-[11px] text-zinc-500">
                <span>SITE: {proj.site}, {proj.country}</span>
                <Link
                  href={`/projects/${proj.id}`}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                >
                  VIEW PROJECT <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
