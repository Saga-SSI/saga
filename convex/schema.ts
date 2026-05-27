import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    username: v.optional(v.string()),
    avatarUrl: v.string(),
    avatarStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    bio: v.optional(v.string()),
    website: v.optional(v.string()),
    buttonColor: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    archetype: v.optional(v.string()),
    socialLinks: v.optional(v.record(v.string(), v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_username", ["username"]),

  workIdeas: defineTable({
    title: v.string(),
    description: v.string(),
    authorId: v.id("users"),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("done"),
    ),
    assignedToId: v.optional(v.id("users")),
    voteCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_created_at", ["createdAt"]),

  workVotes: defineTable({
    ideaId: v.id("workIdeas"),
    userId: v.id("users"),
    value: v.optional(v.union(v.literal("up"), v.literal("down"))),
    createdAt: v.number(),
  })
    .index("by_idea_and_user", ["ideaId", "userId"])
    .index("by_idea", ["ideaId"])
    .index("by_user", ["userId"]),
});
