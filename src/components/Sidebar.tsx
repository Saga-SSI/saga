"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { sortsMillGoudy } from "@/app/fonts";
import { useSidebar } from "@/contexts/SidebarContext";
import SidebarToggleButton from "./SidebarToggleButton";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isCollapsed, toggleCollapse } = useSidebar();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileOverlay, setIsMobileOverlay] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || typeof window === "undefined") return;

    const mqSmall = window.matchMedia?.("(max-width: 767px)");
    const mqLandscape = window.matchMedia?.(
      "(max-width: 900px) and (orientation: landscape)",
    );

    const compute = () => {
      const small = mqSmall ? mqSmall.matches : window.innerWidth <= 767;
      const landscape = mqLandscape
        ? mqLandscape.matches
        : window.innerWidth <= 900 && window.innerWidth > window.innerHeight;
      setIsMobileOverlay(small || landscape);
    };

    compute();
    mqSmall?.addEventListener?.("change", compute);
    mqLandscape?.addEventListener?.("change", compute);
    window.addEventListener("resize", compute);

    return () => {
      mqSmall?.removeEventListener?.("change", compute);
      mqLandscape?.removeEventListener?.("change", compute);
      window.removeEventListener("resize", compute);
    };
  }, [isMounted]);

  return (
    <>
      {isOpen && isMobileOverlay && (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-pointer bg-black/50"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`${
          isMobileOverlay ? "fixed" : "md:relative"
        } inset-y-0 left-0 z-50 h-screen w-[16.2rem] transform overflow-hidden border-r border-solid border-white/5 bg-[#1C1C1C] transition-all duration-300 ease-in-out ${
          isMobileOverlay
            ? isOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : ""
        } ${
          isCollapsed
            ? "md:invisible md:w-0 md:-translate-x-full md:border-r-0 md:opacity-0"
            : "md:visible md:w-[16.2rem] md:translate-x-0 md:opacity-100"
        }`}
      >
        <div className="flex h-full flex-col">
          <div
            className={`flex items-center transition-all ${
              isCollapsed ? "p-4" : "px-4 py-5"
            }`}
          >
            <div className="flex w-full items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-3"
                onClick={isMobileOverlay ? onClose : undefined}
              >
                <Image
                  src="/logo.new.svg"
                  alt="Saga"
                  width={32}
                  height={32}
                  className="shrink-0"
                  unoptimized
                />
                {!isCollapsed && (
                  <span
                    className={`${sortsMillGoudy.className} text-[2rem] font-bold leading-none tracking-[-0.07em] text-white`}
                  >
                    Saga
                  </span>
                )}
              </Link>
              {!isCollapsed && (
                <SidebarToggleButton
                  onClick={toggleCollapse}
                  title="Collapse sidebar"
                  className="hidden md:block"
                />
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1" />

          {isCollapsed && (
            <div className="absolute left-1/2 top-4 hidden -translate-x-1/2 md:block">
              <SidebarToggleButton
                onClick={toggleCollapse}
                title="Expand sidebar"
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
