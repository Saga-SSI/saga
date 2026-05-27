"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/Navbar";
import { navFont, sortsMillGoudy } from "./fonts";

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      router.push("/home");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="relative flex h-svh min-w-content flex-col items-center justify-center bg-[#1C1C1C]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FF1A00]" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="relative flex h-svh min-w-content flex-col">
      <SiteHeader />
      <main className="relative z-10 mx-auto box-border min-h-0 w-full max-w-content flex-1 overflow-hidden border-b border-solid border-white/5">
        <div className="absolute inset-0 flex flex-col items-center justify-start gap-3 p-10 mt-10 text-center">
        {/*   <h1
            className={`${sortsMillGoudy.className} max-w-4xl text-7xl leading-none tracking-[-0.06em] text-white`}
          >
            The Intelligent <br /> Social Platform
          </h1> */}
          <h1
            className={`${sortsMillGoudy.className} max-w-4xl text-7xl leading-none tracking-[-0.06em] text-white`}
          >
           The World <br /> Internet Village 
          </h1>
        {/*   <h1
          <h1
            className={`${sortsMillGoudy.className} max-w-4xl text-7xl leading-none tracking-[-0.06em] text-white`}
          >
           The Intelligent <br /> Social Platform // THE CREATIVE INTERNET GUILD
          </h1>*/}
          <p
            className={`${navFont.className} text-[16px] tracking-[0.01em] text-white`}
          >
            A place for founders, builders & innovators <br /> to work together on great ideas.
          </p>
        </div>
      </main>
    </div>
  );
}
