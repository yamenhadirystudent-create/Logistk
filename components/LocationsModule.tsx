import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Warehouse } from "lucide-react";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

export default function LocationsModule() {
  const locations = useQuery(api.locations.list);
  const createLocation = useMutation(api.locations.create);
  const updateLocation = useMutation(api.locations.update);
  const removeLocation = useMutation(api.locations.remove);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<"locations"> | null>(null);

  const [formData, setFormData] = useState({
    locationCode: "",
    name: "",
    type: "Hochregal",
    capacity: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateLocation({
          id: editingId,
          name: formData.name,
          type: formData.type,
          capacity: formData.capacity || undefined,
        });
        toast.success("Lagerort aktualisiert");
      } else {
        await createLocation(formData);
        toast.success("Lagerort erstellt");
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        locationCode: "",
        name: "",
        type: "Hochregal",
        capacity: 0,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ein Fehler ist aufgetreten";
      toast.error(message);
    }
  };

  const handleEdit = (location: any) => {
    setEditingId(location._id);
    setFormData({
      locationCode: location.locationCode,
      name: location.name,
      type: location.type,
      capacity: location.capacity || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: Id<"locations">) => {
    if (confirm("Lagerort wirklich löschen?")) {
      try {
        await removeLocation({ id });
        toast.success("Lagerort gelöscht");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Ein Fehler ist aufgetreten";
        toast.error(message);
      }
    }
  };

  if (locations === undefined) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Lagerorte</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              locationCode: "",
              name: "",
              type: "Hochregal",
              capacity: 0,
            });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Neu</span>
        </motion.button>
      </div>

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">
              {editingId ? "Lagerort bearbeiten" : "Neuer Lagerort"}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Lagerortcode *
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingId}
                  placeholder="z.B. A-01-02"
                  value={formData.locationCode}
                  onChange={(e) =>
                    setFormData({ ...formData, locationCode: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Typ *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option>Hochregal</option>
                  <option>Bodenlager</option>
                  <option>Kommissionierung</option>
                  <option>Versand</option>
                  <option>Wareneingang</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kapazität
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
              >
                {editingId ? "Aktualisieren" : "Erstellen"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Locations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
            <Warehouse className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Keine Lagerorte vorhanden
            </h3>
            <p className="text-slate-500">
              Erstellen Sie Ihren ersten Lagerort
            </p>
          </div>
        ) : (
          locations.map((location, index) => (
            <motion.div
              key={location._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-md border border-slate-200 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Warehouse className="w-5 h-5 text-white" />
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(location)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(location._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                    {location.locationCode}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900">
                  {location.name}
                </h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{location.type}</span>
                  {location.capacity && location.capacity > 0 && (
                    <span className="text-slate-500">
                      Kap: {location.capacity}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
