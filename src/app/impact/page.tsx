"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Trees,
  Sun,
  Droplets,
  Building2,
  Trash2,
  Info,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export default function ImpactAnalysisPage() {
  const [activeTab, setActiveTab] = useState<string>("VEGETATION");

  const analyzers = [
    {
      id: "VEGETATION",
      name: "Vegetation & Canopy Analyzer",
      icon: Trees,
      targetDomains: "Reforestation, Mangroves, Agroforestry, Biodiversity",
      indicator: "Excess Green Index (ExG = 2G - R - B) + AI Semantic Ground Truth",
      methodology:
        "Normalizes RGB channels and applies ExG thresholding (ExG > 18) to calculate surface green canopy coverage delta across aligned images.",
      sampleOutput: {
        beforeCoverage: "12.3%",
        afterCoverage: "41.8%",
        delta: "+29.5 percentage points",
        confidence: "0.88 (High)",
        source: "TerraWitness CV Engine + Cloudinary AI Semantics",
      },
      statutoryLimitations:
        "Visual canopy greenness reflects optical surface coverage only. It does NOT independently establish biological biomass, tree survival rates, or verified carbon offset credits.",
    },
    {
      id: "SOLAR",
      name: "Solar Array & Microgrid Analyzer",
      icon: Sun,
      targetDomains: "Clean Energy, Rural Electrification, Rooftop Solar",
      indicator: "Photovoltaic Panel Array Semantic Detection & Structural Contrast",
      methodology:
        "Analyzes high-frequency rectilinear grids and Cloudinary AI object classification for solar panel hardware, inverter framing, and mounting structures.",
      sampleOutput: {
        beforeCoverage: "Hardware absent (0%)",
        afterCoverage: "Photovoltaic array visually identified (100%)",
        delta: "Structural deployment confirmed",
        confidence: "0.92 (High)",
        source: "Cloudinary AI Vision + Contextual Recognition",
      },
      statutoryLimitations:
        "Visual presence of solar panels confirms physical installation. It does NOT prove active electrical generation, inverter grid synchronization, or kilowatt-hour output.",
    },
    {
      id: "WATER",
      name: "Water Body & Flood Analyzer",
      icon: Droplets,
      targetDomains: "Wetland Restoration, Disaster Flood Recovery, Riparian Corridors",
      indicator: "Spectral Chromatic Blue/Red Ratio + Hydro-geographic Contour",
      methodology:
        "Evaluates blue/red reflectance dominance to delineate open water surface vs saturated floodplain terrain.",
      sampleOutput: {
        beforeCoverage: "46.1% flooded area",
        afterCoverage: "18.3% stabilized waterline",
        delta: "-27.8 percentage points (Floodwater recession)",
        confidence: "0.76 (Moderate)",
        source: "TerraWitness Spectral CV Module",
      },
      statutoryLimitations:
        "Surface water estimates are optical observations subject to sun glint, turbidity, and seasonal tide. They do not represent hydrological depth or potable water quality.",
    },
    {
      id: "INFRASTRUCTURE",
      name: "Infrastructure & Structural Progression",
      icon: Building2,
      targetDomains: "Civil Works, Community Facilities, Water Barriers",
      indicator: "Geometric Contour Divergence + Edge Complexity Metric",
      methodology:
        "Tracks structural stages: excavation, foundation framing, structural walls, and roofing completion.",
      sampleOutput: {
        beforeCoverage: "Foundation ground preparation",
        afterCoverage: "Framed facility with finished roof",
        delta: "Complete structural shell progression",
        confidence: "0.83 (High)",
        source: "TerraWitness Geometric CV Engine",
      },
      statutoryLimitations:
        "Structural observations confirm physical erection only. They do not certify structural engineering code compliance, seismic ratings, or occupancy permits.",
    },
  ];

  const currentAnalyzer = analyzers.find((a) => a.id === activeTab) || analyzers[0];
  const Icon = currentAnalyzer.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#232a36] pb-4 space-y-1">
        <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
          <LineChart className="h-4 w-4" />
          DOMAIN-SPECIFIC IMPACT ANALYSIS ENGINES
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 font-sans">
          Impact Observation Methodology
        </h1>
        <p className="text-xs font-mono text-zinc-400">
          Modular, transparent computer-vision analyzers built for specific sustainability categories without black-box hallucination.
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
        {analyzers.map((an) => {
          const TabIcon = an.icon;
          return (
            <button
              key={an.id}
              onClick={() => setActiveTab(an.id)}
              className={`flex items-center gap-2 p-3 rounded border text-left transition-colors ${
                activeTab === an.id
                  ? "border-emerald-500 bg-emerald-950/30 text-emerald-300 font-bold"
                  : "border-[#2b3442] bg-[#141821] text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <TabIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">{an.name.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Analyzer Deep Dive */}
      <div className="forensic-panel rounded-md p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232a36] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded border border-emerald-500/40 bg-[#161a22] flex items-center justify-center text-emerald-400">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100 font-mono">
                {currentAnalyzer.name}
              </h2>
              <div className="text-xs font-mono text-zinc-400">
                TARGET DOMAINS: {currentAnalyzer.targetDomains}
              </div>
            </div>
          </div>

          <div className="font-mono text-xs text-zinc-400">
            ENGINE STATUS: <span className="text-emerald-400 font-bold">OPERATIONAL</span>
          </div>
        </div>

        {/* Technical Description & Methodology */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-[11px] text-zinc-500 font-semibold">QUANTITATIVE INDICATOR</div>
              <div className="text-zinc-200 p-2.5 rounded bg-[#161a22] border border-[#232a36]">
                {currentAnalyzer.indicator}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] text-zinc-500 font-semibold">METHODOLOGY BREAKDOWN</div>
              <p className="text-zinc-300 p-2.5 rounded bg-[#161a22] border border-[#232a36] leading-relaxed">
                {currentAnalyzer.methodology}
              </p>
            </div>
          </div>

          {/* Sample Output */}
          <div className="space-y-3">
            <div className="text-[11px] text-zinc-500 font-semibold">VERIFIED FIELD RUN OUTPUT</div>
            <div className="rounded bg-[#161a22] p-4 border border-[#232a36] space-y-2.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">Baseline reading:</span>
                <span className="text-zinc-200">{currentAnalyzer.sampleOutput.beforeCoverage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Follow-up reading:</span>
                <span className="text-zinc-200">{currentAnalyzer.sampleOutput.afterCoverage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Observed Delta:</span>
                <span className="text-emerald-400 font-bold">{currentAnalyzer.sampleOutput.delta}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Confidence Index:</span>
                <span className="text-cyan-400">{currentAnalyzer.sampleOutput.confidence}</span>
              </div>
              <div className="flex justify-between border-t border-[#232a36] pt-2 text-[10px]">
                <span className="text-zinc-500">Sensor Source:</span>
                <span className="text-zinc-400">{currentAnalyzer.sampleOutput.source}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Limitations Alert Strip (Rule 0 & 20) */}
        <div className="rounded border border-amber-500/40 bg-amber-950/15 p-4 font-mono text-xs space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <AlertTriangle className="h-4 w-4" />
            METHODOLOGICAL BOUNDS & STATUTORY LIMITATIONS
          </div>
          <p className="text-zinc-300 leading-relaxed text-[11px]">
            {currentAnalyzer.statutoryLimitations}
          </p>
        </div>
      </div>
    </div>
  );
}
