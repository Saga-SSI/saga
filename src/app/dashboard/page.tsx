import { navFont, sortsMillGoudy } from "@/app/fonts";

export default function DashboardPage() {
  return (
    <div className="flex h-[calc(100dvh-3rem)] min-h-0 flex-col p-6">
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col">
        <header>
          <h1
            className={`${sortsMillGoudy.className} text-3xl tracking-[-0.04em] text-white`}
          >
            Cursor on the Web
          </h1>
          <p
            className={`${navFont.className} mt-2 text-sm text-white/45`}
          >
            Your workspace for building with Saga. Open Cursor Agent
            (bottom-right) for codebase help or Docs Assistant (bottom-left)
            for product documentation.
          </p>
        </header>
      </div>
    </div>
  );
}
