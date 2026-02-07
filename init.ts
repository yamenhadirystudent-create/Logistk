import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// Automatische Initialisierung beim ersten Start
export const initialize = mutation({
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
      return { success: true, message: "Admin Yamen erstellt" };
    }
    
    return { success: false, message: "Benutzer existieren bereits" };
  },
});

// Bestände synchronisieren
export const syncStocks = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Sie müssen angemeldet sein");
    }

    const materials = await ctx.db.query("materials").collect();
    
    for (const material of materials) {
      const items = await ctx.db
        .query("inventory")
        .withIndex("by_material", (q) => q.eq("materialId", material._id))
        .collect();
      
      const realStock = items.reduce((sum, item) => sum + item.quantity, 0);
      
      await ctx.db.patch(material._id, { currentStock: realStock });
    }

    return { synced: materials.length };
  },
});
