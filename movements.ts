import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";

// Einlagerung
export const inbound = mutation({
  args: {
    materialId: v.id("materials"),
    locationId: v.id("locations"),
    quantity: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Sie müssen angemeldet sein");
    }

    if (args.quantity <= 0) {
      throw new ConvexError("Menge muss größer als 0 sein");
    }

    // Hole aktuellen appUser
    const appUser = await ctx.db
      .query("appUsers")
      .filter((q) => q.eq(q.field("createdBy"), userId))
      .first();

    // Bewegung protokollieren
    const movementId = await ctx.db.insert("movements", {
      type: "einlagerung",
      materialId: args.materialId,
      toLocationId: args.locationId,
      quantity: args.quantity,
      reason: args.reason,
      performedBy: appUser?._id,
      timestamp: Date.now(),
    });

    // Bestand aktualisieren
    await ctx.runMutation(internal.inventory.updateStock, {
      materialId: args.materialId,
      locationId: args.locationId,
      quantityChange: args.quantity,
    });

    return movementId;
  },
});

// Auslagerung
export const outbound = mutation({
  args: {
    materialId: v.id("materials"),
    locationId: v.id("locations"),
    quantity: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Sie müssen angemeldet sein");
    }

    if (args.quantity <= 0) {
      throw new ConvexError("Menge muss größer als 0 sein");
    }

    // Hole aktuellen appUser
    const appUser = await ctx.db
      .query("appUsers")
      .filter((q) => q.eq(q.field("createdBy"), userId))
      .first();

    // Bewegung protokollieren
    const movementId = await ctx.db.insert("movements", {
      type: "auslagerung",
      materialId: args.materialId,
      fromLocationId: args.locationId,
      quantity: args.quantity,
      reason: args.reason,
      performedBy: appUser?._id,
      timestamp: Date.now(),
    });

    // Bestand aktualisieren
    await ctx.runMutation(internal.inventory.updateStock, {
      materialId: args.materialId,
      locationId: args.locationId,
      quantityChange: -args.quantity,
    });

    return movementId;
  },
});

// Umlagerung
export const transfer = mutation({
  args: {
    materialId: v.id("materials"),
    fromLocationId: v.id("locations"),
    toLocationId: v.id("locations"),
    quantity: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Sie müssen angemeldet sein");
    }

    if (args.quantity <= 0) {
      throw new ConvexError("Menge muss größer als 0 sein");
    }

    if (args.fromLocationId === args.toLocationId) {
      throw new ConvexError("Quell- und Ziellagerort müssen unterschiedlich sein");
    }

    // Hole aktuellen appUser
    const appUser = await ctx.db
      .query("appUsers")
      .filter((q) => q.eq(q.field("createdBy"), userId))
      .first();

    // Bewegung protokollieren
    const movementId = await ctx.db.insert("movements", {
      type: "umlagerung",
      materialId: args.materialId,
      fromLocationId: args.fromLocationId,
      toLocationId: args.toLocationId,
      quantity: args.quantity,
      reason: args.reason,
      performedBy: appUser?._id,
      timestamp: Date.now(),
    });

    // Bestand vom Quelllagerort abziehen
    await ctx.runMutation(internal.inventory.updateStock, {
      materialId: args.materialId,
      locationId: args.fromLocationId,
      quantityChange: -args.quantity,
    });

    // Bestand zum Ziellagerort hinzufügen
    await ctx.runMutation(internal.inventory.updateStock, {
      materialId: args.materialId,
      locationId: args.toLocationId,
      quantityChange: args.quantity,
    });

    return movementId;
  },
});

// Bestandskorrektur
export const correction = mutation({
  args: {
    materialId: v.id("materials"),
    locationId: v.id("locations"),
    newQuantity: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Sie müssen angemeldet sein");
    }

    if (args.newQuantity < 0) {
      throw new ConvexError("Menge kann nicht negativ sein");
    }

    // Hole aktuellen appUser
    const appUser = await ctx.db
      .query("appUsers")
      .filter((q) => q.eq(q.field("createdBy"), userId))
      .first();

    // Aktuellen Bestand ermitteln
    const existing = await ctx.db
      .query("inventory")
      .withIndex("by_material_and_location", (q) =>
        q.eq("materialId", args.materialId).eq("locationId", args.locationId)
      )
      .first();

    const currentQuantity = existing ? existing.quantity : 0;
    const difference = args.newQuantity - currentQuantity;

    // Bewegung protokollieren
    const movementId = await ctx.db.insert("movements", {
      type: "korrektur",
      materialId: args.materialId,
      toLocationId: args.locationId,
      quantity: Math.abs(difference),
      reason: args.reason,
      performedBy: appUser?._id,
      timestamp: Date.now(),
    });

    // Bestand aktualisieren
    await ctx.runMutation(internal.inventory.updateStock, {
      materialId: args.materialId,
      locationId: args.locationId,
      quantityChange: difference,
    });

    return movementId;
  },
});

// Bewegungshistorie abrufen (global)
export const list = query({
  args: {
    limit: v.optional(v.number()),
    materialId: v.optional(v.id("materials")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let query = ctx.db
      .query("movements")
      .order("desc");

    if (args.materialId) {
      const allMovements = await query.collect();
      const filtered = allMovements.filter((m) => m.materialId === args.materialId);
      const movements = args.limit ? filtered.slice(0, args.limit) : filtered;

      // Details hinzufügen
      const withDetails = await Promise.all(
        movements.map(async (movement) => {
          const material = await ctx.db.get(movement.materialId);
          const fromLocation = movement.fromLocationId
            ? await ctx.db.get(movement.fromLocationId)
            : null;
          const toLocation = movement.toLocationId
            ? await ctx.db.get(movement.toLocationId)
            : null;

          return {
            ...movement,
            material,
            fromLocation,
            toLocation,
          };
        })
      );

      return withDetails;
    }

    const movements = args.limit ? await query.take(args.limit) : await query.collect();

    // Details hinzufügen
    const withDetails = await Promise.all(
      movements.map(async (movement) => {
        const material = await ctx.db.get(movement.materialId);
        const fromLocation = movement.fromLocationId
          ? await ctx.db.get(movement.fromLocationId)
          : null;
        const toLocation = movement.toLocationId ? await ctx.db.get(movement.toLocationId) : null;

        return {
          ...movement,
          material,
          fromLocation,
          toLocation,
        };
      })
    );

    return withDetails;
  },
});
