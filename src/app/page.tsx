"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/Navbar";
import { navFont, robotoMono, sortsMillGoudy } from "./fonts";

const themes = [
  { label: "Learn", color: "#1500FF" },
  { label: "Build", color: "#FF0000" },
  { label: "Gather", color: "#7B00FF" },
  { label: "Organize", color: "#00E5FF" },
  { label: "Create", color: "#FFAE00" },
] as const;

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      router.push("/dashboard");
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
           The Creative <br /> Internet Guild 
          </h1>
        {/*   <h1
          <h1
            className={`${sortsMillGoudy.className} max-w-4xl text-7xl leading-none tracking-[-0.06em] text-white`}
          >
           The Intelligent <br /> Social Platform 
          </h1>*/}
          <p
            className={`${navFont.className} text-[16px] tracking-[0.01em] text-white`}
          >
            A place for founders, builders & innovators <br /> to work together on great ideas.
          </p>

          <div className="mt-14 w-full max-w-4xl border border-solid border-white/5">
            <div className="grid grid-cols-5">
              {themes.map(({ label, color }, index) => (
                <div
                  key={label}
                  className={`flex aspect-square flex-col items-center justify-center gap-4 border-solid border-white/5 p-4 ${
                    index < themes.length - 1 ? "border-r" : ""
                  }`}
                >
                  <span
                    className="size-8 shrink-0"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  />
                  <span
                    className={`${robotoMono.className} text-sm font-normal uppercase tracking-tight text-white`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
