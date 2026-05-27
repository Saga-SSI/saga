"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { HiOutlineColorSwatch } from "react-icons/hi";
import { api } from "convex/_generated/api";
import { dmSans, robotoMono } from "@/app/fonts";
import ProfileActivitySection from "@/components/profile/ProfileActivitySection";
import ProfileInlineField from "@/components/profile/ProfileInlineField";
import LocationDisplay from "@/components/profile/LocationDisplay";
import LocationSearch from "@/components/profile/LocationSearch";
import ProfileLinksSection from "@/components/profile/ProfileLinksSection";
import ProfileSection from "@/components/profile/ProfileSection";
import ProfileTagSection from "@/components/profile/ProfileTagSection";
import { useUnsavedChangesWarning } from "@/components/profile/useUnsavedChangesWarning";
import {
  buildLinksDraft,
  hasAnyLinks,
  linksDraftEqual,
  serializeLinksDraft,
  type ProfileLinksDraft,
} from "@/lib/profileLinks";

const DEFAULT_BANNER = "#2A2424";

type ProfileDraft = {
  name: string;
  username: string;
  location: string;
  locationCountryCode: string;
  bio: string;
  bannerColor: string;
  interests: string[];
  skills: string[];
  age: string;
  sex: string;
  links: ProfileLinksDraft;
};

function buildDraft(
  currentUser: {
    name?: string;
    username?: string;
    location?: string;
    locationCountryCode?: string;
    bio?: string;
    bannerColor?: string;
    interests?: string[];
    skills?: string[];
    age?: number;
    sex?: string;
    website?: string;
    socialLinks?: Record<string, string>;
  } | null | undefined,
  fallbackName: string,
): ProfileDraft {
  return {
    name: currentUser?.name || fallbackName,
    username: currentUser?.username || "",
    location: currentUser?.location || "",
    locationCountryCode: currentUser?.locationCountryCode || "",
    bio: currentUser?.bio || "",
    bannerColor: currentUser?.bannerColor || DEFAULT_BANNER,
    interests: currentUser?.interests || [],
    skills: currentUser?.skills || [],
    age: currentUser?.age ? String(currentUser.age) : "",
    sex: currentUser?.sex || "",
    links: buildLinksDraft(currentUser),
  };
}

function draftsEqual(a: ProfileDraft, b: ProfileDraft) {
  return (
    a.name === b.name &&
    a.username === b.username &&
    a.location === b.location &&
    a.locationCountryCode === b.locationCountryCode &&
    a.bio === b.bio &&
    a.bannerColor === b.bannerColor &&
    a.age === b.age &&
    a.sex === b.sex &&
    a.interests.join("\0") === b.interests.join("\0") &&
    a.skills.join("\0") === b.skills.join("\0") &&
    linksDraftEqual(a.links, b.links)
  );
}

function sexAbbreviation(sex: string) {
  const abbreviations: Record<string, string> = {
    Male: "M",
    Female: "F",
    "Non-binary": "N",
    Other: "O",
  };

  return abbreviations[sex] ?? sex.charAt(0).toUpperCase();
}

function formatAgeSex(age: string, sex: string) {
  if (age && sex) return `${age}${sexAbbreviation(sex)}`;
  if (age) return age;
  if (sex) return sexAbbreviation(sex);
  return "";
}

