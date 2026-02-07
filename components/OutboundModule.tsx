import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { ArrowUpFromLine } from "lucide-react";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

export default function OutboundModule() {
  const materials = useQuery(api.materials.list);
  const updateStock = useMutation(api.materials.updateStock);

  const [articleNumber, setArticleNumber] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!articleNumber || !quantity) {
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

      const qty = parseFloat(quantity);
      if (material.currentStock < qty) {
        throw new Error("Nicht genügend Bestand vorhanden");
      }

      await updateStock({
        id: material._id,
        quantity: -qty,
      });

      toast.success("Auslagerung erfolgreich");
      setArticleNumber("");
      setQuantity("");
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
        className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white shadow-xl"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <ArrowUpFromLine className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Auslagerung</h2>
        </div>
        <p className="text-red-100">Material aus dem Lager entnehmen</p>
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
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
            {foundMaterial && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-900">
                  <div className="font-medium">{foundMaterial.name}</div>
                  <div className="text-blue-700">
                    Verfügbar: {foundMaterial.currentStock} {foundMaterial.unit}
                  </div>
                  <div className="text-blue-700">
                    Lagerort: {foundMaterial.location}
                  </div>
                  <div className="text-blue-700">
                    Zustand: {foundMaterial.condition}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Menge */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Menge *
            </label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-lg font-semibold"
            />
            {foundMaterial && quantity && (
              <div className="mt-2 text-sm text-slate-600">
                Verbleibender Bestand:{" "}
                <span
                  className={`font-semibold ${
                    foundMaterial.currentStock - parseFloat(quantity) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {foundMaterial.currentStock - parseFloat(quantity)}{" "}
                  {foundMaterial.unit}
                </span>
              </div>
            )}
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
              placeholder="Optional: Verwendungszweck, Projekt, etc."
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            Auslagern
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
