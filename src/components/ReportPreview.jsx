import { getPinColor, getStatusLabel } from "../lib/helpers";

export default function ReportPreview({ report, reports, onClose, onNavigate, onOpenDetail }) {
  const idx = reports.findIndex((r) => r.id === report.id);
  const total = reports.length;
  const hasPrev = idx > 0;
  const hasNext = idx < total - 1;
  const pinColor = getPinColor(report.status);
  const statusLabel = getStatusLabel(report.status);
  const reportNum = idx >= 0 ? idx + 1 : "?";

  const navigate = (dir) => {
    const next = idx + dir;
    if (next >= 0 && next < total) onNavigate(reports[next]);
  };

  const content = (
    <div className="flex flex-col gap-3">
      {/* Status badge + close */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full text-white flex-shrink-0"
          style={{ background: pinColor }}
        >
          {statusLabel}
        </span>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-gray-400">
            {reportNum}/{total}
          </span>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm transition touch-target"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Title */}
      <div>
        <p className="text-sm font-bold text-gray-900 leading-snug">
          {report.title?.trim() || `Reporte No. ${reportNum}`}
        </p>
        {report.title?.trim() && (
          <p className="text-xs text-gray-400 mt-0.5">
            Reporte No. {reportNum}
          </p>
        )}
      </div>

      {/* Description */}
      {report.description ? (
        <p className="text-sm text-gray-600 line-clamp-3">{report.description}</p>
      ) : (
        <p className="text-sm text-gray-400 italic">Sin descripción</p>
      )}

      {/* First photo preview */}
      {report.photoOpen && (
        <img
          src={`data:image/jpeg;base64,${report.photoOpen}`}
          alt="Foto del reporte"
          className="w-full h-36 sm:h-44 object-cover rounded-xl"
        />
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
        <button
          disabled={!hasPrev}
          onClick={() => navigate(-1)}
          className="w-full sm:flex-1 flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition px-2 py-2 sm:py-1.5 rounded-lg hover:bg-gray-100 touch-target"
        >
          ← Anterior
        </button>
        <button 
          onClick={onOpenDetail}
          className="w-full sm:flex-1 py-2.5 bg-[#10B981] hover:bg-[#059669] active:scale-95 text-white text-xs font-semibold rounded-xl transition-all touch-target"
        >
          Ver detalle
        </button>
        <button
          disabled={!hasNext}
          onClick={() => navigate(1)}
          className="w-full sm:flex-1 flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition px-2 py-2 sm:py-1.5 rounded-lg hover:bg-gray-100 touch-target"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Tablet+: left panel */}
      <div className="hidden md:block absolute left-3 lg:left-4 top-16 w-72 lg:w-80 bg-white rounded-2xl shadow-xl z-10 overflow-y-auto max-h-[calc(100%-5rem)] pointer-events-auto">
        <div className="p-4">{content}</div>
      </div>

      {/* Mobile: bottom sheet */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-10 pointer-events-auto slide-up max-h-[85dvh] overflow-y-auto">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-0" />
        <div className="p-4 pb-8">{content}</div>
      </div>
    </>
  );
}
