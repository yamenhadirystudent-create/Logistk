import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Warehouse,
  ArrowRightLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardCheck,
  BarChart3,
  Users,
  Download,
} from "lucide-react";
import Dashboard from "./components/Dashboard";
import MaterialsModule from "./components/MaterialsModule";
import LocationsModule from "./components/LocationsModule";
import InboundModule from "./components/InboundModule";
import OutboundModule from "./components/OutboundModule";
import TransferModule from "./components/TransferModule";
import InventoryModule from "./components/InventoryModule";
import UsersModule from "./components/UsersModule";
import ExportModule from "./components/ExportModule";
import UsernameLogin from "./components/UsernameLogin";

type Module =
  | "dashboard"
  | "materials"
  | "locations"
  | "inbound"
  | "outbound"
  | "transfer"
  | "inventory"
  | "users"
  | "export";

export default function App() {
  const [activeModule, setActiveModule] = useState<Module>("dashboard");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Hero Video Background */}
      <div className="fixed inset-0 z-0 opacity-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source
            src="https://videos.pexels.com/video-files/6194507/6194507-hd_1920_1080_30fps.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Header */}
      <header className="relative z-10 sticky top-0 bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 shadow-xl border-b border-blue-700/50 backdrop-blur-sm">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">C1 Material</h1>
                <p className="text-xs text-blue-200">Management System</p>
              </div>
            </motion.div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col">
        <Authenticated>
          <Content activeModule={activeModule} setActiveModule={setActiveModule} />
        </Authenticated>

        <Unauthenticated>
          <UsernameLogin />
        </Unauthenticated>
      </main>

      <Toaster position="top-center" richColors />
    </div>
  );
}

function Content({
  activeModule,
  setActiveModule,
}: {
  activeModule: Module;
  setActiveModule: (module: Module) => void;
}) {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const currentAppUser = useQuery(api.authHelper.getCurrentAppUser);

  if (loggedInUser === undefined || currentAppUser === undefined) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const isAdmin = currentAppUser?.role === "admin";

  const modules = [
    { id: "dashboard" as Module, name: "Dashboard", icon: BarChart3, adminOnly: false },
    { id: "inbound" as Module, name: "Einlagerung", icon: ArrowDownToLine, adminOnly: false },
    { id: "outbound" as Module, name: "Auslagerung", icon: ArrowUpFromLine, adminOnly: false },
    { id: "transfer" as Module, name: "Umlagerung", icon: ArrowRightLeft, adminOnly: false },
    { id: "inventory" as Module, name: "Bestand", icon: ClipboardCheck, adminOnly: false },
    { id: "materials" as Module, name: "Materialien", icon: Package, adminOnly: true },
    { id: "locations" as Module, name: "Lagerorte", icon: Warehouse, adminOnly: true },
    { id: "users" as Module, name: "Benutzer", icon: Users, adminOnly: false },
    { id: "export" as Module, name: "Export", icon: Download, adminOnly: true },
  ];

  const visibleModules = modules.filter((m) => !m.adminOnly || isAdmin);

  return (
    <div className="flex-1 flex flex-col">
      {/* User Info */}
      {currentAppUser && (
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-4 py-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600">Angemeldet als:</span>
            <span className="font-semibold text-slate-900">{currentAppUser.username}</span>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded ${
                isAdmin
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {isAdmin ? "Administrator" : "Mitarbeiter"}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm overflow-x-auto">
        <div className="flex px-2 py-2 gap-1 min-w-max">
          {visibleModules.map((module) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            return (
              <motion.button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30"
                      : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="whitespace-nowrap">{module.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Module Content */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeModule === "dashboard" && <Dashboard />}
            {activeModule === "materials" && <MaterialsModule />}
            {activeModule === "locations" && <LocationsModule />}
            {activeModule === "inbound" && <InboundModule />}
            {activeModule === "outbound" && <OutboundModule />}
            {activeModule === "transfer" && <TransferModule />}
            {activeModule === "inventory" && <InventoryModule />}
            {activeModule === "users" && <UsersModule />}
            {activeModule === "export" && <ExportModule />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
