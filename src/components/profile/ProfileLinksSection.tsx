"use client";

import type { IconType } from "react-icons";
import { FaGithub, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { HiX } from "react-icons/hi";
import { HiGlobeAlt, HiLink, HiPlus } from "react-icons/hi2";
import { dmSans, robotoMono } from "@/app/fonts";
import {
  PROFILE_LINK_PLATFORMS,
  type OtherLink,
  type ProfileLinkPlatformKey,
  type ProfileLinksDraft,
  formatLinkDisplay,
  getLinkHref,
  hasAnyLinks,
} from "@/lib/profileLinks";

interface ProfileLinksSectionProps {
  links: ProfileLinksDraft;
  editable: boolean;
  onChange?: (links: ProfileLinksDraft) => void;
}

const PLATFORM_ICONS: Record<ProfileLinkPlatformKey, IconType> = {
  website: HiGlobeAlt,
  github: FaGithub,
  instagram: FaInstagram,
  twitter: FaXTwitter,
};

function patchPlatform(
  links: ProfileLinksDraft,
  key: ProfileLinkPlatformKey,
  value: string,
): ProfileLinksDraft {
  return { ...links, [key]: value };
}

function patchOtherLink(
  links: ProfileLinksDraft,
  id: string,
  patch: Partial<Pick<OtherLink, "label" | "url">>,
): ProfileLinksDraft {
  return {
    ...links,
    otherLinks: links.otherLinks.map((link) =>
      link.id === id ? { ...link, ...patch } : link,
    ),
  };
}

function addOtherLink(links: ProfileLinksDraft): ProfileLinksDraft {
  return {
    ...links,
    otherLinks: [
      ...links.otherLinks,
      { id: crypto.randomUUID(), label: "", url: "" },
    ],
  };
}

function removeOtherLink(links: ProfileLinksDraft, id: string): ProfileLinksDraft {
  return {
    ...links,
    otherLinks: links.otherLinks.filter((link) => link.id !== id),
  };
}

function LinkRow({
  icon: Icon,
  label,
  url,
  platform,
}: {
  icon: IconType;
  label: string;
  url: string;
  platform?: ProfileLinkPlatformKey;
}) {
  const href = getLinkHref(url, platform);
  const display = formatLinkDisplay(href || url);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-lg px-1 py-1.5 transition-colors hover:bg-white/[0.03]"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#141414] text-white/55 transition-colors group-hover:text-white/80">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span
          className={`${robotoMono.className} block text-[10px] uppercase tracking-wide text-white/35`}
        >
          {label}
        </span>
        <span className={`${dmSans.className} block truncate text-sm text-white/75`}>
          {display}
        </span>
      </span>
    </a>
  );
}

function LinkField({
  icon: Icon,
  label,
  value,
  placeholder,
  onChange,
}: {
  icon: IconType;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#141414] text-white/45">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`${robotoMono.className} mb-1 block text-[10px] uppercase tracking-wide text-white/35`}
        >
          {label}
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${dmSans.className} w-full rounded-lg border border-white/10 bg-[#141414] px-3 py-2 text-sm text-white/70 outline-none placeholder:text-white/25 focus:border-white/20`}
        />
      </span>
    </label>
  );
}

export default function ProfileLinksSection({
  links,
  editable,
  onChange,
}: ProfileLinksSectionProps) {
  if (!editable && !hasAnyLinks(links)) {
    return null;
  }

  if (!editable) {
    return (
      <div className="space-y-1">
        {PROFILE_LINK_PLATFORMS.map(({ key, label }) => {
          const value = links[key];
          if (!value.trim()) return null;

          return (
            <LinkRow
              key={key}
              icon={PLATFORM_ICONS[key]}
              label={label}
              url={value}
              platform={key}
            />
          );
        })}

        {links.otherLinks.map((link) => {
          if (!link.label.trim() || !link.url.trim()) return null;

          return (
            <LinkRow
              key={link.id}
              icon={HiLink}
              label={link.label}
              url={link.url}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {PROFILE_LINK_PLATFORMS.map(({ key, label, placeholder }) => (
          <LinkField
            key={key}
            icon={PLATFORM_ICONS[key]}
            label={label}
            value={links[key]}
            placeholder={placeholder}
            onChange={(value) => onChange?.(patchPlatform(links, key, value))}
          />
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p
            className={`${robotoMono.className} text-[10px] uppercase tracking-wide text-white/35`}
          >
            Other links
          </p>
          <button
            type="button"
            onClick={() => onChange?.(addOtherLink(links))}
            className={`${dmSans.className} inline-flex cursor-pointer items-center gap-1 rounded-md border border-dashed border-white/10 px-2 py-1 text-xs text-white/55 transition-colors hover:border-white/20 hover:text-white/75`}
          >
            <HiPlus className="size-3.5" />
            Add link
          </button>
        </div>

        {links.otherLinks.length === 0 ? (
          <p className={`${dmSans.className} text-sm text-white/30`}>
            Add LinkedIn, Discord, or any other link.
          </p>
        ) : (
          <div className="space-y-2">
            {links.otherLinks.map((link) => (
              <div key={link.id} className="flex items-start gap-2">
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) =>
                    onChange?.(patchOtherLink(links, link.id, { label: e.target.value }))
                  }
                  placeholder="Label"
                  className={`${dmSans.className} w-28 shrink-0 rounded-lg border border-white/10 bg-[#141414] px-3 py-2 text-sm text-white/70 outline-none placeholder:text-white/25 focus:border-white/20`}
                />
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) =>
                    onChange?.(patchOtherLink(links, link.id, { url: e.target.value }))
                  }
                  placeholder="https://..."
                  className={`${dmSans.className} min-w-0 flex-1 rounded-lg border border-white/10 bg-[#141414] px-3 py-2 text-sm text-white/70 outline-none placeholder:text-white/25 focus:border-white/20`}
                />
                <button
                  type="button"
                  onClick={() => onChange?.(removeOtherLink(links, link.id))}
                  className="mt-2 cursor-pointer rounded-md p-1 text-white/35 transition-colors hover:text-white"
                  aria-label={`Remove ${link.label || "link"}`}
                >
                  <HiX className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
