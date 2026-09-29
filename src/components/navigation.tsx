"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Layers,
  FileCheck2,
  GitCompare,
  ScrollText,
  LineChart,
  Film,
  Search,
  CheckSquare,
  Settings,
  Plus,
  Radio,
  ExternalLink,
} from "lucide-react";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { label: "Control Room", href: "/dashboard", icon: Layers },
    { label: "Projects", href: "/projects", icon: ShieldCheck },
    { label: "Evidence", href: "/evidence", icon: FileCheck2 },
    { label: "Comparisons", href: "/comparisons", icon: GitCompare },
    { label: "Provenance Ledger", href: "/provenance", icon: ScrollText },
    { label: "Impact Analysis", href: "/impact", icon: LineChart },
    { label: "Story Compiler", href: "/stories", icon: Film },
    { label: "Reports", href: "/reports", icon: FileCheck2 },
    { label: "Review Queue", href: "/review", icon: CheckSquare },
    { label: "Search", href: "/search", icon: Search },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#232a36] bg-[#0b0d11]/95 backdrop-blur">
      {/* Top micro-strip for mission control telemetry */}
      <div className="flex h-8 items-center justify-between border-b border-[#1b212b] px-4 text-[11px] font-mono text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            SYSTEM OPERATIONAL
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">PROVENANCE LEDGER: <span className="text-zinc-200">ACTIVE SHA-256</span></span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">MEDIA INFRASTRUCTURE: <span className="text-cyan-400">CLOUDINARY</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/evidence/ingest"
            className="flex items-center gap-1 text-zinc-300 hover:text-white transition-colors"
          >
            <Radio className="h-3 w-3 text-emerald-400" />
            FIELD INGEST WORKSPACE
          </Link>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-500">UTC {new Date().toISOString().slice(11, 16)}</span>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="flex h-14 items-center justify-between px-4">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-7 w-7 items-center justify-center rounded border border-emerald-500/40 bg-[#161a22] text-emerald-400 group-hover:border-emerald-400 transition-colors">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="font-mono text-sm font-bold tracking-wider text-zinc-100">
                TERRAWITNESS
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono text-zinc-500 border-l border-zinc-700 pl-2">
                EVIDENCE GRADE
              </span>
            </div>
          </Link>
        </div>

        {/* Links */}
        <nav className="hidden xl:flex items-center gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-colors ${
                  isActive
                    ? "bg-[#1f2430] text-zinc-100 border border-[#333f52]"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-[#161a22]"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <Link
            href="/evidence/ingest"
            className="flex items-center gap-1.5 rounded border border-emerald-600/60 bg-emerald-950/40 px-3 py-1.5 text-xs font-mono font-medium text-emerald-300 hover:bg-emerald-900/60 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            INTAKE EVIDENCE
          </Link>
        </div>
      </div>
    </header>
  );
}
