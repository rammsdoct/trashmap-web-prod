import { useState, useRef } from "react";
import { useMyReports } from "../hooks/useMyReports";
import { useAdmin } from "../hooks/useAdmin";
import ReportDetail from "../components/ReportDetail";
import LoadingScreen from "../components/LoadingScreen";

const CATEGORIES = [
  { key: "abiertos", label: "Abiertos", color: "#EF4444" },
  { key: "en_progreso", label: "En progreso", color: "#F59E0B" },
  { key: "pendiente_validacion", label: "Pendiente validación", color: "#8B5CF6" },
  { key: "validados", label: "Validados", color: "#10B981" },
];

export default function TicketsPage() {
  const { grouped, loading, refresh } = useMyReports();
  const { isAdmin } = useAdmin();
  const [detailReport, setDetailReport] = useState(null);
  const [pullingDown, setPullingDown] = useState(false);
  const startYRef = useRef(0);
  const containerRef = useRef(null);

  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    const container = containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    if (scrollTop === 0 && diff > 50) {
      setPullingDown(true);
    }
  };

  const handleTouchEnd = async () => {
    if (pullingDown) {
      await refresh();
      setPullingDown(false);
    }
  };

  if (loading && !Object.values(grouped).some((arr) => arr.length > 0)) {
    return <LoadingScreen />;
  }

  const handleReportUpdated = (updated) => {
    if (detailReport?.id === updated.id) {
      setDetailReport(updated);
    }
  };

  const handleReportDeleted = (id) => {
    if (detailReport?.id === id) {
      setDetailReport(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-white to-gray-50 overflow-y-auto no-scrollbar"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {pullingDown && (
        <div className="flex items-center justify-center py-4">
          <div className="text-sm text-gray-500">
            🔄 Actualizando...
          </div>
        </div>
      )}

      <div className="px-4 pt-6 pb-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Mis Tickets</h1>
        <p className="text-sm text-gray-500 mb-6">
          Reportes creados por ti
        </p>

        {Object.values(grouped).every((arr) => arr.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="text-4xl">📭</div>
            <p className="text-gray-600 font-medium">Sin reportes aún</p>
            <p className="text-sm text-gray-400">
              Crea tu primer reporte desde el mapa
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {CATEGORIES.map(({ key, label, color }) => {
              const tickets = grouped[key] || [];
              if (tickets.length === 0) return null;

              return (
                <div key={key}>
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-lg font-bold text-gray-800">{label}</h2>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
                      style={{ background: color }}
                    >
                      {tickets.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {tickets.map((report) => (
                      <button
                        key={report.id}
                        onClick={() => setDetailReport(report)}
                        className="w-full text-left p-3.5 bg-white border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-md transition-all active:scale-95"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-1.5 h-12 rounded-full flex-shrink-0"
                            style={{ background: color }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">
                              {report.title || "Sin título"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {report.description || "Sin descripción"}
                            </p>
                            {report.comment && (
                              <p className="text-xs text-gray-400 mt-1 italic truncate">
                                💬 {report.comment}
                              </p>
                            )}
                          </div>
                          <div className="text-2xl flex-shrink-0">
                            📌
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {detailReport && (
        <ReportDetail
          report={detailReport}
          reports={Object.values(grouped).flat()}
          isAdmin={isAdmin}
          onClose={() => setDetailReport(null)}
          onUpdated={handleReportUpdated}
          onDeleted={handleReportDeleted}
          onNavigate={setDetailReport}
        />
      )}
    </div>
  );
}
