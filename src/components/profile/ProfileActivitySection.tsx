"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import type { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";
import { dmSans, robotoMono } from "@/app/fonts";

interface ProfileActivitySectionProps {
  userId?: Id<"users">;
}

const statusLabels = {
  open: "Open",
  in_progress: "In progress",
  done: "Done",
} as const;

function formatRelativeTime(timestamp: number) {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ProfileActivitySection({ userId }: ProfileActivitySectionProps) {
  const activity = useQuery(
    api.workIdeas.listActivityForUser,
    userId ? { userId } : "skip",
  );

  if (activity === undefined) {
    return (
      <div className="flex justify-center py-6">
        <div className="size-6 animate-spin rounded-full border-2 border-white/10 border-t-[#FF1A00]" />
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <p className={`${dmSans.className} text-sm text-white/30`}>
        No activity yet. Post or join something on Work.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {activity.map((item) => (
        <li
          key={item._id}
          className="rounded-lg border border-white/5 bg-[#141414] px-4 py-3"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <Link
              href="/work"
              className={`${dmSans.className} text-sm font-medium text-white transition-colors hover:text-[#FF6B55]`}
            >
              {item.title}
            </Link>
            <span
              className={`${robotoMono.className} rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/45`}
            >
              {statusLabels[item.status]}
            </span>
          </div>
          <p className={`${dmSans.className} mt-1.5 text-xs text-white/35`}>
            {item.role === "author" ? "Created" : "Assigned"} · {formatRelativeTime(item.updatedAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}
