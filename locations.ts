import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// Lagerort erstellen
export const create = mutation({
  args: {
    locationCode: v.string(),
    name: v.string(),
    type: v.string(),
    capacity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Sie müssen angemeldet sein");
    }

    // Hole aktuellen appUser
    const appUser = await ctx.db
      .query("appUsers")
      .filter((q) => q.eq(q.field("createdBy"), userId))
      .first();

    // Prüfen ob Lagerortcode bereits existiert
    const existing = await ctx.db
      .query("locations")
      .withIndex("by_location_code", (q) => q.eq("locationCode", args.locationCode))
      .first();

    if (existing) {
      throw new ConvexError("Dieser Lagerortcode existiert bereits");
    }

    const locationId = await ctx.db.insert("locations", {
      ...args,
      createdBy: appUser?._id,
    });

    return locationId;
  },
});

// Alle Lagerorte auflisten (global)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const locations = await ctx.db
      .query("locations")
      .order("desc")
      .collect();

    return locations;
  },
});

// Lagerort nach Code suchen
export const getByCode = query({
  args: { locationCode: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const location = await ctx.db
      .query("locations")
      .withIndex("by_location_code", (q) => q.eq("locationCode", args.locationCode))
      .first();

    return location;
  },
});

// Lagerort aktualisieren
export const update = mutation({
  args: {
    id: v.id("locations"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    capacity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Sie müssen angemeldet sein");
    }

    const { id, ...updates } = args;
    const location = await ctx.db.get(id);

    if (!location) {
      throw new ConvexError("Lagerort nicht gefunden");
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

// Lagerort löschen
export const remove = mutation({
  args: { id: v.id("locations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Sie müssen angemeldet sein");
    }

    const location = await ctx.db.get(args.id);
    if (!location) {
      throw new ConvexError("Lagerort nicht gefunden");
    }

    // Prüfen ob noch Bestand am Lagerort
    const inventory = await ctx.db
      .query("inventory")
      .withIndex("by_location", (q) => q.eq("locationId", args.id))
      .first();

    if (inventory && inventory.quantity > 0) {
      throw new ConvexError("Lagerort kann nicht gelöscht werden - noch Bestand vorhanden");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
