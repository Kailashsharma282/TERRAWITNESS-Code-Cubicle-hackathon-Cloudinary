import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation";

export const metadata: Metadata = {
  title: "TerraWitness | Chain-of-Custody & Evidence Intelligence for Planetary Impact",
  description:
    "TerraWitness combines Cloudinary media infrastructure, cryptographic provenance tracking, EXIF forensics, and computer-vision change detection to turn sustainability media into auditable evidence records.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0b0d11] text-[#f3f4f6] antialiased flex flex-col selection:bg-emerald-900 selection:text-emerald-200">
        <Navigation />
        <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <footer className="border-t border-[#1b212b] bg-[#0b0d11] py-6 px-4 text-center text-xs font-mono text-zinc-500">
          <div className="max-w-4xl mx-auto space-y-2">
            <p className="text-zinc-400">
              TERRAWITNESS EVIDENCE ARCHIVE · POWERED BY CLOUDINARY MEDIA LAYER & CRYPTOGRAPHIC HASH CHAIN
            </p>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              Integrity describes the recorded TerraWitness evidence chain of custody and stored cryptographic fingerprints.
              It does not independently establish camera-original authenticity or guarantee legal admissibility.
              Visual change metrics are optical indicators and do not replace statutory ecological certifications.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
