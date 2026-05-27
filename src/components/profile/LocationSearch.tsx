"use client";

import { useEffect, useRef, useState } from "react";
import { dmSans, robotoMono } from "@/app/fonts";
import { displayCityName } from "@/lib/location/flags";
import type { LocationSuggestion } from "@/lib/location/nominatim";
import CountryFlag from "@/components/profile/CountryFlag";

interface LocationSearchProps {
  location: string;
  countryCode: string;
  onChange: (value: { location: string; countryCode: string }) => void;
  align?: "left" | "right";
}

export default function LocationSearch({
  location,
  countryCode,
  onChange,
  align = "right",
}: LocationSearchProps) {
  const [query, setQuery] = useState(displayCityName(location));
  const [results, setResults] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(displayCityName(location));
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/locations/search?q=${encodeURIComponent(trimmed)}`,
        );
        if (!response.ok) throw new Error("Search failed");
        const data = (await response.json()) as LocationSuggestion[];
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error("Location search failed:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: LocationSuggestion) => {
    setQuery(item.city);
    onChange({ location: item.city, countryCode: item.countryCode });
    setIsOpen(false);
    setResults([]);
  };

  return (
    <div ref={containerRef} className={`relative w-full min-w-[12rem] ${align === "right" ? "ml-auto" : ""}`}>
      <div
        className={`flex items-center gap-1.5 rounded-md border border-white/10 bg-[#141414] px-2 py-1 ${
          align === "right" ? "justify-end" : "justify-start"
        }`}
      >
        <CountryFlag countryCode={countryCode} />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange({ location: e.target.value, countryCode: "" });
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search city"
          className={`${robotoMono.className} min-w-0 flex-1 bg-transparent text-right text-sm text-white/70 outline-none placeholder:text-white/25 focus:border-white/20`}
        />
      </div>

      {isSearching && (
        <p
          className={`${dmSans.className} mt-1 text-[10px] text-white/30 ${
            align === "right" ? "text-right" : "text-left"
          }`}
        >
          Searching…
        </p>
      )}

      {isOpen && results.length > 0 && (
        <ul
          className={`absolute z-30 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-white/10 bg-[#1C1C1C] p-1 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {results.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleSelect(item)}
                className={`${robotoMono.className} flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-white`}
              >
                <CountryFlag countryCode={item.countryCode} />
                <span className="min-w-0 truncate">{item.city}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
