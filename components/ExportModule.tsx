import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Download, FileSpreadsheet, History } from "lucide-react";
import { toast } from "sonner";

export default function ExportModule() {
  const inventoryData = useQuery(api.exports.exportInventory);
  const movementsData = useQuery(api.exports.exportMovements);

  if (inventoryData === undefined || movementsData === undefined) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  const exportToCSV = (data: any[], filename: string, type: "inventory" | "movements") => {
    try {
      let csvContent = "";

      if (type === "inventory") {
        // Header für Bestandsexport
        csvContent = "Materialnummer;Name;Beschreibung;Einheit;Kategorie;Mindestbestand;Aktueller Bestand;Lagerorte\n";
        
        data.forEach((item) => {
          const locationsStr = item.locations
            .map((loc: any) => `${loc.locationCode} (${loc.quantity} ${item.unit})`)
            .join(" | ");
          
          csvContent += `${item.materialNumber};${item.name};${item.description};${item.unit};${item.category};${item.minStock};${item.currentStock};${locationsStr}\n`;
        });
      } else {
        // Header für Bewegungsexport
        csvContent = "Zeitstempel;Typ;Materialnummer;Materialname;Von Lagerort;Zu Lagerort;Menge;Grund;Durchgeführt von\n";
        
        data.forEach((item) => {
          csvContent += `${item.timestamp};${item.type};${item.materialNumber};${item.materialName};${item.fromLocation};${item.toLocation};${item.quantity};${item.reason};${item.performedBy}\n`;
        });
      }

      // BOM für UTF-8
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Export erfolgreich!");
    } catch (error) {
      toast.error("Export fehlgeschlagen");
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-700 to-green-800 rounded-2xl p-6 text-white shadow-xl"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <Download className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Datenexport</h2>
        </div>
        <p className="text-green-200">Exportieren Sie Ihre Daten als CSV-Datei</p>
      </motion.div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bestandsexport */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Bestandsübersicht</h3>
              <p className="text-sm text-slate-600">Alle Materialien und Lagerorte</p>
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Materialien:</span>
              <span className="font-semibold text-slate-900">{inventoryData.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Format:</span>
              <span className="font-semibold text-slate-900">CSV (Excel)</span>
            </div>
          </div>

          <button
            onClick={() => exportToCSV(inventoryData, "bestandsuebersicht", "inventory")}
            disabled={inventoryData.length === 0}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Bestand exportieren
          </button>
        </motion.div>

        {/* Bewegungsexport */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <History className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Bewegungshistorie</h3>
              <p className="text-sm text-slate-600">Alle Ein-, Aus- und Umlagerungen</p>
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Bewegungen:</span>
              <span className="font-semibold text-slate-900">{movementsData.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Format:</span>
              <span className="font-semibold text-slate-900">CSV (Excel)</span>
            </div>
          </div>

          <button
            onClick={() => exportToCSV(movementsData, "bewegungshistorie", "movements")}
            disabled={movementsData.length === 0}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Bewegungen exportieren
          </button>
        </motion.div>
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-4"
      >
        <h4 className="font-semibold text-blue-900 mb-2">💡 Hinweise zum Export</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• CSV-Dateien können direkt in Excel geöffnet werden</li>
          <li>• Trennzeichen: Semikolon (;)</li>
          <li>• Zeichenkodierung: UTF-8 mit BOM</li>
          <li>• Dateiname enthält aktuelles Datum</li>
        </ul>
      </motion.div>
    </div>
  );
}
