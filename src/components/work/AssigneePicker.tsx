"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { HiChevronDown, HiUser } from "react-icons/hi";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { dmSans } from "@/app/fonts";
import type { WorkIdea } from "./IdeaCard";

interface AssigneePickerProps {
  ideaId: Id<"workIdeas">;
  assignee: WorkIdea["assignee"];
  authorId?: Id<"users">;
  currentUserId?: Id<"users">;
}

function userLabel(name: string, username?: string) {
  return username ? `@${username}` : name;
}

export default function AssigneePicker({
  ideaId,
  assignee,
  authorId,
  currentUserId,
}: AssigneePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const assignTask = useMutation(api.workIdeas.assign);
  const users = useQuery(api.users.listForAssignment);

  const isAuthor = currentUserId === authorId;
  const isAssignee = currentUserId === assignee?._id;
  const canAssign = !!currentUserId && (isAuthor || isAssignee || !assignee);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleAssign = async (userId?: Id<"users">) => {
    try {
      await assignTask({ ideaId, userId });
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to assign task:", error);
    }
  };

  if (!canAssign) {
    if (!assignee) return null;

    return (
      <span
        className={`${dmSans.className} inline-flex min-w-0 max-w-[8rem] items-center gap-1.5 truncate text-xs text-white/45`}
      >
        {assignee.avatarUrl ? (
          <Image
            src={assignee.avatarUrl}
            alt={assignee.name}
            width={16}
            height={16}
            className="size-4 shrink-0 rounded-full object-cover"
          />
        ) : (
          <HiUser className="size-4 shrink-0" />
        )}
        <span className="truncate">
          {userLabel(assignee.name, assignee.username)}
        </span>
      </span>
    );
  }

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`${dmSans.className} flex w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-md bg-transparent px-1.5 py-1 text-xs text-white/45 transition-colors hover:text-white`}
      >
        {assignee?.avatarUrl ? (
          <Image
            src={assignee.avatarUrl}
            alt={assignee.name}
            width={16}
            height={16}
            className="size-4 shrink-0 rounded-full object-cover"
          />
        ) : (
          <HiUser className="size-4 shrink-0" />
        )}
        <span className="min-w-0 truncate">
          {assignee
            ? userLabel(assignee.name, assignee.username)
            : "Assign"}
        </span>
        <HiChevronDown
          className={`size-3.5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && users && (
        <div className="absolute bottom-full left-0 z-20 mb-1 max-h-48 w-52 overflow-y-auto rounded-lg border border-white/10 bg-[#1C1C1C] p-1 shadow-lg">
          {assignee && (
            <button
              type="button"
              onClick={() => handleAssign(undefined)}
              className={`${dmSans.className} w-full cursor-pointer rounded-md px-2 py-1.5 text-left text-xs text-white/50 transition-colors hover:bg-white/5 hover:text-white`}
            >
              Unassigned
            </button>
          )}

          {users.map((user) => {
            const isSelf = user._id === currentUserId;
            const canPick = isAuthor || isSelf;

            if (!canPick) return null;

            return (
              <button
                key={user._id}
                type="button"
                onClick={() => handleAssign(user._id)}
                className={`${dmSans.className} flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-white/5 ${
                  assignee?._id === user._id
                    ? "bg-white/5 text-white"
                    : "text-white/70"
                }`}
              >
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name}
                    width={20}
                    height={20}
                    className="size-5 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px]">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="min-w-0 truncate">
                  {userLabel(user.name, user.username)}
                  {isSelf ? " (you)" : ""}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
