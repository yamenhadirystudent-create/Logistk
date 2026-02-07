import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Users, Plus, Edit2, Trash2, Shield, User, Search } from "lucide-react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export default function UsersModule() {
  const users = useQuery(api.users.listUsers);
  const currentAppUser = useQuery(api.authHelper.getCurrentAppUser);
  const createUser = useMutation(api.users.createUser);
  const updateUser = useMutation(api.users.updateUser);
  const deleteUser = useMutation(api.users.deleteUser);

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<Id<"appUsers"> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    role: "mitarbeiter" as "admin" | "mitarbeiter",
    isActive: true,
  });

  const isAdmin = currentAppUser?.role === "admin";

  if (users === undefined) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        await updateUser({
          userId: editingUser,
          ...formData,
        });
        toast.success("Benutzer aktualisiert!");
      } else {
        await createUser(formData);
        toast.success("Benutzer erstellt!");
      }
      setShowForm(false);
      setEditingUser(null);
      setFormData({ username: "", role: "mitarbeiter", isActive: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Fehler aufgetreten";
      toast.error(message);
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user._id);
    setFormData({
      username: user.username,
      role: user.role,
      isActive: user.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (userId: Id<"appUsers">) => {
    if (!confirm("Benutzer wirklich löschen?")) return;
    try {
      await deleteUser({ userId });
      toast.success("Benutzer gelöscht!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Fehler aufgetreten";
      toast.error(message);
    }
  };

  // Filter users based on search
  const filteredUsers = users?.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-700 to-purple-800 rounded-2xl p-6 text-white shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Benutzerverwaltung</h2>
              <p className="text-purple-200">Benutzer und Rollen verwalten</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingUser(null);
              setFormData({ username: "", role: "mitarbeiter", isActive: true });
            }}
            className="px-4 py-2 bg-white text-purple-700 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Neuer Benutzer
          </button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Benutzer suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
        />
      </motion.div>

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-lg border border-purple-200 p-6"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            {editingUser ? "Benutzer bearbeiten" : "Neuer Benutzer"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Benutzername
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rolle
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as "admin" | "mitarbeiter",
                  })
                }
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                <option value="mitarbeiter">Mitarbeiter</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                Aktiv
              </label>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                {editingUser ? "Aktualisieren" : "Erstellen"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingUser(null);
                }}
                className="px-4 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Keine Benutzer gefunden
            </h3>
            <p className="text-slate-500">
              {searchTerm ? "Passen Sie Ihre Suche an" : "Erstellen Sie den ersten Benutzer"}
            </p>
          </div>
        ) : (
          filteredUsers.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-white rounded-xl shadow-md border border-slate-200 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {user.role === "admin" ? (
                      <Shield className="w-6 h-6" />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">
                      {user.username}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {user.role === "admin" ? "Administrator" : "Mitarbeiter"}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          user.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.isActive ? "Aktiv" : "Inaktiv"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
