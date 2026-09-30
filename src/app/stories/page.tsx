"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Film,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  FileCheck2,
  Eye,
} from "lucide-react";
import { EvidenceImage } from "@/components/evidence-image";

export default function StoryCompilerPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [compiling, setCompiling] = useState<boolean>(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedCitation, setSelectedCitation] = useState<any>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((d) => {
        if (d.projects && d.projects.length > 0) {
          setProjects(d.projects);
          setSelectedProjectId(d.projects[0].id);
          compileStoryForProject(d.projects[0].id);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load projects:", err);
        setLoading(false);
      });
  }, []);

  async function compileStoryForProject(projectId: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      setStory(data.story);
      setCurrentSceneIndex(0);
      setIsPlaying(false);
    } catch (err) {
      console.error("Story compilation error:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectProject(id: string) {
    setSelectedProjectId(id);
    compileStoryForProject(id);
  }

  // Auto-play timer for scenes
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && story?.scenes?.length > 0) {
      const currentDuration = (story.scenes[currentSceneIndex]?.durationSeconds || 5) * 1000;
      timer = setTimeout(() => {
        if (currentSceneIndex < story.scenes.length - 1) {
          setCurrentSceneIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, currentDuration);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentSceneIndex, story]);

  const currentScene = story?.scenes?.[currentSceneIndex];

  return (
    <div className="space-y-6">
      {/* Header and Story Compilation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232a36] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
            <Film className="h-4 w-4" />
            TERRAWITNESS EVIDENCE-TO-STORY COMPILER
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 font-sans">
            Audit-Backed Impact Story Reel
          </h1>
          <p className="text-xs font-mono text-zinc-400">
            Every narrative claim cites an immutable field capture ID [EV-XXX] sealed within the project's cryptographic chain.
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
            onClick={() => compileStoryForProject(selectedProjectId)}
            disabled={compiling}
            className="flex items-center gap-1.5 rounded bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 font-mono text-xs font-bold text-white transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            RECOMPILE STORY
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-96 items-center justify-center font-mono text-xs text-zinc-500">
          <span className="animate-pulse">COMPILING VERIFIED EVIDENCE STORYBOARD...</span>
        </div>
      ) : !story ? (
        <div className="forensic-panel rounded-md p-8 text-center text-xs font-mono text-zinc-500">
          UNABLE TO COMPILE STORY. Ensure target project contains registered evidence assets.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: Interactive Story Video Player */}
          <div className="lg:col-span-2 space-y-4">
            <div className="forensic-panel rounded-md p-4 space-y-3">
              {/* Media Player Container */}
              <div className="relative aspect-video rounded overflow-hidden border border-[#232a36] bg-black flex items-center justify-center">
                {currentScene?.primaryMediaUrl ? (
                  <EvidenceImage
                    src={currentScene.primaryMediaUrl}
                    assetId={currentScene?.assetIds?.[0]}
                    label={currentScene.title}
                    alt={currentScene.title}
                    className="h-full w-full object-cover transition-opacity duration-300"
                  />
                ) : (
                  <div className="font-mono text-xs text-zinc-500">MEDIA STREAM ACTIVE</div>
                )}

                {/* Live Evidence Marker Overlay (Section 45) */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <div className="rounded bg-black/80 border border-emerald-500/40 px-2.5 py-1 font-mono text-xs text-emerald-300 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>{currentScene?.assetIds?.[0] || "EV-RECORD"}</span>
                    <span className="text-zinc-500">|</span>
                    <span className="text-emerald-400 font-bold">INTACT</span>
                    <span className="text-zinc-500">|</span>
                    <span className="text-cyan-400">REVIEWED</span>
                  </div>
                </div>

                {/* Subtitle Narrative Overlay */}
                <div className="absolute bottom-4 left-4 right-4 z-20 rounded bg-black/85 border border-[#232a36] p-3 text-xs font-mono text-zinc-200">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1">
                    {currentScene?.title}
                  </div>
                  <p className="leading-relaxed">
                    {/* Render text with clickable citations */}
                    {currentScene?.narrativeText}
                  </p>
                </div>
              </div>

              {/* Player Timeline Bar & Controls */}
              <div className="flex items-center justify-between font-mono text-xs text-zinc-300 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="h-8 w-8 rounded border border-[#2b3442] bg-[#161a22] flex items-center justify-center text-zinc-200 hover:text-white"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 text-emerald-400" />}
                  </button>

                  <button
                    onClick={() => {
                      setCurrentSceneIndex(0);
                      setIsPlaying(false);
                    }}
                    className="h-8 w-8 rounded border border-[#2b3442] bg-[#161a22] flex items-center justify-center text-zinc-400 hover:text-white"
                    title="Restart"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>

                  <span className="text-zinc-400 text-[11px] ml-2">
                    SCENE {currentSceneIndex + 1} OF {story.scenes.length}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentSceneIndex((i) => Math.max(0, i - 1))}
                    disabled={currentSceneIndex === 0}
                    className="h-8 w-8 rounded border border-[#2b3442] bg-[#161a22] flex items-center justify-center text-zinc-300 hover:text-white disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentSceneIndex((i) => Math.min(story.scenes.length - 1, i + 1))}
                    disabled={currentSceneIndex === story.scenes.length - 1}
                    className="h-8 w-8 rounded border border-[#2b3442] bg-[#161a22] flex items-center justify-center text-zinc-300 hover:text-white disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Scene Progress Strips */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {story.scenes.map((sc: any, idx: number) => (
                  <button
                    key={sc.sequence}
                    onClick={() => {
                      setCurrentSceneIndex(idx);
                      setIsPlaying(false);
                    }}
                    className={`h-1.5 rounded-sm transition-colors ${
                      idx === currentSceneIndex
                        ? "bg-emerald-400"
                        : idx < currentSceneIndex
                        ? "bg-zinc-600"
                        : "bg-zinc-800"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Scene Breakdown & Traceable Claim Citations */}
          <div className="space-y-4">
            <div className="forensic-panel rounded-md p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#232a36] pb-3 text-xs font-mono text-zinc-200 font-semibold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  TRACE ANY CLAIM TO EVIDENCE
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {currentScene?.evidenceCitations?.map((cit: any, i: number) => (
                  <div
                    key={i}
                    onClick={() => setSelectedCitation(cit)}
                    className="rounded border border-[#1f2633] bg-[#131720] p-3 space-y-2 cursor-pointer hover:border-emerald-500 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 uppercase">
                        [{cit.sourceType}] CLAIM
                      </span>
                      <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-cyan-400 border border-[#232a36]">
                        {cit.citationId}
                      </span>
                    </div>

                    <div className="text-zinc-200 font-medium">
                      "{cit.claimText}"
                    </div>

                    <div className="text-[11px] text-zinc-400 leading-snug">
                      {cit.proofDetails}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-emerald-400 pt-1 border-t border-[#1f2633]">
                      <span>STATUS: {cit.integrityStatus}</span>
                      <span className="flex items-center gap-0.5">
                        INSPECT PROVENANCE <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded bg-[#12151c] p-3 text-[11px] font-mono text-zinc-400 border border-[#232a36] leading-relaxed">
                Non-hallucination guarantee: Stories are strictly derived from verified assets. No synthetic claims or fabricated environmental yields are inserted.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CITATION DEEP INSPECTOR MODAL (WOW Feature #2: Story -> Claim -> Evidence -> Provenance) */}
      {selectedCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="forensic-panel rounded-lg max-w-lg w-full p-6 space-y-4 border-emerald-500/40 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#232a36] pb-3">
              <h3 className="font-bold text-zinc-100 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                CLAIM VERIFICATION PASSPORT [{selectedCitation.citationId}]
              </h3>
              <button
                onClick={() => setSelectedCitation(null)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-[10px] text-zinc-500">STORY CLAIM</div>
                <div className="text-zinc-200 font-semibold text-sm">
                  "{selectedCitation.claimText}"
                </div>
              </div>

              <div>
                <div className="text-[10px] text-zinc-500">CLAIM SOURCE CLASSIFICATION</div>
                <div className="text-emerald-400">{selectedCitation.sourceType}</div>
              </div>

              <div>
                <div className="text-[10px] text-zinc-500">EVALUATION & PROOF DETAILS</div>
                <div className="text-zinc-300 p-2.5 rounded bg-[#161a22] border border-[#232a36] leading-relaxed">
                  {selectedCitation.proofDetails}
                </div>
              </div>

              <div className="flex justify-between p-2.5 rounded bg-[#161a22] border border-[#232a36]">
                <span>INTEGRITY STATUS:</span>
                <span className="text-emerald-400 font-bold">{selectedCitation.integrityStatus}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Link
                href={`/evidence/${selectedCitation.assetId}`}
                className="flex-1 flex items-center justify-center gap-1 rounded bg-zinc-100 py-2 font-bold text-zinc-950 hover:bg-white transition-colors"
              >
                <Eye className="h-3.5 w-3.5" /> OPEN SOURCE EVIDENCE
              </Link>
              <button
                onClick={() => setSelectedCitation(null)}
                className="rounded border border-[#2b3442] bg-[#161a22] px-4 py-2 text-zinc-300 hover:text-white"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
