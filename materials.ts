import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// Material direkt erstellen (für Einlagerung)
export const createDirect = mutation({
  args: {
    name: v.string(),
    materialNumber: v.string(),
    condition: v.string(),
    location: v.string(),
    quantity: v.number(),
    unit: v.string(),
    description: v.optional(v.string()),
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

    // Prüfen oder erstellen des Lagerorts
    let locationId;
    const existingLocation = await ctx.db
      .query("locations")
      .withIndex("by_location_code", (q) => q.eq("locationCode", args.location))
      .first();

    if (existingLocation) {
      locationId = existingLocation._id;
    } else {
      // Neuen Lagerort erstellen
      locationId = await ctx.db.insert("locations", {
        locationCode: args.location,
        name: args.location,
        type: "Standard",
        createdBy: appUser?._id,
      });
    }

    const materialId = await ctx.db.insert("materials", {
      name: args.name,
      materialNumber: args.materialNumber,
      condition: args.condition,
      location: args.location,
      description: args.description,
      unit: args.unit,
      category: "Standard",
      minStock: 0,
      currentStock: args.quantity,
      createdBy: appUser?._id,
    });

    // Bestandseintrag in inventory Tabelle erstellen
    await ctx.db.insert("inventory", {
      materialId: materialId,
      locationId: locationId,
      quantity: args.quantity,
      lastUpdated: Date.now(),
    });

    return materialId;
  },
});

// Material erstellen (Admin)
export const create = mutation({
  args: {
    materialNumber: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    unit: v.string(),
    category: v.string(),
    condition: v.string(),
    location: v.string(),
    minStock: v.number(),
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

    // Prüfen ob Materialnummer bereits existiert
    const existing = await ctx.db
      .query("materials")
      .withIndex("by_material_number", (q) => q.eq("materialNumber", args.materialNumber))
      .first();

    if (existing) {
      throw new ConvexError("Diese Materialnummer existiert bereits");
    }

    const materialId = await ctx.db.insert("materials", {
      ...args,
      currentStock: 0,
      createdBy: appUser?._id,
    });

    return materialId;
  },
});

// Alle Materialien auflisten (global für alle Benutzer)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const materials = await ctx.db
      .query("materials")
      .order("desc")
      .collect();

    return materials;
  },
});

// Material suchen mit verschiedenen Kriterien
export const searchBy = query({
  args: {
    searchType: v.union(
      v.literal("name"),
      v.literal("materialNumber"),
      v.literal("condition"),
      v.literal("location"),
      v.literal("description")
    ),
    searchValue: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const allMaterials = await ctx.db
      .query("materials")
      .collect();

    const searchLower = args.searchValue.toLowerCase();

    return allMaterials.filter((material) => {
      switch (args.searchType) {
        case "name":
          return material.name.toLowerCase().includes(searchLower);
        case "materialNumber":
          return material.materialNumber.toLowerCase().includes(searchLower);
        case "condition":
          return material.condition.toLowerCase().includes(searchLower);
        case "location":
          return material.location.toLowerCase().includes(searchLower);
        case "description":
          return material.description?.toLowerCase().includes(searchLower) || false;
        default:
          return false;
      }
    });
  },
});

// Material nach ID abrufen
export const getById = query({
  args: { id: v.id("materials") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const material = await ctx.db.get(args.id);
    return material;
  },
});

// Material aktualisieren
export const update = mutation({
  args: {
    id: v.id("materials"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    unit: v.optional(v.string()),
    category: v.optional(v.string()),
    condition: v.optional(v.string()),
    location: v.optional(v.string()),
    minStock: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Sie müssen angemeldet sein");
    }

    const { id, ...updates } = args;
    const material = await ctx.db.get(id);

    if (!material) {
      throw new ConvexError("Material nicht gefunden");
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

// Material löschen
export const remove = mutation({
  args: { id: v.id("materials") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Sie müssen angemeldet sein");
    }

    const material = await ctx.db.get(args.id);
    if (!material) {
      throw new ConvexError("Material nicht gefunden");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Bestand aktualisieren
export const updateStock = mutation({
  args: {
    id: v.id("materials"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Sie müssen angemeldet sein");
    }

    const material = await ctx.db.get(args.id);
    if (!material) {
      throw new ConvexError("Material nicht gefunden");
    }

    await ctx.db.patch(args.id, {
      currentStock: material.currentStock + args.quantity,
    });

    return args.id;
  },
});
