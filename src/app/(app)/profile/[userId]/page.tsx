"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import type { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";
import { dmSans } from "@/app/fonts";
import UserProfileView from "@/components/profile/UserProfileView";

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as Id<"users">;
  const { user, isLoaded: isUserLoaded } = useUser();

  const profile = useQuery(
    api.users.getPublicById,
    isUserLoaded && user ? { userId } : "skip",
  );

  const currentUser = useQuery(
    api.users.getByClerkId,
    isUserLoaded && user ? { clerkId: user.id } : "skip",
  );

  const isOwnProfile = currentUser?._id === userId;

  useEffect(() => {
    if (isOwnProfile) {
      router.replace("/profile");
    }
  }, [isOwnProfile, router]);

  if (!isUserLoaded || profile === undefined) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#1C1C1C]">
        <div className="size-8 animate-spin rounded-full border-2 border-white/10 border-t-[#FF1A00]" />
      </div>
    );
  }

  if (isOwnProfile) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#1C1C1C]">
        <div className="size-8 animate-spin rounded-full border-2 border-white/10 border-t-[#FF1A00]" />
      </div>
    );
  }

  if (profile === null) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 bg-[#1C1C1C] px-6">
        <p className={`${dmSans.className} text-lg text-white/80`}>Profile not found</p>
        <button
          type="button"
          onClick={() => router.push("/village")}
          className={`${dmSans.className} text-sm text-[#FF6B55] hover:text-[#FF1A00] hover:underline`}
        >
          Back to Village
        </button>
      </div>
    );
  }

  return <UserProfileView profile={profile} />;
}
