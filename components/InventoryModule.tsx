import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { ClipboardCheck, Search, Package, MapPin } from "lucide-react";

export default function InventoryModule() {
  const inventory = useQuery(api.inventory.listAll);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  if (inventory === undefined) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const categories = Array.from(new Set(inventory.map((item) => item.category)));

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.materialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-6 text-white shadow-xl"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Bestandsübersicht</h2>
        </div>
        <p className="text-slate-200">Aktuelle Bestände aller Materialien</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Material suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
        >
          <option value="all">Alle Kategorien</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 shadow-md border border-slate-200"
        >
          <div className="text-sm text-slate-600 mb-1">Materialien gesamt</div>
          <div className="text-2xl font-bold text-slate-900">
            {filteredInventory.length}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-xl p-4 shadow-md border border-slate-200"
        >
          <div className="text-sm text-slate-600 mb-1">Niedrige Bestände</div>
          <div className="text-2xl font-bold text-orange-600">
            {filteredInventory.filter((item) => item.totalQuantity < item.minStock).length}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 shadow-md border border-slate-200"
        >
          <div className="text-sm text-slate-600 mb-1">Ausreichend</div>
          <div className="text-2xl font-bold text-green-600">
            {
              filteredInventory.filter(
                (item) => item.totalQuantity >= item.minStock
              ).length
            }
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl p-4 shadow-md border border-slate-200"
        >
          <div className="text-sm text-slate-600 mb-1">Lagerorte</div>
          <div className="text-2xl font-bold text-slate-900">
            {filteredInventory.reduce((sum, item) => sum + item.locations, 0)}
          </div>
        </motion.div>
      </div>

      {/* Inventory List */}
      <div className="space-y-3">
        {filteredInventory.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Keine Materialien gefunden
            </h3>
            <p className="text-slate-500">
              Passen Sie Ihre Suchkriterien an
            </p>
          </div>
        ) : (
          filteredInventory.map((item, index) => {
            const stockPercentage = (item.totalQuantity / item.minStock) * 100;
            const isLowStock = item.totalQuantity < item.minStock;

            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`bg-white rounded-xl shadow-md border-2 p-4 hover:shadow-lg transition-shadow ${
                  isLowStock ? "border-orange-300" : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                        {item.materialNumber}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        {item.category}
                      </span>
                      {isLowStock && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                          Niedriger Bestand
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2 text-lg">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-slate-600 mb-3">
                        {item.description}
                      </p>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="text-slate-500 text-xs">Bestand</div>
                          <div
                            className={`font-semibold ${
                              isLowStock ? "text-orange-600" : "text-green-600"
                            }`}
                          >
                            {item.totalQuantity} {item.unit}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Mindestbestand</div>
                        <div className="font-medium text-slate-700">
                          {item.minStock} {item.unit}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="text-slate-500 text-xs">Lagerort</div>
                          <div className="font-medium text-slate-700">
                            {item.location || "Nicht zugewiesen"}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Status</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                isLowStock
                                  ? "bg-orange-500"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${Math.min(stockPercentage, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-600">
                            {Math.round(stockPercentage)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
