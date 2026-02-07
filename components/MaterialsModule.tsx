import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Package, Search } from "lucide-react";

type SearchType = "name" | "materialNumber" | "condition" | "location" | "description";

export default function MaterialsModule() {
  const allMaterials = useQuery(api.materials.list);
  const [searchType, setSearchType] = useState<SearchType>("name");
  const [searchValue, setSearchValue] = useState("");

  const searchResults = useQuery(
    api.materials.searchBy,
    searchValue ? { searchType, searchValue } : "skip"
  );

  const displayMaterials = searchValue ? searchResults : allMaterials;

  if (allMaterials === undefined) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Artikel</h2>
        </div>
        <p className="text-purple-100">Alle Artikel durchsuchen und verwalten</p>
      </motion.div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value as SearchType)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
        >
          <option value="name">Suchen mit: Materialname</option>
          <option value="materialNumber">Suchen mit: Artikelnummer</option>
          <option value="condition">Suchen mit: Zustand</option>
          <option value="location">Suchen mit: Lagerort</option>
          <option value="description">Suchen mit: Beschreibung</option>
        </select>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Suchbegriff eingeben..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {!displayMaterials || displayMaterials.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Keine Artikel gefunden
            </h3>
            <p className="text-slate-500">
              {searchValue
                ? "Passen Sie Ihre Suchkriterien an"
                : "Noch keine Artikel vorhanden"}
            </p>
          </div>
        ) : (
          displayMaterials.map((material, index) => (
            <motion.div
              key={material._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-lg">
                      {material.materialNumber}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg">
                      {material.condition}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2 text-xl">
                    {material.name}
                  </h3>
                  {material.description && (
                    <p className="text-sm text-slate-600 mb-3">
                      {material.description}
                    </p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500 text-xs mb-1">Lagerort</div>
                      <div className="font-semibold text-slate-900">
                        {material.location}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs mb-1">Bestand</div>
                      <div className="font-semibold text-green-600">
                        {material.currentStock} {material.unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs mb-1">Zustand</div>
                      <div className="font-medium text-slate-700">
                        {material.condition}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs mb-1">Artikelnummer</div>
                      <div className="font-medium text-slate-700">
                        {material.materialNumber}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
