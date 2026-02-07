import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { LogIn, User, Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuthActions } from "@convex-dev/auth/react";

export default function UsernameLogin() {
  const { signIn } = useAuthActions();
  const createSession = useMutation(api.users.createSession);
  const initializeAdmin = useMutation(api.init.initialize);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [initialized, setInitialized] = useState(false);
  
  const checkUser = useQuery(
    api.users.checkUserExists,
    username ? { username } : "skip"
  );

  // Admin-Benutzer beim ersten Laden initialisieren
  useEffect(() => {
    const initAdmin = async () => {
      if (!initialized) {
        try {
          await initializeAdmin({});
          setInitialized(true);
        } catch (error) {
          console.log("Initialisierung bereits erfolgt");
          setInitialized(true);
        }
      }
    };
    initAdmin();
  }, [initializeAdmin, initialized]);

  // Validierung während der Eingabe
  useEffect(() => {
    if (username && checkUser && !checkUser.exists) {
      setValidationError(checkUser.message || "");
    } else {
      setValidationError("");
    }
  }, [checkUser, username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error("Bitte geben Sie einen Benutzernamen ein");
      return;
    }

    setLoading(true);

    try {
      // Erst prüfen ob Benutzer existiert
      if (!checkUser || !checkUser.exists) {
        throw new Error("Benutzername nicht gefunden oder Konto deaktiviert");
      }

      // Anonymous Login durchführen
      await signIn("anonymous");
      
      // Warten auf Auth-User ID
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Session erstellen
      if (!checkUser.user) {
        throw new Error("Benutzerdaten nicht verfügbar");
      }
      
      const result = await createSession({ 
        username,
        authUserId: checkUser.user._id as any, // Wird vom Backend korrekt verarbeitet
      });
      
      toast.success(`Willkommen, ${username}!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login fehlgeschlagen";
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Geschützter Zugang
            </h2>
            <p className="text-slate-600">
              Nur registrierte Benutzer haben Zugriff
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Benutzername
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ihr Benutzername"
                  required
                  className={`w-full pl-10 pr-4 py-3 bg-white border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    validationError
                      ? "border-red-300 focus:ring-red-500"
                      : "border-slate-200"
                  }`}
                />
              </div>
              {validationError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center gap-2 text-sm text-red-600"
                >
                  <AlertCircle className="w-4 h-4" />
                  {validationError}
                </motion.div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !username || !!validationError}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Anmeldung läuft...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Anmelden
                </>
              )}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <strong>Geschütztes System:</strong> Nur von Administratoren angelegte Benutzer können sich anmelden.
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-600">
                <strong>Kein Zugang?</strong> Kontaktieren Sie einen Administrator, um einen Benutzer-Account zu erhalten.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
