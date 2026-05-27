"use client";

import { robotoMono } from "@/app/fonts";
import { displayCityName } from "@/lib/location/flags";
import CountryFlag from "@/components/profile/CountryFlag";

interface LocationDisplayProps {
  location?: string;
  countryCode?: string;
  align?: "left" | "right";
}

export default function LocationDisplay({
  location,
  countryCode,
  align = "right",
}: LocationDisplayProps) {
  const city = displayCityName(location);
  if (!city) return null;

  return (
    <p
      className={`${robotoMono.className} flex items-center gap-1.5 text-sm text-white/45 ${
        align === "right" ? "justify-end" : "justify-start"
      }`}
    >
      <CountryFlag countryCode={countryCode} />
      <span>{city}</span>
    </p>
  );
}
