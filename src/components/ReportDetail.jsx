import { useState, useRef } from "react";
import api from "../lib/api";
import { API_URL, API_BASE } from "../lib/config";
import {
  getPinColor,
  getStatusLabel,
  normalizeStatus,
  isOpenStatus,
  isInProgressStatus,
  getErrorMessage,
} from "../lib/helpers";

// ── Helpers ────────────────────────────────────────────────────────────────

function toBase64(photo) {
  if (!photo) return null;
  return typeof photo === "string" ? photo : photo?.base64 ?? null;
}

function PhotoStage({ label, photo }) {
  const b64 = toBase64(photo);
  if (!b64) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <img
        src={`data:image/jpeg;base64,${b64}`}
        alt={label}
        className="w-full h-40 sm:h-44 object-cover rounded-xl"
      />
    </div>
  );
}

function FileUpload({ label, onSelect, preview, onClear }) {
  const ref = useRef(null);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-[#10B981] hover:text-[#10B981] transition-colors touch-target"
        >
          📷 {label}
        </button>
        {preview && (
          <button
            type="button"
            onClick={onClear}
            className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-semibold rounded-xl transition touch-target"
          >
            Quitar
          </button>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onSelect}
      />
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-full h-40 object-cover rounded-xl"
        />
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function ReportDetail({
  report,
  reports,
  isAdmin,
  onClose,
  onUpdated,
  onDeleted,
  onNavigate,
}) {
  const [stagePhoto, setStagePhoto] = useState(null); // { base64, preview, type, name }
  const [stageComment, setStageComment] = useState("");
  const [acting, setActing] = useState(false);
  const [toast, setToast] = useState(null); // { msg, type: 'ok'|'err' }
  const [confirmDelete, setConfirmDelete] = useState(false);

  const idx = reports.findIndex((r) => r.id === report.id);
  const total = reports.length;
  const hasPrev = idx > 0;
  const hasNext = idx < total - 1;
  const pinColor = getPinColor(report.status);
  const status = normalizeStatus(report.status);
  const reportNum = idx >= 0 ? idx + 1 : "?";

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const full = ev.target.result;
      setStagePhoto({
        base64: full.split(",")[1],
        preview: full,
        type: file.type || "image/jpeg",
        name: file.name || "photo.jpg",
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const updateStage = async (nextStatus) => {
    if (!stagePhoto?.base64) {
      showToast("Selecciona una foto para continuar.", "err");
      return;
    }
    setActing(true);
    try {
      const res = await api.put(`${API_URL}/${report.id}`, {
        status: nextStatus,
        photoStage: nextStatus,
        photo: { base64: stagePhoto.base64, type: stagePhoto.type, name: stagePhoto.name },
        ...(stageComment.trim() ? { comment: stageComment.trim() } : {}),
      });
      const serverStatus = res?.data?.status || nextStatus;
      onUpdated(res?.data ?? { ...report, status: serverStatus });
      setStagePhoto(null);
      setStageComment("");
      showToast(`Actualizado a ${getStatusLabel(serverStatus)}. ✅`);
    } catch (e) {
      showToast(getErrorMessage(e, "Error al actualizar."), "err");
    } finally {
      setActing(false);
    }
  };

  const adminValidate = async () => {
    setActing(true);
    try {
      const res = await api.post(`${API_BASE}/reports/${report.id}/validate`);
      const updated = res?.data?.report || res?.data;
      onUpdated(updated ?? { ...report, status: "validated" });
      showToast("Reporte validado. Puntos otorgados. ✅");
    } catch (e) {
      if (e?.response?.status === 409) {
        showToast("Ya estaba validado.", "err");
      } else {
        showToast(getErrorMessage(e, "Error al validar."), "err");
      }
    } finally {
      setActing(false);
    }
  };

  const adminReopen = async () => {
    setActing(true);
    try {
      await api.put(`${API_URL}/${report.id}`, { status: "open" });
      onUpdated({ ...report, status: "open" });
      showToast("Reporte regresado a Abierto. 🔄");
    } catch (e) {
      showToast(getErrorMessage(e, "Error al re-abrir."), "err");
    } finally {
      setActing(false);
    }
  };

  const adminDelete = async () => {
    setActing(true);
    try {
      await api.delete(`${API_URL}/${report.id}`);
      onDeleted(report.id);
      onClose();
    } catch (e) {
      showToast(getErrorMessage(e, "Error al eliminar."), "err");
    } finally {
      setActing(false);
      setConfirmDelete(false);
    }
  };

  const navigate = (dir) => {
    const next = idx + dir;
    if (next >= 0 && next < total) {
      setStagePhoto(null);
      setStageComment("");
      setConfirmDelete(false);
      onNavigate(reports[next]);
    }
  };

  // ── Content (shared desktop/mobile) ─────────────────────────────────────
  const content = (
    <div className="flex flex-col gap-4 pb-4">
      {/* Toast */}
      {toast && (
        <div
          className={`text-xs px-3 py-2 rounded-xl font-medium ${
            toast.type === "err"
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Status badge + report number + nav arrows */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full text-white w-fit"
            style={{ background: pinColor }}
          >
            {getStatusLabel(report.status)}
          </span>
          <span className="text-xs text-gray-400">Reporte No. {reportNum} de {total}</span>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            disabled={!hasPrev}
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-base leading-none transition touch-target"
          >
            ‹
          </button>
          <button
            disabled={!hasNext}
            onClick={() => navigate(1)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-base leading-none transition touch-target"
          >
            ›
          </button>
        </div>
      </div>

      {/* Title + description */}
      <div>
        <p className="text-base font-bold text-gray-900 leading-snug">
          {report.title?.trim() || `Reporte No. ${reportNum}`}
        </p>
        {report.description ? (
          <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
            {report.description}
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic mt-1">Sin descripción.</p>
        )}
      </div>

      {/* User comment */}
      {report.comment ? (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">
            Comentario
          </p>
          <p className="text-sm text-gray-700">{report.comment}</p>
        </div>
      ) : null}

      {/* Pending validation hint */}
      {status === "closed_pending_validation" && (
        <p className="text-xs text-purple-700 bg-purple-50 border border-purple-100 px-3 py-2 rounded-xl">
          ⏳ Pendiente de validación por un administrador.
        </p>
      )}

      {/* Photo timeline */}
      <PhotoStage label="📍 Foto inicial (Abierto)"   photo={report.photos?.open} />
      <PhotoStage label="🧹 Foto en progreso"          photo={report.photos?.in_progress} />
      <PhotoStage label="✅ Foto de cierre"             photo={report.photos?.closed} />

      {/* ── User actions ─────────────────────────────────────── */}
      {isOpenStatus(report.status) && (
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            Marcar en progreso
          </p>
          <FileUpload
            label="Subir foto de avance"
            onSelect={handleFile}
            preview={stagePhoto?.preview}
            onClear={() => setStagePhoto(null)}
          />
          <textarea
            placeholder="Comentario (opcional)"
            value={stageComment}
            onChange={(e) => setStageComment(e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] placeholder:text-gray-400"
          />
          <button
            disabled={acting || !stagePhoto}
            onClick={() => updateStage("in_progress")}
            className="w-full py-2.5 bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all active:scale-95 touch-target"
          >
            {acting ? "Actualizando…" : "Marcar en progreso"}
          </button>
        </div>
      )}

      {isInProgressStatus(report.status) && (
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            Cerrar reporte
          </p>
          <FileUpload
            label="Subir foto de cierre"
            onSelect={handleFile}
            preview={stagePhoto?.preview}
            onClear={() => setStagePhoto(null)}
          />
          <textarea
            placeholder="Comentario (opcional)"
            value={stageComment}
            onChange={(e) => setStageComment(e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] placeholder:text-gray-400"
          />
          <button
            disabled={acting || !stagePhoto}
            onClick={() => updateStage("closed")}
            className="w-full py-2.5 bg-[#6B7280] hover:bg-[#4B5563] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all active:scale-95 touch-target"
          >
            {acting ? "Cerrando…" : "Cerrar reporte"}
          </button>
        </div>
      )}

      {/* ── Admin section ─────────────────────────────────────── */}
      {isAdmin && (
        <>
          <div className="flex items-center gap-3 pt-2">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-xs font-bold text-gray-400 tracking-widest">
              ADMIN
            </span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          {status === "closed_pending_validation" && (
            <button
              disabled={acting}
              onClick={adminValidate}
              className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all active:scale-95 touch-target"
            >
              {acting ? "Validando…" : "✅ Validar (+ puntos)"}
            </button>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            {status !== "open" && (
              <button
                disabled={acting}
                onClick={adminReopen}
                className="flex-1 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all active:scale-95 touch-target"
              >
                {acting ? "…" : "🔄 Re-abrir"}
              </button>
            )}

            {!confirmDelete ? (
              <button
                disabled={acting}
                onClick={() => setConfirmDelete(true)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all active:scale-95 touch-target"
              >
                🗑 Eliminar
              </button>
            ) : (
              <div className="flex-1 flex flex-col sm:flex-row gap-1.5">
                <button
                  disabled={acting}
                  onClick={adminDelete}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition touch-target"
                >
                  {acting ? "…" : "Confirmar"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition touch-target"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-20 bg-black/25 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Desktop: right-side drawer */}
      <div className="hidden md:flex fixed right-0 top-14 bottom-0 w-full md:w-96 lg:w-96 bg-white shadow-2xl z-30 flex-col slide-in-right">
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-bold text-gray-900 text-sm tracking-tight">
            Detalle del reporte
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm transition touch-target"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 no-scrollbar">
          {content}
        </div>
      </div>

      {/* Mobile: expandable bottom sheet */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white rounded-t-3xl shadow-2xl z-30 max-h-[90dvh] flex flex-col slide-up overflow-hidden">
        <div className="relative flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 rounded-full" />
          <h2 className="font-bold text-gray-900 text-sm tracking-tight mt-1">
            Detalle del reporte
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm transition mt-1 touch-target"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
          {content}
        </div>
      </div>
    </>
  );
}
