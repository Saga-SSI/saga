import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function normalizeProfileLink(
  raw: string,
  platform?: "github" | "instagram" | "twitter" | "other",
) {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

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

export const getOrCreate = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatarUrl: v.string(),
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      return existingUser._id;
    }

    let finalUsername = args.username?.trim().toLowerCase() || undefined;
    if (finalUsername) {
      const existingUsername = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", finalUsername))
        .unique();

      if (existingUsername) {
        finalUsername = undefined;
      }
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      avatarUrl: args.avatarUrl,
      username: finalUsername,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const getPublicById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    let avatarUrl = user.avatarUrl;
    if (user.avatarStorageId) {
      const storageUrl = await ctx.storage.getUrl(user.avatarStorageId);
      if (storageUrl) avatarUrl = storageUrl;
    }

    return {
      _id: user._id,
      clerkId: user.clerkId,
      name: user.name,
      username: user.username,
      avatarUrl,
      bannerColor: user.bannerColor,
      bio: user.bio,
      location: user.location,
      locationCountryCode: user.locationCountryCode,
      website: user.website,
      socialLinks: user.socialLinks,
      interests: user.interests ?? [],
      skills: user.skills ?? [],
      age: user.age,
      sex: user.sex,
    };
  },
});

export const listForAssignment = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const users = await ctx.db.query("users").collect();

    return users
      .map((user) => ({
        _id: user._id,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const listForTribes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const users = await ctx.db.query("users").collect();

    const profiles = await Promise.all(
      users.map(async (user) => {
        let avatarUrl = user.avatarUrl;
        if (user.avatarStorageId) {
          const storageUrl = await ctx.storage.getUrl(user.avatarStorageId);
          if (storageUrl) avatarUrl = storageUrl;
        }

        return {
          _id: user._id,
          clerkId: user.clerkId,
          name: user.name,
          username: user.username,
          avatarUrl,
          bannerColor: user.bannerColor,
          bio: user.bio,
          skills: user.skills ?? [],
          interests: user.interests ?? [],
          location: user.location,
          locationCountryCode: user.locationCountryCode,
        };
      }),
    );

    return profiles.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    locationCountryCode: v.optional(v.string()),
    website: v.optional(v.string()),
    buttonColor: v.optional(v.string()),
    bannerColor: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    skills: v.optional(v.array(v.string())),
    age: v.optional(v.number()),
    sex: v.optional(v.string()),
    socialLinks: v.optional(v.record(v.string(), v.string())),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    let normalizedUsername: string | undefined;
    if (args.username !== undefined && args.username.trim() !== "") {
      normalizedUsername = args.username.trim().toLowerCase();
      const currentUsernameLower = (user.username ?? "").toLowerCase();

      if (normalizedUsername !== currentUsernameLower) {
        const existingUser = await ctx.db
          .query("users")
          .withIndex("by_username", (q) => q.eq("username", normalizedUsername))
          .unique();

        if (existingUser && existingUser._id !== user._id) {
          throw new Error("Username already taken");
        }
      }
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      updates.name = args.name;
    }

    if (args.bio !== undefined) {
      updates.bio = args.bio;
    }

    if (args.location !== undefined) {
      updates.location = args.location.trim() || undefined;
    }

    if (args.locationCountryCode !== undefined) {
      const code = args.locationCountryCode.trim().toUpperCase();
      updates.locationCountryCode =
        code.length === 2 ? code : undefined;
    }

    if (args.username !== undefined) {
      updates.username = normalizedUsername ?? (args.username.trim() || undefined);
    }

    if (args.website !== undefined) {
      updates.website = normalizeProfileLink(args.website);
    }

    if (args.socialLinks !== undefined) {
      const normalizedLinks: Record<string, string> = {};

      for (const [key, value] of Object.entries(args.socialLinks)) {
        const trimmed = value.trim();
        if (!trimmed) continue;

        if (key === "github" || key === "instagram" || key === "twitter") {
          const normalized = normalizeProfileLink(trimmed, key);
          if (normalized) normalizedLinks[key] = normalized;
          continue;
        }

        if (key.startsWith("other:")) {
          const normalized = normalizeProfileLink(trimmed, "other");
          if (normalized) normalizedLinks[key] = normalized;
        }
      }

      updates.socialLinks =
        Object.keys(normalizedLinks).length > 0 ? normalizedLinks : undefined;
    }

    if (args.buttonColor !== undefined) {
      const color = args.buttonColor.trim();
      if (color === "" || /^#[0-9A-Fa-f]{6}$/.test(color)) {
        updates.buttonColor = color || undefined;
      } else {
        throw new Error("Invalid color format. Use hex format (e.g., #FF1A00)");
      }
    }

    if (args.bannerColor !== undefined) {
      const color = args.bannerColor.trim();
      if (color === "" || /^#[0-9A-Fa-f]{6}$/.test(color)) {
        updates.bannerColor = color || undefined;
      } else {
        throw new Error("Invalid banner color format. Use hex format (e.g., #FF1A00)");
      }
    }

    if (args.interests !== undefined) {
      updates.interests = args.interests
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 24);
    }

    if (args.skills !== undefined) {
      updates.skills = args.skills
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 24);
    }

    if (args.age !== undefined) {
      updates.age = args.age > 0 && args.age <= 120 ? Math.round(args.age) : undefined;
    }

    if (args.sex !== undefined) {
      updates.sex = args.sex.trim() || undefined;
    }

    if (args.storageId !== undefined) {
      const imageUrl = await ctx.storage.getUrl(args.storageId);
      updates.avatarUrl = imageUrl || "";
      updates.avatarStorageId = args.storageId;
    }

    await ctx.db.patch(user._id, updates);

    return { success: true };
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.storage.generateUploadUrl();
  },
});

export const updateProfilePicture = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const imageUrl = await ctx.storage.getUrl(args.storageId);

    await ctx.db.patch(user._id, {
      avatarUrl: imageUrl || "",
      avatarStorageId: args.storageId,
      updatedAt: Date.now(),
    });

    return { success: true, imageUrl };
  },
});

export const generateImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
