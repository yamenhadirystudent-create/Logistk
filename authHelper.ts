import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Aktuellen App-Benutzer mit Rolle abrufen (ohne Mutation)
export const getCurrentAppUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    
    // Suche nach appUser der mit diesem Auth-User verknüpft ist
    const appUser = await ctx.db
      .query("appUsers")
      .filter((q) => q.eq(q.field("createdBy"), userId))
      .first();
    
    return appUser;
  },
});

// Verknüpfung zwischen Auth-User und App-User herstellen
export const linkAuthUser = mutation({
  args: {
    appUserId: v.id("appUsers"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Sie müssen angemeldet sein");
    }

    await ctx.db.patch(args.appUserId, {
      createdBy: userId,
    });

    return true;
  },
});
