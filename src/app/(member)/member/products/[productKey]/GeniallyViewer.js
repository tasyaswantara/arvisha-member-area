"use client";

import { MonitorPlay } from "lucide-react";
import { useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function GeniallyViewer({ embedUrl, contentName }) {
  const [isLoading, setIsLoading] = useState(Boolean(embedUrl));

  return (
    <div
      aria-busy={isLoading}
      className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-blue-100 bg-[#f7fbff] sm:aspect-video"
    >
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title={`${contentName} learning content`}
          width="100%"
          height="100%"
          onLoad={() => setIsLoading(false)}
          className={`h-full w-full border-0 transition-opacity duration-200 ${isLoading ? "opacity-0" : "opacity-100"}`}
          frameBorder="0"
          allowFullScreen
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center px-6 py-10 sm:px-10">
          <div className="max-w-sm text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-[0_10px_24px_rgba(50,103,172,0.1)]">
              <MonitorPlay size={29} strokeWidth={1.7} aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-[#142447]">Konten Genially</h3>
            <p className="mt-2 text-sm leading-6 text-[#6f87ad]">Konten pembelajaran interaktif akan muncul di sini.</p>
            <p className="mt-3 text-xs leading-5 text-[#91a4c1]">Embed Genially akan dihubungkan pada fase selanjutnya.</p>
          </div>
        </div>
      )}

      {embedUrl && isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#f7fbff]">
          <LoadingSpinner label="Memuat konten..." className="flex-col gap-3" />
        </div>
      )}
    </div>
  );
}