export default function ProfilePage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [savedDraft, setSavedDraft] = useState<ProfileDraft | null>(null);

  const currentUser = useQuery(
    api.users.getByClerkId,
    isUserLoaded && user ? { clerkId: user.id } : "skip",
  );

  const avatarUrl = useQuery(
    api.users.generateImageUrl,
    currentUser?.avatarStorageId ? { storageId: currentUser.avatarStorageId } : "skip",
  );

  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const updateProfilePicture = useMutation(api.users.updateProfilePicture);
  const updateProfile = useMutation(api.users.updateProfile);

  const isOwner = true;
  const fallbackName =
    user?.firstName || user?.username || "User";

  const savedProfile = useMemo(
    () => buildDraft(currentUser, fallbackName),
    [currentUser, fallbackName],
  );

  const viewProfile = savedProfile;
  const editProfile = draft ?? savedProfile;
  const displayProfile = isEditing ? editProfile : viewProfile;

  const isDirty =
    isEditing && draft !== null && savedDraft !== null && !draftsEqual(draft, savedDraft);

  useUnsavedChangesWarning(
    isDirty,
    "You have unsaved profile changes. Leave without saving?",
  );

  useEffect(() => {
    if (!isEditing) {
      setDraft(null);
      setSavedDraft(null);
    }
  }, [isEditing]);

  const displayAvatar =
    avatarUrl || currentUser?.avatarUrl || user?.imageUrl || "";

  const patchDraft = (patch: Partial<ProfileDraft>) => {
    setDraft((current) => ({ ...(current ?? savedProfile), ...patch }));
  };

  const startEditing = () => {
    const initial = buildDraft(currentUser, fallbackName);
    setDraft(initial);
    setSavedDraft(initial);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (isDirty) {
      const shouldDiscard = window.confirm(
        "You have unsaved changes. Discard them?",
      );
      if (!shouldDiscard) return;
    }
    setIsEditing(false);
  };

  const saveProfile = async () => {
    if (!draft) return;

    try {
      setIsSaving(true);
      const { website, socialLinks } = serializeLinksDraft(draft.links);
      await updateProfile({
        name: draft.name.trim(),
        username: draft.username,
        location: draft.location,
        locationCountryCode: draft.locationCountryCode || undefined,
        bio: draft.bio,
        bannerColor: draft.bannerColor,
        interests: draft.interests,
        skills: draft.skills,
        age: draft.age ? Number(draft.age) : undefined,
        sex: draft.sex,
        website: website || undefined,
        socialLinks,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
      window.alert("Could not save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfilePictureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !isEditing) return;

    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;

    try {
      setIsUploading(true);
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await updateProfilePicture({ storageId });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      window.alert("Could not upload profile photo. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-full bg-[#1C1C1C] pb-10">
      <div
        className="relative h-36 w-full transition-colors duration-300"
        style={{ backgroundColor: displayProfile.bannerColor }}
      >
        <div className="absolute right-4 top-4 flex items-center gap-2">
          {isOwner && !isEditing && (
            <button
              type="button"
              onClick={startEditing}
              className={`${dmSans.className} cursor-pointer rounded-lg border border-white/15 bg-black/20 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm transition-colors hover:bg-black/35`}
            >
              Edit profile
            </button>
          )}

          {isOwner && isEditing && (
            <>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={isSaving}
                className={`${dmSans.className} cursor-pointer rounded-lg border border-white/15 bg-black/20 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm transition-colors hover:bg-black/35 disabled:opacity-50`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveProfile}
                disabled={isSaving || !isDirty}
                className={`${dmSans.className} cursor-pointer rounded-lg bg-[#FF1A00] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#E61700] disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {isSaving ? "Saving…" : "Save"}
              </button>
            </>
          )}
        </div>

        {isOwner && isEditing && (
          <>
            <input
              ref={colorInputRef}
              type="color"
              value={editProfile.bannerColor}
              onChange={(e) => patchDraft({ bannerColor: e.target.value })}
              className="sr-only"
              aria-label="Choose profile banner color"
            />
            <button
              type="button"
              onClick={() => colorInputRef.current?.click()}
              className={`${dmSans.className} absolute left-4 top-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 bg-black/20 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm transition-colors hover:bg-black/35`}
            >
              <HiOutlineColorSwatch className="size-4" />
              Edit cover
            </button>
          </>
        )}
      </div>

      <div className="mx-auto max-w-3xl px-6">
        <div className="relative -mt-[4.2rem] flex items-start gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfilePictureUpload}
            className="hidden"
          />

          <button
            type="button"
            disabled={!isOwner || !isEditing || isUploading}
            onClick={() => isEditing && fileInputRef.current?.click()}
            onMouseEnter={() => setIsHoveringAvatar(true)}
            onMouseLeave={() => setIsHoveringAvatar(false)}
            className={`relative size-[8.4rem] shrink-0 overflow-hidden rounded-full border-4 border-[#1C1C1C] bg-[#2A2A2A] ${
              isOwner && isEditing ? "cursor-pointer" : "cursor-default"
            }`}
          >
            {displayAvatar ? (
              <Image
                src={displayAvatar}
                alt={displayProfile.name}
                width={134}
                height={134}
                className="size-full object-cover"
              />
            ) : (
              <span
                className={`${dmSans.className} flex size-full items-center justify-center text-4xl text-white/60`}
              >
                {displayProfile.name.charAt(0).toUpperCase()}
              </span>
            )}

            {isOwner && isEditing && (isHoveringAvatar || isUploading) && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-xs text-white">
                {isUploading ? "Uploading…" : "Edit photo"}
              </span>
            )}
          </button>

          <div className="flex min-w-0 flex-1 items-start justify-between gap-4 pt-[5.25rem]">
            <div className="min-w-0">
              <ProfileInlineField
                value={displayProfile.name}
                placeholder="Your name"
                editable={false}
                variant="title"
                className="leading-none"
              />

              {displayProfile.username ? (
                <p className={`${dmSans.className} mt-0.5 text-sm leading-none text-white/45`}>
                  @{displayProfile.username}
                </p>
              ) : null}
            </div>

            <div className="shrink-0 space-y-1 pt-1 text-right">
              {isOwner && isEditing ? (
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center justify-end gap-2">
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={displayProfile.age}
                      onChange={(e) => patchDraft({ age: e.target.value })}
                      placeholder="24"
                      className={`${robotoMono.className} w-12 rounded-md border border-white/10 bg-[#141414] px-2 py-1 text-right text-sm text-white/70 outline-none placeholder:text-white/25 focus:border-white/20`}
                    />
                    <select
                      value={displayProfile.sex}
                      onChange={(e) => patchDraft({ sex: e.target.value })}
                      className={`${robotoMono.className} rounded-md border border-white/10 bg-[#141414] px-2 py-1 text-sm text-white/70 outline-none focus:border-white/20`}
                    >
                      <option value="">—</option>
                      <option value="Female">F</option>
                      <option value="Male">M</option>
                      <option value="Non-binary">N</option>
                      <option value="Other">O</option>
                    </select>
                  </div>
                  <LocationSearch
                    location={displayProfile.location}
                    countryCode={displayProfile.locationCountryCode}
                    align="right"
                    onChange={({ location, countryCode }) =>
                      patchDraft({ location, locationCountryCode: countryCode })
                    }
                  />
                </div>
              ) : (
                <>
                  <p className={`${robotoMono.className} text-sm text-white/55`}>
                    {formatAgeSex(displayProfile.age, displayProfile.sex) || "—"}
                  </p>
                  <LocationDisplay
                    location={displayProfile.location}
                    countryCode={displayProfile.locationCountryCode}
                    align="right"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {isDirty && (
          <p className={`${dmSans.className} mt-4 text-xs text-[#FF6B55]`}>
            Unsaved changes — click Save before leaving this page.
          </p>
        )}

        <div className="mt-4 space-y-3 pb-8">
          <ProfileInlineField
            value={displayProfile.bio}
            placeholder="Add a short bio"
            editable={isOwner && isEditing}
            variant="subtitle"
            onChange={(bio) => patchDraft({ bio })}
          />

          {!isEditing && !displayProfile.bio && (
            <p className={`${dmSans.className} text-sm text-white/30`}>No bio yet.</p>
          )}
        </div>

        <div className="space-y-4">
          {(isEditing || hasAnyLinks(displayProfile.links)) && (
            <ProfileSection title="Links" transparent>
              <ProfileLinksSection
                links={displayProfile.links}
                editable={isOwner && isEditing}
                onChange={(links) => patchDraft({ links })}
              />
            </ProfileSection>
          )}

          <ProfileSection title="Interests" transparent>
            <ProfileTagSection
              tags={displayProfile.interests}
              placeholder="Add an interest and press Enter"
              editable={isOwner && isEditing}
              onChange={(interests) => patchDraft({ interests })}
            />
          </ProfileSection>

          <ProfileSection title="Skills" transparent>
            <ProfileTagSection
              tags={displayProfile.skills}
              placeholder="Add a skill and press Enter"
              editable={isOwner && isEditing}
              onChange={(skills) => patchDraft({ skills })}
            />
          </ProfileSection>

          <ProfileSection title="Activity">
            <ProfileActivitySection userId={currentUser?._id} />
          </ProfileSection>
        </div>
      </div>
    </div>
  );
}
