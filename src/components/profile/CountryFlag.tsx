"use client";

import * as Flags from "country-flag-icons/react/3x2";

interface CountryFlagProps {
  countryCode?: string;
  className?: string;
}

export default function CountryFlag({ countryCode, className = "h-3 w-4 shrink-0 rounded-[2px]" }: CountryFlagProps) {
  if (!countryCode || countryCode.length !== 2) return null;

  const code = countryCode.toUpperCase() as keyof typeof Flags;
  const Flag = Flags[code];
  if (!Flag) return null;

  return <Flag className={className} aria-hidden />;
}
