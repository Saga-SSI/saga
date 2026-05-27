"use client";

import Image from "next/image";
import Link from "next/link";
import { dmSans, robotoMono, sortsMillGoudy } from "@/app/fonts";
import { formatLastOnline } from "@/lib/presence";
import { userProfilePath } from "@/lib/profilePaths";

export type TribeProfile = {
  _id: string;
  clerkId: string;
  name: string;
  username?: string;
  avatarUrl: string;
  bannerColor?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  location?: string;
  locationCountryCode?: string;
};

type TribeProfileCardProps = {
  profile: TribeProfile;
  isCurrentUser?: boolean;
  isOnline?: boolean;
  lastDisconnected?: number;
};

const AVATAR_SIZE = 72;
const BANNER_H = 112;
const DEFAULT_BANNER = "#2A2424";

function initialsFromName(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function truncateBio(bio: string, maxLength = 120) {
  return bio.length > maxLength ? `${bio.slice(0, maxLength)}…` : bio;
}

export default function TribeProfileCard({
  profile,
  isCurrentUser = false,
  isOnline = false,
  lastDisconnected,
}: TribeProfileCardProps) {
  const bannerColor = profile.bannerColor || DEFAULT_BANNER;
  const skills = profile.skills.slice(0, 3);
  const usernameLine = profile.username ? `@${profile.username}` : null;
  const bioLine = profile.bio ? truncateBio(profile.bio) : null;
  const presenceLine = isOnline
    ? "Online"
    : lastDisconnected
      ? `Last online ${formatLastOnline(lastDisconnected)}`
      : null;

  return (
    <article className="relative flex min-w-0 flex-col border border-white/10 bg-[#181818] shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div
        className="w-full"
        style={{ height: BANNER_H, backgroundColor: bannerColor }}
      />

      <div
        className="absolute left-4 overflow-hidden rounded-full border-[3px] border-[#1C1C1C] bg-[#2A2A2A]"
        style={{
          width: AVATAR_SIZE,
          height: AVATAR_SIZE,
          top: BANNER_H - AVATAR_SIZE / 2,
        }}
      >
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt={profile.name}
            width={AVATAR_SIZE}
            height={AVATAR_SIZE}
            className="size-full object-cover"
          />
        ) : (
          <span
            className={`${sortsMillGoudy.className} flex size-full items-center justify-center text-xl text-white/75`}
          >
            {initialsFromName(profile.name)}
          </span>
        )}
        {isOnline && (
          <span
            className="absolute bottom-0.5 right-0.5 size-3.5 rounded-full border-2 border-[#1C1C1C] bg-green-500"
            aria-label="Online"
          />
        )}
      </div>

      <div
        className="flex flex-grow flex-col gap-4 px-4 pb-6"
        style={{ paddingTop: AVATAR_SIZE / 2 + 16 }}
      >
        <div className="min-w-0 space-y-1">
          <h3
            className={`${sortsMillGoudy.className} wrap-break-word text-[1.2rem] leading-snug tracking-[-0.02em] text-white`}
          >
            {profile.name}
          </h3>
          {presenceLine ? (
            <p
              className={`${dmSans.className} text-xs ${isOnline ? "text-green-400" : "text-white/35"}`}
            >
              {presenceLine}
            </p>
          ) : usernameLine ? (
            <p className={`${dmSans.className} text-xs text-white/40`}>{usernameLine}</p>
          ) : null}
          {bioLine ? (
            <p className={`${dmSans.className} wrap-break-word text-xs leading-relaxed text-white/50`}>
              {bioLine}
            </p>
          ) : null}
        </div>

        {skills.length > 0 ? (
          <p
            className={`${robotoMono.className} wrap-break-word text-[11px] uppercase tracking-wide text-white/55`}
          >
            {skills.join(" · ")}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3">
          <button
            type="button"
            className={`${robotoMono.className} shrink-0 bg-[#FF1A00] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#E61700]`}
          >
            Connect
          </button>

          <Link
            href={isCurrentUser ? "/profile" : userProfilePath(profile._id)}
            className={`${robotoMono.className} text-[11px] font-semibold uppercase tracking-widest text-[#FF6B55] transition-colors hover:text-[#FF1A00] hover:underline`}
          >
            View Profile
          </Link>
        </div>
      </div>
    </article>
  );
}
