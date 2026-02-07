import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

export default function TransferModule() {
  const materials = useQuery(api.materials.list);
  const updateMaterial = useMutation(api.materials.update);

  const [articleNumber, setArticleNumber] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!articleNumber || !fromLocation || !toLocation) {
      toast.error("Bitte alle Pflichtfelder ausfüllen");
      return;
    }

    try {
      // Artikel finden
      const material = materials?.find(
        (m) => m.materialNumber.toLowerCase() === articleNumber.toLowerCase()
      );

      if (!material) {
        throw new Error("Artikel nicht gefunden");
      }

      // Prüfen ob Quelllagerort stimmt
      if (material.location.toLowerCase() !== fromLocation.toLowerCase()) {
        throw new Error(
          `Artikel befindet sich nicht am angegebenen Quelllagerort. Aktueller Lagerort: ${material.location}`
        );
      }

      await updateMaterial({
        id: material._id,
        location: toLocation,
      });

      toast.success("Umlagerung erfolgreich");
      setArticleNumber("");
      setFromLocation("");
      setToLocation("");
      setReason("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ein Fehler ist aufgetreten";
      toast.error(message);
    }
  };

  if (materials === undefined) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const foundMaterial = materials.find(
    (m) => m.materialNumber.toLowerCase() === articleNumber.toLowerCase()
  );

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Umlagerung</h2>
        </div>
        <p className="text-blue-100">Material zwischen Lagerorten verschieben</p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Artikelnummer */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Artikelnummer *
            </label>
            <input
              type="text"
              required
              value={articleNumber}
              onChange={(e) => setArticleNumber(e.target.value)}
              placeholder="Artikelnummer eingeben"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            {foundMaterial && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-900">
                  <div className="font-medium">{foundMaterial.name}</div>
                  <div className="text-blue-700">
                    Aktueller Lagerort: {foundMaterial.location}
                  </div>
                  <div className="text-blue-700">
                    Bestand: {foundMaterial.currentStock} {foundMaterial.unit}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quelllagerort */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Quelllagerort *
            </label>
            <input
              type="text"
              required
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              placeholder="Aktueller Lagerort eingeben"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Ziellagerort */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ziellagerort *
            </label>
            <input
              type="text"
              required
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              placeholder="Neuer Lagerort eingeben"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Grund */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Grund / Bemerkung
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Optional: Grund für die Umlagerung"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            Umlagern
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
