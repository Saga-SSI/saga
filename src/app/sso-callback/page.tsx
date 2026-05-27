"use client";

import { useEffect, Suspense } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { fragmentMono } from "@/app/fonts";

function SSOCallbackContent() {
  const { handleRedirectCallback } = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await handleRedirectCallback({
          redirectUrl: searchParams.get("redirect_url") || "/home",
        });
        router.push("/home");
      } catch (err) {
        console.error("SSO callback error:", err);
        router.push("/sign-in");
      }
    };

    handleCallback();
  }, [handleRedirectCallback, router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C1C1C]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF1A00] mx-auto mb-4" />
        <p className={`${fragmentMono.className} text-white text-lg animate-pulse`}>
          Completing sign in...
        </p>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C1C1C]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF1A00] mx-auto mb-4" />
        <p className={`${fragmentMono.className} text-white text-lg animate-pulse`}>Loading...</p>
      </div>
    </div>
  );
}

export default function SSOCallback() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SSOCallbackContent />
    </Suspense>
  );
}
