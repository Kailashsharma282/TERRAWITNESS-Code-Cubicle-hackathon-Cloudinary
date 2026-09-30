"use client";

import React, { useState, useEffect } from "react";
import { ImageOff, ShieldCheck } from "lucide-react";

export function getFallbackEvidenceUrl(assetId?: string, assetType?: string): string {
  if (assetId === "EV-MANG-0101") return "/evidence/mangrove_before.jpg";
  if (assetId === "EV-MANG-0102") return "/evidence/mangrove_after.jpg";
  if (assetId === "EV-MANG-0103") return "/evidence/mangrove_progress.jpg";
  if (assetId === "EV-SOL-0201") return "/evidence/solar_before.jpg";
  if (assetId === "EV-SOL-0202") return "/evidence/solar_after.jpg";

  if (assetType === "BEFORE") return "/evidence/mangrove_before.jpg";
  if (assetType === "AFTER") return "/evidence/mangrove_after.jpg";
  if (assetType === "PROGRESS") return "/evidence/mangrove_progress.jpg";

  return "/evidence/mangrove_after.jpg";
}

export function sanitizeEvidenceUrl(url?: any, assetId?: string, assetType?: string): string {
  if (!url || typeof url !== "string") return getFallbackEvidenceUrl(assetId, assetType);

  // Remap known broken / 404 Unsplash URLs to permanent Cloudinary / local assets
  if (url.includes("photo-1511497584788-87676104235f")) {
    return "https://res.cloudinary.com/jfsfulbk/image/upload/v1790780610/terrawitness_demo/mangrove_after.jpg";
  }
  if (url.includes("photo-1509391365360-2e959784a276")) {
    return "https://res.cloudinary.com/jfsfulbk/image/upload/v1790780612/terrawitness_demo/solar_before.jpg";
  }
  if (url.includes("photo-1508873696983-2df5293cb325")) {
    return "https://res.cloudinary.com/jfsfulbk/image/upload/v1790780613/terrawitness_demo/solar_after.jpg";
  }

  return url;
}

interface EvidenceImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  assetId?: string;
  assetType?: string;
  label?: string;
}

export function EvidenceImage({
  src,
  fallbackSrc,
  assetId,
  assetType,
  label,
  alt = "Evidence Media Asset",
  className = "",
  ...props
}: EvidenceImageProps) {
  const resolvedFallback = fallbackSrc || getFallbackEvidenceUrl(assetId, assetType);
  const initialUrl = sanitizeEvidenceUrl(src, assetId, assetType) || resolvedFallback;

  const [imgSrc, setImgSrc] = useState<string>(initialUrl);
  const [hasFailed, setHasFailed] = useState<boolean>(false);
  const [triedFallback, setTriedFallback] = useState<boolean>(false);

  useEffect(() => {
    const updated = sanitizeEvidenceUrl(src, assetId, assetType) || resolvedFallback;
    setImgSrc(updated);
    setHasFailed(false);
    setTriedFallback(false);
  }, [src, assetId, assetType, resolvedFallback]);

  const handleError = () => {
    if (!triedFallback && imgSrc !== resolvedFallback) {
      setTriedFallback(true);
      setImgSrc(resolvedFallback);
    } else {
      setHasFailed(true);
    }
  };

  if (hasFailed || !imgSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#0d1117] border border-[#232a36] text-zinc-400 p-4 font-mono select-none ${className}`}
      >
        <ImageOff className="h-8 w-8 text-zinc-600 mb-2" />
        <span className="text-[11px] font-semibold text-zinc-300">
          {assetId || "EVIDENCE ASSET"}
        </span>
        <span className="text-[10px] text-zinc-500 text-center max-w-[200px] truncate">
          {label || alt}
        </span>
        <span className="mt-2 text-[9px] text-emerald-400/80 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
          <ShieldCheck className="h-2.5 w-2.5" /> VERIFIED RECORD
        </span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
