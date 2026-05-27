"use client";

import Image from "next/image";
import { useMutation } from "convex/react";
import {
  HiArrowDown,
  HiArrowLeft,
  HiArrowRight,
  HiArrowUp,
  HiCheck,
} from "react-icons/hi";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { dmSans, robotoMono } from "@/app/fonts";
import AssigneePicker from "./AssigneePicker";

type IdeaStatus = "open" | "in_progress" | "done";
type VoteDirection = "up" | "down";

interface IdeaUser {
  _id: Id<"users">;
  name: string;
  username?: string;
  avatarUrl: string;
}

export interface WorkIdea {
  _id: Id<"workIdeas">;
  title: string;
  description: string;
  status: IdeaStatus;
  voteCount: number;
  userVote: VoteDirection | null;
  createdAt: number;
  author: IdeaUser | null;
  assignee: IdeaUser | null;
  authorId: Id<"users">;
}

interface IdeaCardProps {
  idea: WorkIdea;
  currentUserId?: Id<"users">;
  variant?: "default" | "kanban";
}

const statusLabels: Record<IdeaStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  done: "Done",
};

const statusStyles: Record<IdeaStatus, string> = {
  open: "bg-white/5 text-white/60",
  in_progress: "bg-[#FF1A00]/15 text-[#FF6B55]",
  done: "bg-emerald-500/15 text-emerald-400",
};

function formatRelativeTime(timestamp: number) {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function UserChip({ user }: { user: IdeaUser }) {
  const label = user.username ? `@${user.username}` : user.name;

  return (
    <span className="inline-flex items-center gap-1.5">
      {user.avatarUrl ? (
        <Image
          src={user.avatarUrl}
          alt={user.name}
          width={16}
          height={16}
          className="size-4 rounded-full object-cover"
        />
      ) : (
        <span className="flex size-4 items-center justify-center rounded-full bg-white/10 text-[10px] text-white/70">
          {user.name.charAt(0).toUpperCase()}
        </span>
      )}
      <span>{label}</span>
    </span>
  );
}

export default function IdeaCard({
  idea,
  currentUserId,
  variant = "default",
}: IdeaCardProps) {
  const isKanban = variant === "kanban";
  const castVote = useMutation(api.workIdeas.vote);
  const moveStatus = useMutation(api.workIdeas.moveStatus);
  const markDone = useMutation(api.workIdeas.markDone);

  const isAssignee = currentUserId === idea.assignee?._id;
  const isAuthor = currentUserId === idea.author?._id;
  const canMarkDone =
    idea.status !== "done" && (isAssignee || isAuthor) && !!currentUserId;
  const canMoveLeft = !!currentUserId && idea.status !== "open";
  const canMoveRight = !!currentUserId && idea.status !== "done";

  const handleVote = async (direction: VoteDirection) => {
    try {
      await castVote({ ideaId: idea._id, direction });
    } catch (error) {
      console.error("Failed to cast vote:", error);
    }
  };

  const handleMove = async (direction: "prev" | "next") => {
    try {
      await moveStatus({ ideaId: idea._id, direction });
    } catch (error) {
      console.error("Failed to move task:", error);
    }
  };

  const handleMarkDone = async () => {
    try {
      await markDone({ ideaId: idea._id });
    } catch (error) {
      console.error("Failed to mark idea done:", error);
    }
  };

  const voteButtonClass = (direction: VoteDirection) =>
    `flex items-center justify-center bg-transparent p-0.5 transition-colors ${
      !currentUserId
        ? "cursor-not-allowed opacity-40"
        : "cursor-pointer hover:text-white"
    } ${
      idea.userVote === direction
        ? direction === "up"
          ? "text-[#FF6B55]"
          : "text-white/80"
        : "text-white/35"
    }`;

  const arrowButtonClass = (enabled: boolean) =>
    `flex items-center justify-center bg-transparent p-1 transition-colors ${
      enabled
        ? "cursor-pointer text-white/35 hover:text-white"
        : "cursor-not-allowed text-white/15"
    }`;

  return (
    <article
      className={`relative flex gap-2.5 rounded-xl border border-white/5 bg-[#181818] transition-colors hover:border-white/10 ${
        isKanban ? "p-3" : "p-4"
      }`}
    >
      {canMarkDone && (
        <button
          type="button"
          onClick={handleMarkDone}
          title="Mark done"
          className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-md bg-transparent text-white/35 transition-colors hover:text-emerald-400"
        >
          <HiCheck className="text-base" />
        </button>
      )}

      <div className="flex shrink-0 flex-col items-center justify-center gap-0.5 pt-0.5">
        <button
          type="button"
          onClick={() => handleVote("up")}
          disabled={!currentUserId}
          title={
            currentUserId
              ? idea.userVote === "up"
                ? "Remove upvote"
                : "Upvote"
              : "Sign in to vote"
          }
          className={voteButtonClass("up")}
        >
          <HiArrowUp className={isKanban ? "text-sm" : "text-base"} />
        </button>
        <span
          className={`${robotoMono.className} min-w-[1.25rem] text-center text-xs font-medium tabular-nums text-white/70`}
        >
          {idea.voteCount}
        </span>
        <button
          type="button"
          onClick={() => handleVote("down")}
          disabled={!currentUserId}
          title={
            currentUserId
              ? idea.userVote === "down"
                ? "Remove downvote"
                : "Downvote"
              : "Sign in to vote"
          }
          className={voteButtonClass("down")}
        >
          <HiArrowDown className={isKanban ? "text-sm" : "text-base"} />
        </button>
      </div>

      <div className={`min-w-0 flex-1 ${canMarkDone ? "pr-7" : ""}`}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3
            className={`${dmSans.className} font-semibold text-white ${
              isKanban ? "text-base leading-snug" : "text-lg"
            }`}
          >
            {idea.title}
          </h3>
          {!isKanban && (
            <span
              className={`${dmSans.className} shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[idea.status]}`}
            >
              {statusLabels[idea.status]}
            </span>
          )}
        </div>

        <p
          className={`${robotoMono.className} mt-1.5 truncate text-xs text-white/45`}
          title={idea.description}
        >
          {idea.description}
        </p>

        <div
          className={`${dmSans.className} mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40`}
        >
          {idea.author && (
            <span>
              by <UserChip user={idea.author} />
            </span>
          )}
          <span>{formatRelativeTime(idea.createdAt)}</span>
        </div>

        {currentUserId && (
          <div className="mt-2.5 flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleMove("prev")}
              disabled={!canMoveLeft}
              title="Move back"
              className={arrowButtonClass(canMoveLeft)}
            >
              <HiArrowLeft className="text-sm" />
            </button>

            <AssigneePicker
              ideaId={idea._id}
              assignee={idea.assignee}
              authorId={idea.authorId}
              currentUserId={currentUserId}
            />

            <button
              type="button"
              onClick={() => handleMove("next")}
              disabled={!canMoveRight}
              title="Move forward"
              className={arrowButtonClass(canMoveRight)}
            >
              <HiArrowRight className="text-sm" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
