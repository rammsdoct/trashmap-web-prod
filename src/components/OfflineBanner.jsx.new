import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setTimeout(() => window.location.reload(), 1500);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-amber-50 border-t border-amber-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="text-lg">📡</span>
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-semibold text-amber-900">Sin conexión</p>
          <p className="text-xs text-amber-700">Usando datos en caché. Los cambios se sincronizarán cuando haya conexión.</p>
        </div>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs font-semibold rounded-lg transition whitespace-nowrap"
      >
        Reintentar
      </button>
    </div>
  );
}
