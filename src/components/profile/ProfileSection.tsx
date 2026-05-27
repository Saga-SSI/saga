"use client";

import { robotoMono } from "@/app/fonts";

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
  transparent?: boolean;
}

export default function ProfileSection({
  title,
  children,
  transparent = false,
}: ProfileSectionProps) {
  return (
    <section
      className={`rounded-xl border border-white/5 p-5 ${
        transparent ? "bg-transparent" : "bg-[#181818]"
      }`}
    >
      <h2
        className={`${robotoMono.className} mb-4 text-sm font-medium uppercase tracking-wide text-white/50`}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
