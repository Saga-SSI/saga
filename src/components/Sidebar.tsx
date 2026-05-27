"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { HiChevronDown, HiCog, HiHome, HiLightningBolt, HiLogout, HiUser, HiUserGroup } from "react-icons/hi";
import { HiBuildingOffice2 } from "react-icons/hi2";
import { api } from "convex/_generated/api";
import { dmSans, sagaLogoClass, sortsMillGoudy } from "@/app/fonts";
import { useSidebar } from "@/contexts/SidebarContext";
import SidebarToggleButton from "./SidebarToggleButton";
import SidebarNavItem from "./SidebarNavItem";
import EditProfileModal from "./EditProfileModal";

const navItems = [
  { href: "/home", label: "Home", icon: HiHome },
  { href: "/tribes", label: "Tribes", icon: HiUserGroup },
  { href: "/village", label: "Village", icon: HiBuildingOffice2 },
  { href: "/work", label: "Work", icon: HiLightningBolt },
] as const;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useClerk();
  const { isCollapsed, toggleCollapse } = useSidebar();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isSetupProfileMode, setIsSetupProfileMode] = useState(false);
  const [isMobileOverlay, setIsMobileOverlay] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentUser = useQuery(
    api.users.getByClerkId,
    isUserLoaded && user?.id ? { clerkId: user.id } : "skip",
  );

  const avatarUrl = useQuery(
    api.users.generateImageUrl,
    currentUser?.avatarStorageId ? { storageId: currentUser.avatarStorageId } : "skip",
  );

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    try {
      await signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Error signing out:", error);
      router.push("/");
    }
  };

  const handleSettings = () => {
    setIsEditProfileModalOpen(true);
    setIsDropdownOpen(false);
  };

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
        <div className="relative flex h-full flex-col">
          <div
            className={`flex items-center transition-all ${
              isCollapsed ? "p-4" : "px-4 py-5"
            }`}
          >
            <div className="flex w-full items-center justify-between">
              <Link
                href="/home"
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
                    className={`${sagaLogoClass} text-[2rem] leading-none tracking-[-0.07em] text-white`}
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

          <div className={`${isCollapsed ? "px-2 pb-2" : "px-2 pb-4"} space-y-1`}>
            {navItems.map(({ href, label, icon }) => (
              <SidebarNavItem
                key={href}
                href={href}
                label={label}
                icon={icon}
                isActive={pathname === href || pathname.startsWith(`${href}/`)}
                isCollapsed={isCollapsed}
                onNavigate={isMobileOverlay ? onClose : undefined}
              />
            ))}
          </div>

          <div
            className={`${isCollapsed ? "px-2" : "px-2"} mt-1 border-t border-white/5 pt-2`}
          >
            <SidebarNavItem
              href="/profile"
              label="Profile"
              icon={HiUser}
              isActive={
                pathname === "/profile" || pathname.startsWith("/profile/")
              }
              isCollapsed={isCollapsed}
              onNavigate={isMobileOverlay ? onClose : undefined}
            />
          </div>

          <div className="min-h-0 flex-1" />

          {isCollapsed && (
            <div className="absolute left-1/2 top-4 hidden -translate-x-1/2 md:block">
              <SidebarToggleButton onClick={toggleCollapse} title="Expand sidebar" />
            </div>
          )}

          <div className="mt-auto">
            {!isCollapsed && !currentUser?.username && (
              <div className="px-2 pt-2 pb-1">
                <div className="p-3 rounded-lg border border-gray-700 bg-[#1C1C1C]">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={`${sortsMillGoudy.className} text-white text-lg font-medium`}
                    >
                      Get Started
                    </h3>
                    <p className={`${dmSans.className} text-gray-500 text-xs shrink-0`}>
                      Step 0/1
                    </p>
                  </div>
                  <p className={`${dmSans.className} text-gray-400 text-xs mt-1`}>
                    Complete your profile & get to connect with others.
                  </p>
                  <button
                    onClick={() => {
                      setIsSetupProfileMode(true);
                      setIsEditProfileModalOpen(true);
                    }}
                    className={`${dmSans.className} mt-3 w-full py-2 px-3 rounded-md text-sm font-medium text-white bg-[#FF1A00] hover:bg-[#E61700] transition-colors cursor-pointer`}
                  >
                    Finish profile
                  </button>
                </div>
              </div>
            )}

            <div
              className={`${isCollapsed ? "p-2" : "p-2"} border-t border-white/5 bg-[#1C1C1C] cursor-pointer ${
                !isDropdownOpen ? "hover:bg-[#2A2A2A]" : ""
              } transition-all`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              title={isCollapsed ? "User Menu" : undefined}
            >
              <div className="relative" ref={dropdownRef}>
                <div
                  className={`w-full flex items-center ${
                    isCollapsed ? "justify-center px-2 py-2" : "gap-2 px-2 py-2 sm:gap-3 sm:px-3"
                  } rounded-lg text-gray-300 hover:text-white transition-all`}
                >
                  {isMounted &&
                  isUserLoaded &&
                  (avatarUrl || currentUser?.avatarUrl || user?.imageUrl) ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-[#2A2A2A]">
                      <Image
                        src={avatarUrl || currentUser?.avatarUrl || user?.imageUrl || ""}
                        alt={currentUser?.name || user?.firstName || user?.username || "User"}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center shrink-0">
                      <span className={`${dmSans.className} text-white text-xs font-medium`}>
                        {isMounted && isUserLoaded && (currentUser?.name || user?.firstName || user?.username)
                          ? (currentUser?.name || user?.firstName || user?.username || "U")
                              .charAt(0)
                              .toUpperCase()
                          : "U"}
                      </span>
                    </div>
                  )}
                  {!isCollapsed && (
                    <>
                      <div className="flex-1 min-w-0 text-left overflow-hidden">
                        <p
                          className={`${dmSans.className} text-white text-xs sm:text-sm font-medium truncate`}
                        >
                          {currentUser?.name || user?.firstName || user?.username || "User"}
                        </p>
                        <p className={`${dmSans.className} text-gray-400 text-xs truncate`}>
                          {user?.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>
                      <HiChevronDown
                        className={`text-lg shrink-0 transition-transform ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </>
                  )}
                </div>

                {isDropdownOpen && (
                  <div
                    className={`absolute ${
                      isCollapsed ? "left-full ml-2 top-0" : "bottom-full mb-5 left-0 right-0"
                    } bg-[#1C1C1C] border border-gray-700 rounded-lg shadow-lg z-50 min-w-[160px] p-1.5`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-2 py-2 border-b border-gray-700 mb-1">
                      <p className={`${dmSans.className} text-gray-400 text-xs truncate`}>
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>

                    <Link href="/profile" onClick={() => setIsDropdownOpen(false)}>
                      <button className="cursor-pointer w-full flex items-center gap-2 px-2 py-2 rounded-lg text-gray-300 hover:bg-[#2A2A2A] hover:text-white transition-all">
                        <HiUser className="text-lg shrink-0" />
                        <span className={`${dmSans.className} font-medium text-sm`}>
                          Profile
                        </span>
                      </button>
                    </Link>

                    <button
                      onClick={handleSettings}
                      className="cursor-pointer w-full flex items-center gap-2 px-2 py-2 rounded-lg text-gray-300 hover:bg-[#2A2A2A] hover:text-white transition-all"
                    >
                      <HiCog className="text-lg shrink-0" />
                      <span className={`${dmSans.className} font-medium text-sm`}>
                        Settings
                      </span>
                    </button>

                    <div className="border-t border-gray-700 my-1" />

                    <button
                      onClick={handleLogout}
                      className="cursor-pointer w-full flex items-center gap-2 px-2 py-2 rounded-lg text-gray-300 hover:bg-[#2A2A2A] hover:text-white transition-all"
                    >
                      <HiLogout className="text-lg shrink-0" />
                      <span className={`${dmSans.className} font-medium text-sm`}>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => {
          setIsEditProfileModalOpen(false);
          setIsSetupProfileMode(false);
        }}
        requireUsername={isSetupProfileMode}
        currentName={currentUser?.name || user?.firstName || user?.username || ""}
        currentBio={currentUser?.bio || ""}
        currentUsername={currentUser?.username}
        currentWebsite={currentUser?.website}
        currentButtonColor={currentUser?.buttonColor}
        currentAvatarUrl={currentUser?.avatarUrl || user?.imageUrl}
        currentAvatarStorageId={currentUser?.avatarStorageId || undefined}
      />
    </>
  );
}
