"use client";

import { useState } from "react";
import { HiSearch } from "react-icons/hi";
import { dmSans, navFont, sortsMillGoudy } from "@/app/fonts";
import TribesGrid from "@/components/tribes/TribesGrid";

export default function VillageView() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-full p-6 pb-16">
      <div className="mx-auto w-full max-w-7xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1
              className={`${sortsMillGoudy.className} text-3xl tracking-[-0.04em] text-white`}
            >
              Village
            </h1>
            <p className={`${navFont.className} mt-2 text-sm text-white/45`}>
              Find the people working in the village.
            </p>
          </div>

          <div className="relative w-full shrink-0 sm:w-64 sm:pt-1">
            <HiSearch
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35"
              aria-hidden
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members…"
              aria-label="Search village members"
              className={`${dmSans.className} w-full rounded-lg border border-white/10 bg-[#141414] py-2 pl-9 pr-3 text-sm text-white/90 outline-none placeholder:text-white/30 focus:border-white/25`}
            />
          </div>
        </header>

        <section aria-labelledby="village-members-heading" className="mt-8">
          <h2 id="village-members-heading" className="sr-only">
            Village member profiles
          </h2>
          <TribesGrid searchQuery={searchQuery} />
        </section>
      </div>
    </div>
  );
}
