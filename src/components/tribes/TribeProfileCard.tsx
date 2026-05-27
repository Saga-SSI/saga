"use client";

import Image from "next/image";
import Link from "next/link";
import { dmSans, robotoMono, sortsMillGoudy } from "@/app/fonts";
import {
  VH,
  VW,
  buildMosaicPalette,
  buildTriStyle,
  mosaicParamsFromSeed,
} from "@/components/tribes/hexMosaic";

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

function displaySkills(skills: string[], interests: string[]) {
  const source = skills.length > 0 ? skills : interests;
  return source.slice(0, 3);
}

function displayFocus(interests: string[], location?: string, bio?: string) {
  if (interests.length > 0) {
    return `Building · ${interests.slice(0, 2).join(", ")}`;
  }
  if (location) return location;
  if (bio) return bio.length > 72 ? `${bio.slice(0, 72)}…` : bio;
  return "Member of Saga";
}

export default function TribeProfileCard({
  profile,
  isCurrentUser = false,
}: TribeProfileCardProps) {
  const bannerColor = profile.bannerColor || DEFAULT_BANNER;
  const { rot, triangles } = mosaicParamsFromSeed(profile._id);
  const shades = buildMosaicPalette(bannerColor);
  const triStyle = buildTriStyle(shades);
  const skills = displaySkills(profile.skills, profile.interests);
  const focusLine = displayFocus(profile.interests, profile.location, profile.bio);
  const usernameLine = profile.username ? `@${profile.username}` : null;

  return (
    <article className="relative flex min-w-0 flex-col border border-white/10 bg-[#181818] shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="w-full overflow-hidden" style={{ height: BANNER_H }}>
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
          className="h-full w-full"
        >
          <style>{triStyle}</style>
          <rect width={VW} height={VH} fill={bannerColor} />
          <g transform={`rotate(${rot} ${VW / 2} ${VH / 2})`}>
            {triangles.map(({ id, pts, shade }) => (
              <polygon key={id} className={`tri tri-${shade}`} points={pts} />
            ))}
          </g>
        </svg>
      </div>

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
          {usernameLine ? (
            <p className={`${dmSans.className} text-xs text-white/40`}>{usernameLine}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          {skills.length > 0 ? (
            <p
              className={`${robotoMono.className} wrap-break-word text-[11px] uppercase tracking-wide text-white/55`}
            >
              {skills.join(" · ")}
            </p>
          ) : null}
          <p className={`${robotoMono.className} wrap-break-word text-[10px] text-white/35`}>
            {focusLine}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <button
            type="button"
            className={`${robotoMono.className} shrink-0 bg-[#FF1A00] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#E61700]`}
          >
            Connect
          </button>

          {isCurrentUser ? (
            <Link
              href="/profile"
              className={`${robotoMono.className} text-[11px] font-semibold uppercase tracking-widest text-[#FF6B55] transition-colors hover:text-[#FF1A00] hover:underline`}
            >
              View Profile
            </Link>
          ) : (
            <span
              className={`${robotoMono.className} text-[11px] font-semibold uppercase tracking-widest text-white/25`}
            >
              View Profile
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
