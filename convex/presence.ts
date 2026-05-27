import { mutation, query } from "./_generated/server";
import { components } from "./_generated/api";
import { v } from "convex/values";
import { Presence } from "@convex-dev/presence";
export const presence = new Presence(components.presence);

const APP_ROOM_ID = "app";

export const heartbeat = mutation({
  args: {
    roomId: v.string(),
    userId: v.string(),
    sessionId: v.string(),
    interval: v.number(),
  },
  handler: async (ctx, { roomId, userId, sessionId, interval }) => {
    if (!roomId || !userId || roomId === "" || userId === "") {
      return { roomToken: "", sessionToken: "" };
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { roomToken: "", sessionToken: "" };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return { roomToken: "", sessionToken: "" };
    }

    if (user._id !== userId) {
      throw new Error("User ID mismatch");
    }

    if (roomId !== APP_ROOM_ID) {
      throw new Error("Invalid room");
    }

    return await presence.heartbeat(ctx, roomId, userId, sessionId, interval);
  },
});

export const list = query({
  args: {
    roomToken: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { roomToken, limit }) => {
    return await presence.list(ctx, roomToken, limit);
  },
});

export const isUserOnline = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const presenceList = await presence.listRoom(ctx, APP_ROOM_ID, false);
    const entry = presenceList.find(
      (p: { userId: string; online: boolean }) =>
        p.userId === args.userId && p.online,
    );
    return !!entry;
  },
});

/** Presence for all village members currently in the app room */
export const listVillagePresence = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await presence.listRoom(ctx, APP_ROOM_ID, false);
  },
});

export const disconnect = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    return await presence.disconnect(ctx, sessionToken);
  },
});
