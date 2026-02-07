import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// Initialisierung: Ersten Admin "Yamen" erstellen
export const initializeFirstAdmin = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Prüfen ob bereits Benutzer existieren
    const existingUsers = await ctx.db.query("appUsers").first();
    
    if (!existingUsers) {
      // Ersten Admin "Yamen" erstellen
      await ctx.db.insert("appUsers", {
        username: "Yamen",
        role: "admin",
        isActive: true,
        createdAt: Date.now(),
      });
      console.log("✅ Erster Administrator 'Yamen' wurde erstellt");
    }
  },
});

// Prüfen ob Benutzer existiert (für Login-Validierung)
export const checkUserExists = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const appUser = await ctx.db
      .query("appUsers")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!appUser) {
      return { exists: false, message: "Benutzername nicht gefunden" };
    }

    if (!appUser.isActive) {
      return { exists: false, message: "Ihr Konto ist deaktiviert" };
    }

    return { exists: true, user: appUser };
  },
});

// Session erstellen nach erfolgreichem Login
export const createSession = mutation({
  args: { 
    username: v.string(),
    authUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const appUser = await ctx.db
      .query("appUsers")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!appUser) {
      throw new ConvexError("Benutzername nicht gefunden");
    }

    if (!appUser.isActive) {
      throw new ConvexError("Ihr Konto ist deaktiviert");
    }

    // Verknüpfung mit Auth-User speichern
    await ctx.db.patch(appUser._id, {
      createdBy: args.authUserId,
    });

    return appUser;
  },
});

// Alle Benutzer auflisten (für alle angemeldeten Benutzer)
export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const currentUser = await ctx.db
      .query("appUsers")
      .filter((q) => q.eq(q.field("createdBy"), userId))
      .first();

    if (!currentUser) {
      // Benutzer noch nicht verknüpft - leere Liste zurückgeben
      return [];
    }

    return await ctx.db.query("appUsers").order("desc").collect();
  },
});

// Neuen Benutzer anlegen (für alle angemeldeten Benutzer)
export const createUser = mutation({
  args: {
    username: v.string(),
    role: v.union(v.literal("admin"), v.literal("mitarbeiter")),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Sie müssen angemeldet sein");
    }

    // Prüfen ob Benutzername bereits existiert
    const existing = await ctx.db
      .query("appUsers")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (existing) {
      throw new ConvexError("Benutzername bereits vergeben");
    }

    const newUserId = await ctx.db.insert("appUsers", {
      username: args.username,
      role: args.role,
      isActive: args.isActive,
      createdAt: Date.now(),
      createdBy: userId,
    });

    return newUserId;
  },
});

// Benutzer bearbeiten (für alle angemeldeten Benutzer)
export const updateUser = mutation({
  args: {
    userId: v.id("appUsers"),
    username: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("mitarbeiter"))),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Sie müssen angemeldet sein");
    }

    const updates: any = {};
    if (args.username !== undefined) updates.username = args.username;
    if (args.role !== undefined) updates.role = args.role;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.userId, updates);
    return true;
  },
});

// Benutzer löschen (für alle angemeldeten Benutzer)
export const deleteUser = mutation({
  args: { userId: v.id("appUsers") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Sie müssen angemeldet sein");
    }

    await ctx.db.delete(args.userId);
    return true;
  },
});
