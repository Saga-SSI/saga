"use client";

import Link from "next/link";
import type { IconType } from "react-icons";
import { dmSans } from "@/app/fonts";

interface SidebarNavItemProps {
  href: string;
  label: string;
  icon: IconType;
  isActive: boolean;
  isCollapsed: boolean;
  onNavigate?: () => void;
}

export default function SidebarNavItem({
  href,
  label,
  icon: Icon,
  isActive,
  isCollapsed,
  onNavigate,
}: SidebarNavItemProps) {
  return (
    <Link href={href} className="block w-full">
      <button
        type="button"
        className={`flex w-full cursor-pointer items-center rounded-full text-gray-300 transition-all hover:bg-[#2A2A2A] hover:text-white ${
          isCollapsed ? "justify-center px-2 py-1.5" : "gap-2 px-2 py-1.5"
        } ${isActive ? "bg-[#2A2A2A] text-white" : ""}`}
        title={isCollapsed ? label : undefined}
        onClick={onNavigate}
      >
        <Icon className="shrink-0 text-lg" />
        {!isCollapsed && (
          <span className={`${dmSans.className} text-sm font-medium`}>{label}</span>
        )}
      </button>
    </Link>
  );
}
