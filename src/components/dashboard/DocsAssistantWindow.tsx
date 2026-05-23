"use client";

import { useEffect, useState } from "react";
import { navFont } from "@/app/fonts";
import type { MintlifyPublicConfig } from "@/lib/mintlify";
import DocsAssistantChat from "./DocsAssistantChat";

function MinimizeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M3 8h10" strokeLinecap="round" />
    </svg>
  );
}

const FALLBACK_CONFIG: MintlifyPublicConfig = {
  domain: "",
  docsUrl: "http://localhost:3333",
  configured: false,
};

export default function DocsAssistantWindow() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [config, setConfig] = useState<MintlifyPublicConfig>(FALLBACK_CONFIG);

  useEffect(() => {
    fetch("/api/mintlify/assistant")
      .then((response) => response.json())
      .then((data: MintlifyPublicConfig) => setConfig(data))
      .catch(() => setConfig(FALLBACK_CONFIG));
  }, []);

  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={() => setIsMinimized(false)}
        aria-label="Open Docs Assistant"
        className={`${navFont.className} fixed bottom-6 left-6 z-50 rounded-lg border border-white/10 bg-[#1C1C1C] px-4 py-2.5 text-sm font-medium tracking-[0.02em] text-white/90 shadow-[0_8px_32px_rgba(0,0,0,0.45)] transition hover:border-white/20 hover:bg-[#242424]`}
      >
        Docs Assistant
      </button>
    );
  }

  return (
    <section
      aria-label="Docs Assistant"
      className="fixed bottom-6 left-6 z-50 flex h-[min(560px,calc(100dvh-3rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1C1C1C] shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
    >
      <header className="flex shrink-0 items-center justify-between border-b border-white/8 px-4 py-3">
        <div>
          <h2
            className={`${navFont.className} text-sm font-medium tracking-[0.02em] text-white/90`}
          >
            Docs Assistant
          </h2>
          <p className={`${navFont.className} mt-0.5 text-xs text-white/40`}>
            Powered by Mintlify
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsMinimized(true)}
          aria-label="Minimize docs assistant window"
          className="rounded-md border border-white/10 p-2 text-white/55 transition hover:border-white/20 hover:bg-white/5 hover:text-white/90"
        >
          <MinimizeIcon />
        </button>
      </header>

      <div className="min-h-0 flex-1 px-4 pb-4">
        <DocsAssistantChat
          docsUrl={config.docsUrl}
          configured={config.configured}
          showHeader={false}
        />
      </div>
    </section>
  );
}
