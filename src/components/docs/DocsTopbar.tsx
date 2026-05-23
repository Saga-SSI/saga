"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navFont, sortsMillGoudy } from "@/app/fonts";

const navItems = [
  { label: "Docs", href: "/docs" },
  { label: "Documentation", href: "/documentation" },
  { label: "Platform", href: "/docs/platform/dashboard" },
] as const;

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3.5 text-white/45"
    >
      <path d="m21 21-4.34-4.34" />
      <circle cx="11" cy="11" r="8" />
    </svg>
  );
}

function isNavActive(pathname: string, href: string) {
  if (href === "/docs") {
    return pathname === "/docs" || pathname.startsWith("/docs/");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DocsTopbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/8 bg-[#1C1C1C]">
      <div className="flex h-12 w-full items-center px-6 lg:pr-0">
        <div className="flex flex-1 items-center gap-6">
          <Link
            href="/docs"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
            aria-label="Saga docs home"
          >
            <Image
              src="/logo.new.svg"
              alt=""
              width={28}
              height={28}
              className="shrink-0"
              unoptimized
            />
            <span
              className={`${sortsMillGoudy.className} pt-0.5 text-[1.65rem] leading-none tracking-[-0.06em] text-white`}
            >
              Saga
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map(({ label, href }) => {
              const active = isNavActive(pathname, href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`${navFont.className} relative rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "text-[#E8E4DC]"
                      : "text-white/50 hover:text-white/85"
                  }`}
                >
                  {label}
                  {active ? (
                    <span
                      className="absolute -bottom-[7px] left-0 right-0 h-0.5 bg-[#E8E4DC]"
                      aria-hidden
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden flex-1 justify-center sm:flex">
          <Link
            href="/docs"
            className={`${navFont.className} relative flex h-9 w-80 max-w-full items-center rounded-md border border-white/10 bg-[#1C1C1C] pl-9 pr-16 text-sm text-white/45 transition hover:bg-white/5`}
          >
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </span>
            <span className="truncate">Search docs…</span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-white/10 px-1 py-0.5 text-[12px] font-medium tracking-wider text-white/55">
              ⌘K
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <Link
            href="/documentation"
            className={`${navFont.className} hidden h-9 items-center rounded-md border border-white/10 px-3 text-sm text-white/55 transition hover:bg-white/5 hover:text-white/85 sm:inline-flex`}
          >
            Ask AI
          </Link>
          <Link
            href="/dashboard"
            className={`${navFont.className} hidden h-9 items-center rounded-full border border-white/10 px-3 text-sm text-white transition hover:bg-white/5 sm:inline-flex`}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}
