import Link from "next/link";
import DocsAssistantChat from "@/components/dashboard/DocsAssistantChat";
import { navFont, sortsMillGoudy } from "@/app/fonts";
import { getMintlifyPublicConfig } from "@/lib/mintlify";

export default function DocumentationPage() {
  const mintlify = getMintlifyPublicConfig();

  return (
    <div className="min-h-svh bg-[#1C1C1C]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:flex-row lg:py-14">
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
            Product docs live on Mintlify. Ask the assistant here, or browse the
            full site for guides, platform references, and setup instructions.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={mintlify.docsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className={`${navFont.className} rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-[#1C1C1C] transition hover:bg-white/90`}
            >
              Open Mintlify docs
            </a>
            <Link
              href="/dashboard"
              className={`${navFont.className} rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/75 transition hover:border-white/20 hover:text-white`}
            >
              Go to dashboard
            </Link>
          </div>

          <div
            className={`${navFont.className} mt-10 grid gap-4 sm:grid-cols-2`}
          >
            {[
              {
                title: "Quickstart",
                body: "Install Saga, configure env vars, and preview docs locally.",
              },
              {
                title: "Cursor Agent",
                body: "Run programmatic Cursor agents from the dashboard.",
              },
              {
                title: "Docs Assistant",
                body: "Mintlify-powered Q&A with cited sources from your docs.",
              },
              {
                title: "Local preview",
                body: "Run npm run docs:dev to preview docs on port 3333.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-white/8 bg-[#242424]/60 p-4"
              >
                <h2 className="text-sm font-medium text-white/90">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/45">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex h-[min(640px,calc(100dvh-8rem))] w-full shrink-0 flex-col rounded-2xl border border-white/10 bg-[#1C1C1C] p-5 lg:w-[420px]">
          <DocsAssistantChat
            docsUrl={mintlify.docsUrl}
            configured={mintlify.configured}
          />
        </div>
      </div>
    </div>
  );
}
