import { useEffect, useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

// Komponente zur automatischen Initialisierung des ersten Admins
export default function InitializeAdmin() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!initialized) {
        try {
          // Hier würde die Initialisierung stattfinden
          // Da wir internalMutation verwenden, muss dies manuell über die Convex Console erfolgen
          setInitialized(true);
        } catch (error) {
          console.error("Initialisierung fehlgeschlagen:", error);
        }
      }
    };
    init();
  }, [initialized]);

  return null;
}
