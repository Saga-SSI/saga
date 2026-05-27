"use client";

import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { api } from "convex/_generated/api";
import { PresenceHeartbeat } from "@/components/PresenceHeartbeat";
import { Providers } from "./providers";

function UserSync() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const getOrCreateUser = useMutation(api.users.getOrCreate);
  const checkUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip",
  );

  useEffect(() => {
    if (!user || !isUserLoaded || checkUser !== undefined) return;

    getOrCreateUser({
      name: user.fullName ?? user.firstName ?? "",
      email: user.primaryEmailAddress?.emailAddress ?? "",
      clerkId: user.id,
      avatarUrl: user.imageUrl,
      username: user.username || undefined,
    });
  }, [user, isUserLoaded, getOrCreateUser, checkUser]);

  return null;
}

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <UserSync />
      <PresenceHeartbeat />
      <Toaster theme="dark" />
      {children}
    </Providers>
  );
}
