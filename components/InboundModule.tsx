import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { ArrowDownToLine } from "lucide-react";
import { toast } from "sonner";

export default function InboundModule() {
  const createMaterial = useMutation(api.materials.createDirect);

  const [materialName, setMaterialName] = useState("");
  const [articleNumber, setArticleNumber] = useState("");
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("Stück");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!materialName || !articleNumber || !condition || !location || !quantity) {
      toast.error("Bitte alle Pflichtfelder ausfüllen");
      return;
    }

    try {
      await createMaterial({
        name: materialName,
        materialNumber: articleNumber,
        condition,
        location,
        quantity: parseFloat(quantity),
        unit,
        description: description || undefined,
      });
      
      toast.success("Material erfolgreich eingelagert");
      
      // Formular zurücksetzen
      setMaterialName("");
      setArticleNumber("");
      setCondition("");
      setLocation("");
      setQuantity("");
      setUnit("Stück");
      setDescription("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ein Fehler ist aufgetreten";
      toast.error(message);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-xl"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <ArrowDownToLine className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Einlagerung</h2>
        </div>
        <p className="text-green-100">Material in das Lager aufnehmen</p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Materialname */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Materialname *
            </label>
            <input
              type="text"
              required
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              placeholder="z.B. Schrauben M8"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

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
              placeholder="z.B. ART-12345"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Zustand */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Zustand *
            </label>
            <input
              type="text"
              required
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="z.B. Neu, Gebraucht, Beschädigt"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Lagerbereich */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Lagerbereich *
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="z.B. A-01-02 oder Regal 5"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Menge und Einheit */}
          <div className="grid grid-cols-2 gap-4">
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
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Einheit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="Stück">Stück</option>
                <option value="kg">kg</option>
                <option value="Liter">Liter</option>
                <option value="Meter">Meter</option>
                <option value="Karton">Karton</option>
                <option value="Palette">Palette</option>
              </select>
            </div>
          </div>

          {/* Bemerkung */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Bemerkung
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Optional: Zusätzliche Informationen"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            Einlagern
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
