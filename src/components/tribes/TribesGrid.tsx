"use client";

import { useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { dmSans } from "@/app/fonts";
import TribeProfileCard from "@/components/tribes/TribeProfileCard";

type PresenceEntry = {
  userId: string;
  online: boolean;
  lastDisconnected: number;
};

type TribesGridProps = {
  searchQuery?: string;
};

function profileMatchesSearch(
  profile: {
    name: string;
    username?: string;
    bio?: string;
    location?: string;
    skills: string[];
  },
  query: string,
) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [
    profile.name,
    profile.username,
    profile.bio,
    profile.location,
    ...profile.skills,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

export default function TribesGrid({ searchQuery = "" }: TribesGridProps) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const profiles = useQuery(api.users.listForTribes, isUserLoaded && user ? {} : "skip");
  const villagePresence = useQuery(
    api.presence.listVillagePresence,
    isUserLoaded && user ? {} : "skip",
  );

  const presenceByUserId = useMemo(() => {
    if (!villagePresence) return new Map<string, PresenceEntry>();
    return new Map(
      villagePresence.map((p: PresenceEntry) => [p.userId, p]),
    );
  }, [villagePresence]);

  const sortedProfiles = useMemo(() => {
    if (!profiles) return undefined;
    return [...profiles]
      .filter((profile) => profileMatchesSearch(profile, searchQuery))
      .sort((a, b) => {
        const aOnline = presenceByUserId.get(a._id)?.online ? 1 : 0;
        const bOnline = presenceByUserId.get(b._id)?.online ? 1 : 0;
        if (bOnline !== aOnline) return bOnline - aOnline;
        return a.name.localeCompare(b.name);
      });
  }, [profiles, presenceByUserId, searchQuery]);

  const onlineCount = useMemo(() => {
    if (!sortedProfiles) return 0;
    return sortedProfiles.filter((p) => presenceByUserId.get(p._id)?.online).length;
  }, [sortedProfiles, presenceByUserId]);

  if (!isUserLoaded || sortedProfiles === undefined) {
    return (
      <p className={`${dmSans.className} text-sm text-white/40`}>Loading village members…</p>
    );
  }

  if (sortedProfiles.length === 0) {
    const hasSearch = searchQuery.trim().length > 0;
    return (
      <p className={`${dmSans.className} text-sm text-white/40`}>
        {hasSearch
          ? "No members match your search."
          : "No members yet. As people join the village, their profiles will show up here."}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {onlineCount > 0 && (
        <p className={`${dmSans.className} text-sm text-white/50`}>
          {onlineCount} {onlineCount === 1 ? "person" : "people"} online now
        </p>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 [&>article]:min-w-0">
        {sortedProfiles.map((profile) => {
          const presence = presenceByUserId.get(profile._id);
          return (
            <TribeProfileCard
              key={profile._id}
              profile={profile}
              isCurrentUser={profile.clerkId === user?.id}
              isOnline={presence?.online}
              lastDisconnected={presence?.lastDisconnected}
            />
          );
        })}
      </div>
    </div>
  );
}
