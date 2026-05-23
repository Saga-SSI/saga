"use client";

import { useId } from "react";
import Image from "next/image";
import Link from "next/link";
import { robotoMono, sortsMillGoudy } from "@/app/fonts";

const hubLocations = [
  {
    href: "/temple",
    label: "Temple",
    subtitle: "Space for reflection, ritual, and collective meaning",
    color: "#7B00FF",
  },
  {
    href: "/school",
    label: "School",
    subtitle: "Learn together through curriculum, mentors, and practice",
    color: "#1500FF",
  },
  {
    href: "/library",
    label: "Library",
    subtitle: "Archive knowledge, stories, and wisdom across the network",
    color: "#00E5FF",
  },
  {
    href: "/studio",
    label: "Studio",
    subtitle: "Create art, media, and expression with your community",
    color: "#FFAE00",
  },
  {
    href: "/factory",
    label: "Factory",
    subtitle: "Build products, systems, and tools that scale impact",
    color: "#FF0000",
  },
  {
    href: "/land",
    label: "Land",
    subtitle: "Steward soil, ecology, and regenerative living",
    color: "#22FF00",
  },
] as const;

const centerNav = {
  beforeVillage: [
    { label: "Tools", href: "/tools" },
    { label: "Documentation", href: "/documentation" },
  ],
  afterVillage: [
    { label: "Tribes", href: "/tribes" },
    { label: "Blogs", href: "/blogs" },
    { label: "Pricing", href: "/pricing" },
  ],
} as const;

const authLinks = [
  { href: "/log-in", label: "Log In" },
  { href: "/sign-up", label: "Sign up" },
] as const;

const navLink = `${robotoMono.className} rounded-full px-3 py-1 text-sm font-normal uppercase tracking-tight text-white`;

const navLinkChip =
  `${navLink} bg-transparent transition-colors duration-150 hover:text-white`;

const navLinkCenter = `${navLinkChip} !px-2 hover:bg-[#2F2F2F]`;
const navLinkVillage = `village-trigger ${navLinkChip} !px-2 hover:bg-[#2A2A2A]`;
const navLinkAuth = `${navLinkChip} hover:text-[#FF4000]`;
const navLinkApply = `${navLink} bg-[#FF4000] transition-opacity hover:opacity-90`;

export default function Navbar() {
  const menuId = useId();
  const groupId = useId();

  return (
    <header className="relative z-50 w-full bg-[#1C1C1C]">
      <div className="group/village relative w-full">
        <div className="mx-auto w-full max-w-content">
          <div className="relative flex h-14 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.new.svg"
                alt="Saga"
                width={34}
                height={34}
                unoptimized
              />
              <p
                className={`${sortsMillGoudy.className} pt-1 text-3xl leading-none tracking-[-0.06em] text-white`}
              >
                Saga
              </p>
            </Link>

            <div className="absolute inset-y-0 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1">
              {centerNav.beforeVillage.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={navLinkCenter}
                >
                  {label}
                </Link>
              ))}

              <button
                type="button"
                className={navLinkVillage}
                aria-haspopup="true"
                aria-controls={menuId}
              >
                Village
              </button>

              {centerNav.afterVillage.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={navLinkCenter}
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-end gap-0.5">
              {authLinks.map(({ href, label }) => (
                <Link key={href} href={href} className={navLinkAuth}>
                  {label}
                </Link>
              ))}
              <Link href="/apply" className={navLinkApply}>
                Start for free
              </Link>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-white/5" aria-hidden />

        <div
          id={menuId}
          role="menu"
          aria-labelledby={groupId}
          className="village-menu invisible pointer-events-none absolute left-1/2 top-full z-50 w-[32rem] -translate-x-1/2 opacity-0 transition-[opacity,visibility] duration-200 before:absolute before:inset-x-0 before:bottom-full before:h-3 before:content-[''] group-has-[.village-trigger:hover,.village-menu:hover,.village-trigger:focus-visible,.village-menu:focus-within]/village:visible group-has-[.village-trigger:hover,.village-menu:hover,.village-trigger:focus-visible,.village-menu:focus-within]/village:pointer-events-auto group-has-[.village-trigger:hover,.village-menu:hover,.village-trigger:focus-visible,.village-menu:focus-within]/village:opacity-100"
        >
          <div className="box-border border-x border-b border-solid border-white/5 bg-[#1C1C1C] p-3">
            <p
              id={groupId}
              className={`${robotoMono.className} px-2 pb-3 pt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-gray-500`}
            >
              Locations
            </p>
            <ul className="grid list-none grid-cols-2 gap-x-1 p-0">
              {hubLocations.map(({ href, label, subtitle, color }) => (
                <li key={href}>
                  <Link
                    href={href}
                    role="menuitem"
                    className="flex h-full gap-3 px-2 py-2.5 transition-colors hover:bg-[#2A2A2A]"
                  >
                    <span
                      className="mt-0.5 size-5 shrink-0 rounded-none"
                      style={{ backgroundColor: color }}
                      aria-hidden
                    />
                    <span className="flex min-w-0 flex-col">
                      <span
                        className={`${sortsMillGoudy.className} pt-1 text-xl leading-none tracking-[-0.06em] text-white`}
                      >
                        {label}
                      </span>
                      <span
                        className={`${robotoMono.className} mt-1 text-xs leading-snug text-gray-500`}
                      >
                        {subtitle}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
