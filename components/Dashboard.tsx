import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import {
  Package,
  Warehouse,
  TrendingUp,
  AlertTriangle,
  Activity,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const inventory = useQuery(api.inventory.listAll);
  const recentMovements = useQuery(api.movements.list, { limit: 10 });
  const syncStocks = useMutation(api.init.syncStocks);

  if (
    inventory === undefined ||
    recentMovements === undefined
  ) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Alle Daten kommen direkt von der Bestandsseite
  const totalMaterials = inventory.length;
  const totalLocations = inventory.reduce((sum, item) => sum + item.locations, 0);
  const lowStockItems = inventory.filter(
    (item) => item.totalQuantity < item.minStock
  ).length;
  const totalValue = inventory.reduce(
    (sum, item) => sum + item.totalQuantity,
    0
  );

  const handleSync = async () => {
    try {
      const result = await syncStocks({});
      toast.success(`${result.synced} Materialien synchronisiert`);
    } catch (error) {
      toast.error("Fehler bei der Synchronisierung");
    }
  };

  const stats = [
    {
      label: "Materialien",
      value: totalMaterials,
      icon: Package,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      label: "Lagerorte",
      value: totalLocations,
      icon: Warehouse,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      label: "Gesamtbestand",
      value: totalValue,
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
    },
    {
      label: "Niedrige Bestände",
      value: lowStockItems,
      icon: AlertTriangle,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
    },
  ];

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
            <p className="text-blue-100">
              Übersicht über Ihr Materialmanagement System
            </p>
          </div>
          <button
            onClick={handleSync}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Sync</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`${stat.bgColor} rounded-xl p-4 shadow-lg border border-slate-200`}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-md`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className={`text-3xl font-bold ${stat.textColor} mb-1`}>
                {stat.value}
              </div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Low Stock Alert */}
      {lowStockItems > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4 shadow-md"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <div>
              <h3 className="font-semibold text-orange-900">
                Niedrige Bestände
              </h3>
              <p className="text-sm text-orange-700">
                {lowStockItems} Material{lowStockItems !== 1 ? "ien" : ""}{" "}
                unterschreiten den Mindestbestand
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Movements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-slate-700" />
            <h3 className="text-lg font-semibold text-slate-800">
              Letzte Bewegungen
            </h3>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {recentMovements.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Noch keine Bewegungen vorhanden
            </div>
          ) : (
            recentMovements.map((movement, index) => (
              <motion.div
                key={movement._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`
                        px-2 py-0.5 rounded-full text-xs font-medium
                        ${
                          movement.type === "einlagerung"
                            ? "bg-green-100 text-green-700"
                            : movement.type === "auslagerung"
                            ? "bg-red-100 text-red-700"
                            : movement.type === "umlagerung"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                        }
                      `}
                      >
                        {movement.type}
                      </span>
                      <span className="text-sm font-medium text-slate-900 truncate">
                        {movement.material?.name}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Menge: {movement.quantity} {movement.material?.unit}
                    </div>
                    {movement.fromLocation && (
                      <div className="text-xs text-slate-500">
                        Von: {movement.fromLocation.locationCode}
                      </div>
                    )}
                    {movement.toLocation && (
                      <div className="text-xs text-slate-500">
                        Nach: {movement.toLocation.locationCode}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 whitespace-nowrap">
                    {new Date(movement.timestamp).toLocaleString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
