"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { dmSans } from "@/app/fonts";
import TribeProfileCard from "@/components/tribes/TribeProfileCard";

export default function TribesGrid() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const profiles = useQuery(api.users.listForTribes, isUserLoaded && user ? {} : "skip");

  if (!isUserLoaded || profiles === undefined) {
    return (
      <p className={`${dmSans.className} text-sm text-white/40`}>Loading village members…</p>
    );
  }

  if (profiles.length === 0) {
    return (
      <p className={`${dmSans.className} text-sm text-white/40`}>
        No members yet. As people join the village, their profiles will show up here.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 [&>article]:min-w-0">
      {profiles.map((profile) => (
        <TribeProfileCard
          key={profile._id}
          profile={profile}
          isCurrentUser={profile.clerkId === user?.id}
        />
      ))}
    </div>
  );
}
