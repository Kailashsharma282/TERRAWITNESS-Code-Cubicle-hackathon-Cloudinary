"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Plus, AlertCircle } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Reforestation");
  const [customCategory, setCustomCategory] = useState("");
  const [country, setCountry] = useState("Indonesia");
  const [region, setRegion] = useState("North Sumatra");
  const [site, setSite] = useState("Langkat Estuary Plot C");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [targetDate, setTargetDate] = useState("");
  const [impactObjectives, setImpactObjectives] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories = [
    "Reforestation",
    "Solar",
    "Water",
    "Waste Management",
    "Disaster Recovery",
    "Infrastructure",
    "Agriculture",
    "Biodiversity",
    "Clean Energy",
    "Other",
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !site.trim()) {
      setErrorMsg("Project name and site location are mandatory.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const finalCategory = category === "Other" && customCategory.trim() ? customCategory.trim() : category;

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() + (impactObjectives ? ` | Objectives: ${impactObjectives}` : ""),
          category: finalCategory,
          country: country.trim(),
          region: region.trim(),
          site: site.trim(),
          startDate,
          targetDate: targetDate || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create project.");
      }

      const data = await res.json();
      router.push(`/projects/${data.project.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 border-b border-[#232a36] pb-4">
        <Link
          href="/projects"
          className="flex items-center gap-1 font-mono text-xs text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> PROJECTS
        </Link>
        <span className="text-zinc-600">/</span>
        <span className="font-mono text-xs font-bold text-zinc-200">CREATE IMPACT PROJECT</span>
      </div>

      <form onSubmit={handleSubmit} className="forensic-panel rounded-md p-6 space-y-5 font-mono text-xs">
        <div className="space-y-1">
          <div className="text-xs text-emerald-400 font-bold">GENESIS SETUP</div>
          <h1 className="text-xl font-bold text-zinc-100 font-sans">
            Initiate Project Chain of Custody
          </h1>
          <p className="text-zinc-400 text-[11px]">
            Every project starts with an immutable genesis event on the TerraWitness hash ledger.
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded border border-red-500/40 bg-red-950/20 p-3 text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-zinc-300 block font-semibold">PROJECT NAME *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mangrove Coastal Restoration — Site 05"
            className="w-full rounded border border-[#2b3442] bg-[#161a22] p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-zinc-300 block font-semibold">IMPACT CATEGORY *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded border border-[#2b3442] bg-[#161a22] p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500 text-xs"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {category === "Other" && (
            <div className="space-y-1.5">
              <label className="text-zinc-300 block font-semibold">SPECIFY CATEGORY</label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Custom domain (e.g. Kelp Forest Recovery)"
                className="w-full rounded border border-[#2b3442] bg-[#161a22] p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-zinc-300 block font-semibold">SITE IDENTIFIER / PLOT *</label>
            <input
              type="text"
              required
              value={site}
              onChange={(e) => setSite(e.target.value)}
              placeholder="e.g. Langkat Estuary Plot C"
              className="w-full rounded border border-[#2b3442] bg-[#161a22] p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-zinc-300 block font-semibold">COUNTRY *</label>
            <input
              type="text"
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. Indonesia"
              className="w-full rounded border border-[#2b3442] bg-[#161a22] p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-300 block font-semibold">REGION / PROVINCE</label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g. North Sumatra"
              className="w-full rounded border border-[#2b3442] bg-[#161a22] p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-zinc-300 block font-semibold">START DATE</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded border border-[#2b3442] bg-[#161a22] p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-300 block font-semibold">EXPECTED TARGET DATE</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full rounded border border-[#2b3442] bg-[#161a22] p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-zinc-300 block font-semibold">PROJECT DESCRIPTION & OBJECTIVES</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe ecological goals, baseline degradation, and intervention milestones..."
            className="w-full rounded border border-[#2b3442] bg-[#161a22] p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded bg-emerald-600 hover:bg-emerald-500 py-3 font-bold text-white transition-colors disabled:opacity-50 text-xs"
        >
          <ShieldCheck className="h-4 w-4" />
          {loading ? "INITIALIZING GENESIS EVENT..." : "CREATE IMPACT PROJECT & SEAL GENESIS"}
        </button>
      </form>
    </div>
  );
}
