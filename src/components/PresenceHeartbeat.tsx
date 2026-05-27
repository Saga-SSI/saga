"use client";

import usePresence from "@convex-dev/presence/react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "convex/_generated/api";

/**
 * Keeps the user marked as online while the app is open.
 * Must be mounted whenever the user is logged in.
 */
export function PresenceHeartbeat() {
  const { user, isLoaded } = useUser();
  const currentUser = useQuery(
    api.users.getByClerkId,
    isLoaded && user ? { clerkId: user.id } : "skip",
  );
  const roomId = currentUser?._id ? "app" : "";
  const userId = currentUser?._id ? (currentUser._id as string) : "";
  usePresence(api.presence, roomId, userId);
  return null;
}
