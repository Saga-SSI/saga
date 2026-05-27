"use client";

import Image from "next/image";
import Link from "next/link";
import type { Id } from "convex/_generated/dataModel";
import { dmSans, robotoMono } from "@/app/fonts";
import LocationDisplay from "@/components/profile/LocationDisplay";
import ProfileActivitySection from "@/components/profile/ProfileActivitySection";
import ProfileInlineField from "@/components/profile/ProfileInlineField";
import ProfileLinksSection from "@/components/profile/ProfileLinksSection";
import ProfileSection from "@/components/profile/ProfileSection";
import ProfileTagSection from "@/components/profile/ProfileTagSection";
import { buildLinksDraft, hasAnyLinks } from "@/lib/profileLinks";

const DEFAULT_BANNER = "#2A2424";

function sexAbbreviation(sex: string) {
  const abbreviations: Record<string, string> = {
    Male: "M",
    Female: "F",
    "Non-binary": "N",
    Other: "O",
  };

  return abbreviations[sex] ?? sex.charAt(0).toUpperCase();
}

function formatAgeSex(age?: number, sex?: string) {
  const ageStr = age ? String(age) : "";
  const sexStr = sex ?? "";
  if (ageStr && sexStr) return `${ageStr}${sexAbbreviation(sexStr)}`;
  if (ageStr) return ageStr;
  if (sexStr) return sexAbbreviation(sexStr);
  return "";
}

export type PublicProfile = {
  _id: Id<"users">;
  name: string;
  username?: string;
  avatarUrl: string;
  bannerColor?: string;
  bio?: string;
  location?: string;
  locationCountryCode?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  interests: string[];
  skills: string[];
  age?: number;
  sex?: string;
};

type UserProfileViewProps = {
  profile: PublicProfile;
  isOwner?: boolean;
};

export default function UserProfileView({
  profile,
  isOwner = false,
}: UserProfileViewProps) {
  const bannerColor = profile.bannerColor || DEFAULT_BANNER;
  const links = buildLinksDraft(profile);
  const ageSex = formatAgeSex(profile.age, profile.sex);

  return (
    <div className="min-h-full bg-[#1C1C1C] pb-10">
      <div
        className="relative h-36 w-full"
        style={{ backgroundColor: bannerColor }}
      >
        {isOwner && (
          <div className="absolute right-4 top-4">
            <Link
              href="/profile"
              className={`${dmSans.className} rounded-lg border border-white/15 bg-black/20 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm transition-colors hover:bg-black/35`}
            >
              Edit profile
            </Link>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-3xl px-6">
        <div className="relative -mt-[4.2rem] flex items-start gap-4">
          <div className="relative size-[8.4rem] shrink-0 overflow-hidden rounded-full border-4 border-[#1C1C1C] bg-[#2A2A2A]">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.name}
                width={134}
                height={134}
                className="size-full object-cover"
              />
            ) : (
              <span
                className={`${dmSans.className} flex size-full items-center justify-center text-4xl text-white/60`}
              >
                {profile.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex min-w-0 flex-1 items-start justify-between gap-4 pt-[5.25rem]">
            <div className="min-w-0">
              <ProfileInlineField
                value={profile.name}
                placeholder="Name"
                editable={false}
                variant="title"
                className="leading-none"
              />
              {profile.username ? (
                <p className={`${dmSans.className} mt-0.5 text-sm leading-none text-white/45`}>
                  @{profile.username}
                </p>
              ) : null}
            </div>

            <div className="shrink-0 space-y-1 pt-1 text-right">
              <p className={`${robotoMono.className} text-sm text-white/55`}>
                {ageSex || "—"}
              </p>
              <LocationDisplay
                location={profile.location}
                countryCode={profile.locationCountryCode}
                align="right"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3 pb-8">
          {profile.bio ? (
            <ProfileInlineField
              value={profile.bio}
              placeholder="Bio"
              editable={false}
              variant="subtitle"
            />
          ) : (
            <p className={`${dmSans.className} text-sm text-white/30`}>No bio yet.</p>
          )}
        </div>

        <div className="space-y-4">
          {hasAnyLinks(links) && (
            <ProfileSection title="Links" transparent>
              <ProfileLinksSection links={links} editable={false} />
            </ProfileSection>
          )}

          <ProfileSection title="Interests" transparent>
            <ProfileTagSection
              tags={profile.interests}
              placeholder=""
              editable={false}
            />
          </ProfileSection>

          <ProfileSection title="Skills" transparent>
            <ProfileTagSection
              tags={profile.skills}
              placeholder=""
              editable={false}
            />
          </ProfileSection>

          <ProfileSection title="Activity">
            <ProfileActivitySection userId={profile._id} />
          </ProfileSection>
        </div>
      </div>
    </div>
  );
}
