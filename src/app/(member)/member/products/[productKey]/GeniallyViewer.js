"use client";

import { Maximize2, MonitorPlay } from "lucide-react";
import { useRef } from "react";

export default function GeniallyViewer({ embedUrl, productName }) {
  const viewerRef = useRef(null);

  async function handleFullscreen() {
    const viewer = viewerRef.current;

    if (!viewer || typeof viewer.requestFullscreen !== "function") {
      return;
    }

    try {
      await viewer.requestFullscreen();
    } catch {
      // Fullscreen can be denied by the browser or device and should fail quietly.
    }
  }

  return (
    <div
      ref={viewerRef}
      className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-blue-100 bg-[#f7fbff] sm:aspect-video"
    >
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title={`${productName} learning content`}
          className="h-full w-full border-0"
          allowFullScreen
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center px-6 py-10 sm:px-10">
          <div className="max-w-sm text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-[0_10px_24px_rgba(50,103,172,0.1)]">
              <MonitorPlay size={29} strokeWidth={1.7} aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-[#142447]">Genially Content</h3>
            <p className="mt-2 text-sm leading-6 text-[#6f87ad]">Interactive learning content will appear here.</p>
            <p className="mt-3 text-xs leading-5 text-[#91a4c1]">Genially embed will be connected in a later phase.</p>
          </div>
        </div>
      )}

      {embedUrl && (
        <button
          type="button"
          onClick={handleFullscreen}
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg bg-[#142447]/90 px-3.5 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:bg-[#142447] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <Maximize2 size={15} aria-hidden="true" />
          Fullscreen
        </button>
      )}
    </div>
  );
}
