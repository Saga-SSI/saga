import Link from "next/link";
import { navFont, sortsMillGoudy } from "@/app/fonts";

export default function DocumentationPage() {
  return (
    <div className="min-h-svh bg-[#1C1C1C]">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10 lg:py-14">
        <div className="flex min-w-0 flex-1 flex-col">
          <p
            className={`${navFont.className} text-xs uppercase tracking-[0.12em] text-white/35`}
          >
            Documentation
          </p>
          <h1
            className={`${sortsMillGoudy.className} mt-3 max-w-2xl text-5xl tracking-[-0.05em] text-white`}
          >
            Learn Saga
          </h1>
          <p
            className={`${navFont.className} mt-4 max-w-xl text-base leading-relaxed text-white/50`}
          >
            Product docs are hosted on Mintlify. Browse guides, platform references,
            and setup instructions.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/docs"
              className={`${navFont.className} rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-[#1C1C1C] transition hover:bg-white/90`}
            >
              Open docs
            </a>
            <Link
              href="/dashboard"
              className={`${navFont.className} rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/75 transition hover:border-white/20 hover:text-white`}
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
