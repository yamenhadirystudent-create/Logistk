import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Export aller Bestände als CSV-Daten
export const exportInventory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const materials = await ctx.db
      .query("materials")
      .collect();

    const exportData = await Promise.all(
      materials.map(async (material) => {
        const inventoryItems = await ctx.db
          .query("inventory")
          .withIndex("by_material", (q) => q.eq("materialId", material._id))
          .collect();

        const totalQuantity = inventoryItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        const locations = await Promise.all(
          inventoryItems.map(async (item) => {
            const location = await ctx.db.get(item.locationId);
            return {
              locationCode: location?.locationCode || "",
              locationName: location?.name || "",
              quantity: item.quantity,
            };
          })
        );

        return {
          materialNumber: material.materialNumber,
          name: material.name,
          description: material.description || "",
          unit: material.unit,
          category: material.category,
          minStock: material.minStock,
          currentStock: totalQuantity,
          locations: locations,
        };
      })
    );

    return exportData;
  },
});

// Export aller Bewegungen als CSV-Daten
export const exportMovements = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const movements = await ctx.db
      .query("movements")
      .order("desc")
      .collect();

    const exportData = await Promise.all(
      movements.map(async (movement) => {
        const material = await ctx.db.get(movement.materialId);
        const fromLocation = movement.fromLocationId
          ? await ctx.db.get(movement.fromLocationId)
          : null;
        const toLocation = movement.toLocationId
          ? await ctx.db.get(movement.toLocationId)
          : null;
        const user = movement.performedBy 
          ? await ctx.db.get(movement.performedBy)
          : null;

        return {
          timestamp: new Date(movement.timestamp).toLocaleString("de-DE"),
          type: movement.type,
          materialNumber: material?.materialNumber || "",
          materialName: material?.name || "",
          fromLocation: fromLocation?.locationCode || "",
          toLocation: toLocation?.locationCode || "",
          quantity: movement.quantity,
          reason: movement.reason || "",
          performedBy: user?.username || "Unbekannt",
        };
      })
    );

    return exportData;
  },
});
