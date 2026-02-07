import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Benutzerverwaltung mit Rollen
  appUsers: defineTable({
    username: v.string(),
    role: v.union(v.literal("admin"), v.literal("mitarbeiter")),
    isActive: v.boolean(),
    createdAt: v.number(),
    createdBy: v.optional(v.id("users")),
  })
    .index("by_username", ["username"])
    .index("by_role", ["role"]),

  // Materialstammdaten
  materials: defineTable({
    materialNumber: v.string(), // Artikelnummer
    name: v.string(), // Materialname
    description: v.optional(v.string()),
    unit: v.string(), // Stück, kg, Liter, etc.
    category: v.string(),
    condition: v.string(), // Zustand (Neu, Gebraucht, etc.)
    location: v.string(), // Lagerort als Text
    minStock: v.number(),
    currentStock: v.number(),
    createdBy: v.optional(v.id("appUsers")), // Wer hat es erstellt
  })
    .index("by_material_number", ["materialNumber"])
    .searchIndex("search_materials", {
      searchField: "name",
      filterFields: ["category"],
    }),

  // Lagerorte
  locations: defineTable({
    locationCode: v.string(), // z.B. "A-01-02" (Gang-Regal-Fach)
    name: v.string(),
    type: v.string(), // Hochregal, Bodenlager, Kommissionierung, etc.
    capacity: v.optional(v.number()),
    createdBy: v.optional(v.id("appUsers")),
  })
    .index("by_location_code", ["locationCode"]),

  // Bestandspositionen (welches Material wo liegt)
  inventory: defineTable({
    materialId: v.id("materials"),
    locationId: v.id("locations"),
    quantity: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_material", ["materialId"])
    .index("by_location", ["locationId"])
    .index("by_material_and_location", ["materialId", "locationId"]),

  // Materialbewegungen (Historie)
  movements: defineTable({
    type: v.union(
      v.literal("einlagerung"),
      v.literal("auslagerung"),
      v.literal("umlagerung"),
      v.literal("korrektur")
    ),
    materialId: v.id("materials"),
    fromLocationId: v.optional(v.id("locations")),
    toLocationId: v.optional(v.id("locations")),
    quantity: v.number(),
    reason: v.optional(v.string()),
    performedBy: v.optional(v.id("appUsers")),
    timestamp: v.number(),
  })
    .index("by_material", ["materialId"])
    .index("by_timestamp", ["timestamp"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
