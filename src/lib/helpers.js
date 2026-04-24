// Pure helpers — mirrors mobile App.js module-scope helpers

export const normalizeStatus = (v) => (v ?? "").toString().trim().toLowerCase();

export const getStatusLabel = (v) => {
  switch (normalizeStatus(v)) {
    case "open":                      return "Abierto";
    case "in_progress":               return "En progreso";
    case "closed":                    return "Cerrado";
    case "closed_pending_validation": return "Pendiente de validación";
    case "validated":                 return "Validado";
    default:                          return v ?? "Desconocido";
  }
};

export const isOpenStatus               = (v) => normalizeStatus(v) === "open";
export const isInProgressStatus         = (v) => normalizeStatus(v) === "in_progress";
export const isPendingValidationStatus  = (v) => normalizeStatus(v) === "closed_pending_validation";
export const isValidatedStatus          = (v) => normalizeStatus(v) === "validated";
export const isClosedFamily             = (v) => ["closed","closed_pending_validation","validated"].includes(normalizeStatus(v));

export const getPinColor = (status) => {
  switch (normalizeStatus(status)) {
    case "open":                      return "#EF4444"; // red
    case "in_progress":               return "#F59E0B"; // amber
    case "closed":                    return "#6B7280"; // gray
    case "closed_pending_validation": return "#8B5CF6"; // purple
    case "validated":                 return "#10B981"; // green
    default:                          return "#6B7280";
  }
};

export const getRankLabel = (pts) => {
  if (pts >= 500) return "Embajador verde";
  if (pts >= 100) return "Emisario verde";
  if (pts >= 10)  return "Soldado verde";
  return "Vecino activo";
};

export const getRankColor = (pts) => {
  if (pts >= 500) return "#059669";
  if (pts >= 100) return "#10B981";
  if (pts >= 10)  return "#34D399";
  return "#9CA3AF";
};

export const getMedal = (idx) => ["🥇","🥈","🥉"][idx] ?? "🎖️";

export const getErrorMessage = (e, fallback = "Error inesperado.") => {
  if (e?.code === "ECONNABORTED" || e?.message?.includes("timeout")) return "La solicitud tardó demasiado. Verifica tu conexión.";
  if (!e?.response) return "Sin conexión. Verifica tu red.";
  const status = e.response?.status;
  if (status === 401) return "Sesión expirada. Inicia sesión de nuevo.";
  if (status === 403) return "No tienes permiso para esta acción.";
  if (status === 404) return "El recurso no fue encontrado.";
  if (status === 409) return "Conflicto: alguien ya realizó esta acción.";
  if (status === 413) return "La imagen es demasiado grande.";
  if (status >= 500)  return "Error en el servidor. Intenta más tarde.";
  return fallback;
};
