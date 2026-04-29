import { useState, useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { GOOGLE_MAPS_API_KEY } from "../lib/config";
import { useReports } from "../hooks/useReports";
import { useAdmin } from "../hooks/useAdmin";
import { getPinColor } from "../lib/helpers";
import FilterChips from "../components/FilterChips";
import ReportPreview from "../components/ReportPreview";
import ReportDetail from "../components/ReportDetail";

const DEFAULT_CENTER = { lat: 19.6218807, lng: -101.2552132 };
const DEFAULT_ZOOM = 14;

const MAP_OPTIONS = {
  disableDefaultUI: true,
  gestureHandling: "greedy",
  clickableIcons: false,
};

export default function MapPage() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY ?? "",
  });

  const {
    reports,
    filteredReports,
    statusCounts,
    loading,
    error,
    refresh,
    activeFilter,
    setActiveFilter,
  } = useReports();

  const { isAdmin } = useAdmin();
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailReport, setDetailReport] = useState(null);
  const mapRef = useRef(null);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);
  const onMapUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        mapRef.current?.panTo({ lat: coords.latitude, lng: coords.longitude });
        mapRef.current?.setZoom(16);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleMarkerClick = useCallback((report) => {
    setDetailReport(null);
    setSelectedReport(report);
    mapRef.current?.panTo({ lat: report.latitude, lng: report.longitude });
  }, []);

  const handleNavigate = useCallback((report) => {
    setSelectedReport(report);
    mapRef.current?.panTo({ lat: report.latitude, lng: report.longitude });
  }, []);

  const handleDetailNavigate = useCallback((report) => {
    setDetailReport(report);
    setSelectedReport(report);
    mapRef.current?.panTo({ lat: report.latitude, lng: report.longitude });
  }, []);

  const handleUpdated = useCallback((updated) => {
    setDetailReport((prev) => (prev ? { ...prev, ...updated } : updated));
    setSelectedReport((prev) => (prev ? { ...prev, ...updated } : updated));
    refresh();
  }, [refresh]);

  const handleDeleted = useCallback(() => {
    setDetailReport(null);
    setSelectedReport(null);
    refresh();
  }, [refresh]);

  if (loadError) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center text-red-500 flex-col gap-2">
        <span className="text-3xl">⚠️</span>
        <p className="text-sm font-medium">Error al cargar el mapa.</p>
        <p className="text-xs text-gray-400">Verifica la clave de API de Maps.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center text-gray-400 flex-col gap-3">
        <div className="w-9 h-9 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Cargando mapa…</p>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col lg:flex-row">
      {/* Map container */}
      <div className="flex-1 relative min-h-[300px] lg:min-h-auto">
        {/* Filter chips — absolute top */}
        <FilterChips
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          statusCounts={statusCounts}
          totalCount={reports.length}
        />

        {/* Loading toast */}
        {loading && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 bg-white/95 px-4 py-2 rounded-full shadow-md text-xs text-gray-600 flex items-center gap-2 pointer-events-none">
            <div className="w-3 h-3 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
            Cargando reportes…
          </div>
        )}

        {/* Error toast */}
        {error && !loading && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 bg-red-50 border border-red-200 px-4 py-2 rounded-full shadow text-xs text-red-600 flex items-center gap-2">
            <span>⚠️</span>
            Sin conexión —{" "}
            <button onClick={refresh} className="underline font-semibold">
              reintentar
            </button>
          </div>
        )}

        {/* Google Map */}
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          options={MAP_OPTIONS}
          onLoad={onMapLoad}
          onUnmount={onMapUnmount}
          onClick={() => setSelectedReport(null)}
        >
          {filteredReports.map((r) => (
            <Marker
              key={r.id}
              position={{ lat: r.latitude, lng: r.longitude }}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: selectedReport?.id === r.id ? 11 : 8,
                fillColor: getPinColor(r.status),
                fillOpacity: 1,
                strokeColor: selectedReport?.id === r.id ? "#1F2937" : "#ffffff",
                strokeWeight: selectedReport?.id === r.id ? 3 : 2,
              }}
              zIndex={selectedReport?.id === r.id ? 10 : 1}
              onClick={() => handleMarkerClick(r)}
            />
          ))}
        </GoogleMap>

        {/* Floating controls — bottom right */}
        <div className="absolute bottom-6 right-4 flex flex-col gap-2 z-10">
          <button
            onClick={refresh}
            title="Recargar reportes"
            className="w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center text-lg hover:bg-gray-50 active:scale-95 transition-all touch-target"
          >
            🔄
          </button>
          <button
            onClick={handleGeolocate}
            title="Mi ubicación"
            className="w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center text-lg hover:bg-gray-50 active:scale-95 transition-all touch-target"
          >
            📍
          </button>
        </div>

        {/* Report count badge — bottom left */}
        <div className="absolute bottom-6 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow text-xs text-gray-600 font-medium pointer-events-none">
          {filteredReports.length} reporte{filteredReports.length !== 1 ? "s" : ""}
          {activeFilter !== "all" && " filtrados"}
        </div>

        {/* Report preview panel (pin clicked but detail not yet open) */}
        {selectedReport && !detailReport && (
          <ReportPreview
            report={selectedReport}
            reports={filteredReports}
            onClose={() => setSelectedReport(null)}
            onNavigate={handleNavigate}
            onOpenDetail={() => setDetailReport(selectedReport)}
          />
        )}

        {/* Report detail drawer (full info + actions) */}
        {detailReport && (
          <ReportDetail
            report={detailReport}
            reports={filteredReports}
            isAdmin={isAdmin}
            onClose={() => setDetailReport(null)}
            onUpdated={handleUpdated}
            onDeleted={handleDeleted}
            onNavigate={handleDetailNavigate}
          />
        )}
      </div>
    </div>
  );
}
