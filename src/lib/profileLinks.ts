export type OtherLink = {
  id: string;
  label: string;
  url: string;
};

export type ProfileLinksDraft = {
  website: string;
  github: string;
  instagram: string;
  twitter: string;
  otherLinks: OtherLink[];
};

export const PROFILE_LINK_PLATFORMS = [
  { key: "website", label: "Website", placeholder: "yoursite.com" },
  { key: "github", label: "GitHub", placeholder: "github.com/username" },
  { key: "instagram", label: "Instagram", placeholder: "instagram.com/username" },
  { key: "twitter", label: "Twitter / X", placeholder: "x.com/username" },
] as const;

export type ProfileLinkPlatformKey = (typeof PROFILE_LINK_PLATFORMS)[number]["key"];

const OTHER_PREFIX = "other:";

export function buildLinksDraft(
  user:
    | {
        website?: string;
        socialLinks?: Record<string, string>;
      }
    | null
    | undefined,
): ProfileLinksDraft {
  const social = user?.socialLinks ?? {};

  return {
    website: user?.website ?? "",
    github: social.github ?? "",
    instagram: social.instagram ?? "",
    twitter: social.twitter ?? social.x ?? "",
    otherLinks: Object.entries(social)
      .filter(([key]) => key.startsWith(OTHER_PREFIX))
      .map(([key, url]) => ({
        id: key,
        label: key.slice(OTHER_PREFIX.length),
        url,
      })),
  };
}

export function serializeLinksDraft(draft: ProfileLinksDraft) {
  const socialLinks: Record<string, string> = {};

  if (draft.github.trim()) socialLinks.github = draft.github.trim();
  if (draft.instagram.trim()) socialLinks.instagram = draft.instagram.trim();
  if (draft.twitter.trim()) socialLinks.twitter = draft.twitter.trim();

  for (const other of draft.otherLinks) {
    const label = other.label.trim();
    const url = other.url.trim();
    if (label && url) {
      socialLinks[`${OTHER_PREFIX}${label}`] = url;
    }
  }

  return {
    website: draft.website.trim(),
    socialLinks,
  };
}

export function linksDraftEqual(a: ProfileLinksDraft, b: ProfileLinksDraft) {
  if (
    a.website !== b.website ||
    a.github !== b.github ||
    a.instagram !== b.instagram ||
    a.twitter !== b.twitter
  ) {
    return false;
  }

  if (a.otherLinks.length !== b.otherLinks.length) return false;

  return a.otherLinks.every((link, index) => {
    const other = b.otherLinks[index];
    return link.label === other.label && link.url === other.url;
  });
}

export function formatLinkDisplay(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function getLinkHref(url: string, platform?: ProfileLinkPlatformKey) {
  const trimmed = url.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const handle = trimmed.replace(/^@/, "");

  switch (platform) {
    case "github":
      return `https://github.com/${handle.replace(/^github\.com\//, "")}`;
    case "instagram":
      return `https://instagram.com/${handle.replace(/^instagram\.com\//, "")}`;
    case "twitter":
      return `https://x.com/${handle.replace(/^(twitter\.com|x\.com)\//, "")}`;
    default:
      return `https://${trimmed}`;
  }
}

export function hasAnyLinks(links: ProfileLinksDraft) {
  return (
    Boolean(links.website.trim()) ||
    Boolean(links.github.trim()) ||
    Boolean(links.instagram.trim()) ||
    Boolean(links.twitter.trim()) ||
    links.otherLinks.some((link) => link.label.trim() && link.url.trim())
  );
}
