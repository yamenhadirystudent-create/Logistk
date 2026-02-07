import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// Bestand für ein Material abrufen
export const getByMaterial = query({
  args: { materialId: v.id("materials") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const inventoryItems = await ctx.db
      .query("inventory")
      .withIndex("by_material", (q) => q.eq("materialId", args.materialId))
      .collect();

    // Lagerorte hinzufügen
    const withLocations = await Promise.all(
      inventoryItems.map(async (item) => {
        const location = await ctx.db.get(item.locationId);
        return {
          ...item,
          location,
        };
      })
    );

    return withLocations;
  },
});

// Bestand für einen Lagerort abrufen
export const getByLocation = query({
  args: { locationId: v.id("locations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const inventoryItems = await ctx.db
      .query("inventory")
      .withIndex("by_location", (q) => q.eq("locationId", args.locationId))
      .collect();

    // Materialien hinzufügen
    const withMaterials = await Promise.all(
      inventoryItems.map(async (item) => {
        const material = await ctx.db.get(item.materialId);
        return {
          ...item,
          material,
        };
      })
    );

    return withMaterials;
  },
});

// Gesamtbestand aller Materialien (global)
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const materials = await ctx.db
      .query("materials")
      .collect();

    const withInventory = await Promise.all(
      materials.map(async (material) => {
        const inventoryItems = await ctx.db
          .query("inventory")
          .withIndex("by_material", (q) => q.eq("materialId", material._id))
          .collect();

        return {
          ...material,
          totalQuantity: material.currentStock, // Verwende currentStock aus Material
          locations: inventoryItems.length,
        };
      })
    );

    // Nur Materialien mit Bestand > 0 zurückgeben
    return withInventory.filter(item => item.totalQuantity > 0);
  },
});

// Bestand aktualisieren (intern)
export const updateStock = internalMutation({
  args: {
    materialId: v.id("materials"),
    locationId: v.id("locations"),
    quantityChange: v.number(),
  },
  handler: async (ctx, args) => {
    // Bestandsposition finden oder erstellen
    const existing = await ctx.db
      .query("inventory")
      .withIndex("by_material_and_location", (q) =>
        q.eq("materialId", args.materialId).eq("locationId", args.locationId)
      )
      .first();

    if (existing) {
      const newQuantity = existing.quantity + args.quantityChange;
      if (newQuantity < 0) {
        throw new ConvexError("Bestand kann nicht negativ werden");
      }

      if (newQuantity === 0) {
        // Bestandsposition löschen wenn 0
        await ctx.db.delete(existing._id);
      } else {
        await ctx.db.patch(existing._id, {
          quantity: newQuantity,
          lastUpdated: Date.now(),
        });
      }
    } else {
      if (args.quantityChange < 0) {
        throw new ConvexError("Kein Bestand zum Auslagern vorhanden");
      }

      await ctx.db.insert("inventory", {
        materialId: args.materialId,
        locationId: args.locationId,
        quantity: args.quantityChange,
        lastUpdated: Date.now(),
      });
    }

    // Gesamtbestand im Material aktualisieren
    const material = await ctx.db.get(args.materialId);
    if (material) {
      const newStock = material.currentStock + args.quantityChange;
      
      // Hole den Lagerort-Namen
      const location = await ctx.db.get(args.locationId);
      const locationName = location ? location.name : "";
      
      // Aktualisiere das Material (auch wenn Bestand 0 ist - Material bleibt erhalten)
      await ctx.db.patch(args.materialId, {
        currentStock: Math.max(0, newStock), // Verhindere negative Werte
        location: locationName, // Aktualisiere den Lagerort
      });
    }

    return true;
  },
});
