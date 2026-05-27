import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

const statusValidator = v.union(
  v.literal("open"),
  v.literal("in_progress"),
  v.literal("done"),
);

async function getAuthenticatedUser(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) throw new Error("User not found");

  return user;
}

async function enrichIdea(
  ctx: QueryCtx,
  idea: Doc<"workIdeas">,
  currentUserId?: Id<"users">,
) {
  const author = await ctx.db.get(idea.authorId);
  const assignee = idea.assignedToId ? await ctx.db.get(idea.assignedToId) : null;

  let userVote: "up" | "down" | null = null;
  if (currentUserId) {
    const vote = await ctx.db
      .query("workVotes")
      .withIndex("by_idea_and_user", (q) =>
        q.eq("ideaId", idea._id).eq("userId", currentUserId),
      )
      .unique();
    if (vote) {
      userVote = vote.value ?? "up";
    }
  }

  return {
    ...idea,
    author: author
      ? { _id: author._id, name: author.name, username: author.username, avatarUrl: author.avatarUrl }
      : null,
    assignee: assignee
      ? {
          _id: assignee._id,
          name: assignee.name,
          username: assignee.username,
          avatarUrl: assignee.avatarUrl,
        }
      : null,
    userVote,
  };
}

export const list = query({
  args: {
    status: v.optional(statusValidator),
    sort: v.optional(v.union(v.literal("top"), v.literal("new"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    let currentUser: Doc<"users"> | null = null;

    if (identity) {
      currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();
    }

    let ideas = await ctx.db.query("workIdeas").collect();

    if (args.status) {
      ideas = ideas.filter((idea) => idea.status === args.status);
    }

    ideas.sort((a, b) => {
      if (args.sort === "new") {
        return b.createdAt - a.createdAt;
      }
      return b.voteCount - a.voteCount || b.createdAt - a.createdAt;
    });

    return Promise.all(
      ideas.map((idea) => enrichIdea(ctx, idea, currentUser?._id)),
    );
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const title = args.title.trim();
    const description = args.description.trim();

    if (!title) throw new Error("Title is required");
    if (title.length > 120) throw new Error("Title must be 120 characters or less");
    if (!description) throw new Error("Description is required");
    if (description.length > 2000) throw new Error("Description must be 2000 characters or less");

    const now = Date.now();

    return await ctx.db.insert("workIdeas", {
      title,
      description,
      authorId: user._id,
      status: "open",
      voteCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const vote = mutation({
  args: {
    ideaId: v.id("workIdeas"),
    direction: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new Error("Idea not found");

    const existingVote = await ctx.db
      .query("workVotes")
      .withIndex("by_idea_and_user", (q) =>
        q.eq("ideaId", args.ideaId).eq("userId", user._id),
      )
      .unique();

    const now = Date.now();

    if (existingVote) {
      const existingValue = existingVote.value ?? "up";

      if (existingValue === args.direction) {
        await ctx.db.delete(existingVote._id);
        await ctx.db.patch(args.ideaId, {
          voteCount: idea.voteCount + (existingValue === "up" ? -1 : 1),
          updatedAt: now,
        });
        return { userVote: null };
      }

      await ctx.db.patch(existingVote._id, { value: args.direction });
      await ctx.db.patch(args.ideaId, {
        voteCount: idea.voteCount + (args.direction === "up" ? 2 : -2),
        updatedAt: now,
      });
      return { userVote: args.direction };
    }

    await ctx.db.insert("workVotes", {
      ideaId: args.ideaId,
      userId: user._id,
      value: args.direction,
      createdAt: now,
    });
    await ctx.db.patch(args.ideaId, {
      voteCount: idea.voteCount + (args.direction === "up" ? 1 : -1),
      updatedAt: now,
    });
    return { userVote: args.direction };
  },
});

const STATUS_ORDER = ["open", "in_progress", "done"] as const;

function getStatusIndex(status: (typeof STATUS_ORDER)[number]) {
  return STATUS_ORDER.indexOf(status);
}

export const moveStatus = mutation({
  args: {
    ideaId: v.id("workIdeas"),
    direction: v.union(v.literal("prev"), v.literal("next")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new Error("Idea not found");

    const currentIndex = getStatusIndex(idea.status);
    const nextIndex =
      args.direction === "next" ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex < 0 || nextIndex >= STATUS_ORDER.length) {
      throw new Error("Cannot move task further in that direction");
    }

    const newStatus = STATUS_ORDER[nextIndex];
    const now = Date.now();
    const patch: {
      status: (typeof STATUS_ORDER)[number];
      updatedAt: number;
      assignedToId?: Id<"users">;
    } = {
      status: newStatus,
      updatedAt: now,
    };

    if (newStatus === "in_progress" && !idea.assignedToId) {
      patch.assignedToId = user._id;
    }

    if (newStatus === "open") {
      patch.assignedToId = undefined;
    }

    await ctx.db.patch(args.ideaId, patch);

    return { status: newStatus };
  },
});

export const assign = mutation({
  args: {
    ideaId: v.id("workIdeas"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new Error("Idea not found");

    const isAuthor = idea.authorId === user._id;
    const isAssignee = idea.assignedToId === user._id;
    const isSelfAssign = args.userId === user._id;

    if (args.userId) {
      const targetUser = await ctx.db.get(args.userId);
      if (!targetUser) throw new Error("User not found");

      if (!isSelfAssign && !isAuthor) {
        throw new Error("Only the author can assign tasks to others");
      }
    } else if (!isAuthor && !isAssignee) {
      throw new Error("Only the author or assignee can unassign this task");
    }

    const now = Date.now();
    const patch: {
      assignedToId?: Id<"users">;
      status?: (typeof STATUS_ORDER)[number];
      updatedAt: number;
    } = { updatedAt: now };

    if (args.userId) {
      patch.assignedToId = args.userId;
      if (idea.status === "open") {
        patch.status = "in_progress";
      }
    } else {
      patch.assignedToId = undefined;
      if (idea.status === "in_progress") {
        patch.status = "open";
      }
    }

    await ctx.db.patch(args.ideaId, patch);

    return { success: true };
  },
});

export const claim = mutation({
  args: { ideaId: v.id("workIdeas") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new Error("Idea not found");
    if (idea.status === "done") throw new Error("This idea is already done");
    if (idea.assignedToId && idea.assignedToId !== user._id) {
      throw new Error("Someone else is already working on this idea");
    }

    await ctx.db.patch(args.ideaId, {
      assignedToId: user._id,
      status: "in_progress",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const release = mutation({
  args: { ideaId: v.id("workIdeas") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new Error("Idea not found");
    if (idea.assignedToId !== user._id) {
      throw new Error("Only the assignee can release this idea");
    }

    await ctx.db.patch(args.ideaId, {
      assignedToId: undefined,
      status: "open",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const markDone = mutation({
  args: { ideaId: v.id("workIdeas") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new Error("Idea not found");

    const isAuthor = idea.authorId === user._id;
    const isAssignee = idea.assignedToId === user._id;

    if (!isAuthor && !isAssignee) {
      throw new Error("Only the author or assignee can mark this idea as done");
    }

    await ctx.db.patch(args.ideaId, {
      status: "done",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
