"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { HiPlus } from "react-icons/hi";
import { api } from "convex/_generated/api";
import { dmSans, sortsMillGoudy } from "@/app/fonts";
import IdeaCard, { type WorkIdea } from "./IdeaCard";
import NewIdeaModal from "./NewIdeaModal";

type IdeaStatus = WorkIdea["status"];
type SortOption = "top" | "new";

const columns: {
  status: IdeaStatus;
  label: string;
  dotColor: string;
}[] = [
  { status: "open", label: "Open", dotColor: "bg-white/40" },
  { status: "in_progress", label: "In progress", dotColor: "bg-[#FF1A00]" },
  { status: "done", label: "Done", dotColor: "bg-emerald-400" },
];

function sortIdeas(ideas: WorkIdea[], sort: SortOption) {
  return [...ideas].sort((a, b) => {
    if (sort === "new") return b.createdAt - a.createdAt;
    return b.voteCount - a.voteCount || b.createdAt - a.createdAt;
  });
}

export default function WorkBoard() {
  const [sort, setSort] = useState<SortOption>("top");
  const [isNewIdeaOpen, setIsNewIdeaOpen] = useState(false);

  const currentUser = useQuery(api.users.getCurrentUser);
  const ideas = useQuery(api.workIdeas.list, { sort });

  const ideasByStatus = useMemo(() => {
    if (!ideas) return null;

    const grouped: Record<IdeaStatus, WorkIdea[]> = {
      open: [],
      in_progress: [],
      done: [],
    };

    for (const idea of ideas) {
      grouped[idea.status].push(idea);
    }

    for (const status of Object.keys(grouped) as IdeaStatus[]) {
      grouped[status] = sortIdeas(grouped[status], sort);
    }

    return grouped;
  }, [ideas, sort]);

  const isEmpty =
    ideasByStatus &&
    columns.every(({ status }) => ideasByStatus[status].length === 0);

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div>
          <h1
            className={`${sortsMillGoudy.className} text-3xl tracking-[-0.04em] text-white`}
          >
            Work
          </h1>
          <p className={`${dmSans.className} mt-2 text-sm text-white/45`}>
            Propose ideas, upvote what matters, and start building together.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#141414] p-1">
            {(["top", "new"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSort(option)}
                className={`${dmSans.className} cursor-pointer rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                  sort === option
                    ? "bg-[#2A2A2A] text-white"
                    : "text-white/45 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsNewIdeaOpen(true)}
            className={`${dmSans.className} inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-[#FF1A00] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#E61700]`}
          >
            <HiPlus className="text-lg" />
            New idea
          </button>
        </div>
      </header>

      {ideas === undefined ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-white/10 border-t-[#FF1A00]" />
        </div>
      ) : isEmpty ? (
        <div className="mt-8 flex flex-1 items-center justify-center">
          <div className="w-full max-w-md rounded-xl border border-dashed border-white/10 py-16 text-center">
            <p className={`${sortsMillGoudy.className} text-xl text-white/70`}>
              No ideas yet
            </p>
            <p className={`${dmSans.className} mt-2 text-sm text-white/40`}>
              Be the first to share something worth building.
            </p>
            <button
              type="button"
              onClick={() => setIsNewIdeaOpen(true)}
              className={`${dmSans.className} mt-4 cursor-pointer text-sm font-medium text-[#FF6B55] hover:text-[#FF1A00]`}
            >
              Post the first idea
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid min-h-0 flex-1 grid-cols-1 gap-4 pb-2 md:grid-cols-3">
          {columns.map(({ status, label, dotColor }) => {
            const columnIdeas = ideasByStatus?.[status] ?? [];

            return (
              <section
                key={status}
                className="flex min-h-[280px] min-w-0 flex-col rounded-xl border border-white/5 bg-[#141414]/60 md:min-h-0"
              >
                <div className="flex shrink-0 items-center gap-2 border-b border-white/5 px-4 py-3">
                  <span
                    className={`size-2 shrink-0 rounded-full ${dotColor}`}
                    aria-hidden
                  />
                  <h2
                    className={`${dmSans.className} text-sm font-semibold text-white`}
                  >
                    {label}
                  </h2>
                  <span
                    className={`${dmSans.className} ml-auto rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium tabular-nums text-white/45`}
                  >
                    {columnIdeas.length}
                  </span>
                </div>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
                  {columnIdeas.length === 0 ? (
                    <p
                      className={`${dmSans.className} px-2 py-8 text-center text-xs text-white/30`}
                    >
                      Nothing here yet
                    </p>
                  ) : (
                    columnIdeas.map((idea) => (
                      <IdeaCard
                        key={idea._id}
                        idea={idea}
                        currentUserId={currentUser?._id}
                        variant="kanban"
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <NewIdeaModal isOpen={isNewIdeaOpen} onClose={() => setIsNewIdeaOpen(false)} />
    </div>
  );
}
