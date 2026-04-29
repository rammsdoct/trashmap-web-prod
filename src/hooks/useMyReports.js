import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { API_URL } from "../lib/config";

const fetchWithRetry = async (retries = 2) => {
  try {
    const res = await api.get(API_URL);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    if (retries > 0) return fetchWithRetry(retries - 1);
    throw err;
  }
};

export function useMyReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyReports = useCallback(async () => {
    if (!user?.email) {
      setReports([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchWithRetry(2);
      const userEmail = user.email.toLowerCase();
      const myReports = Array.isArray(data)
        ? data.filter((r) => (r.email ?? "").toLowerCase() === userEmail)
        : [];
      setReports(myReports);
      setError(null);
    } catch (err) {
      setError(err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchMyReports();
  }, [fetchMyReports]);

  const grouped = useMemo(() => {
    const result = {
      abiertos: [],
      en_progreso: [],
      pendiente_validacion: [],
      validados: [],
    };

    for (const r of reports) {
      const lat = Number(r.latitude);
      const lng = Number(r.longitude);
      if (r.latitude == null || r.longitude == null || isNaN(lat) || isNaN(lng))
        continue;

      const normalized = (r.status ?? "").toLowerCase().trim();
      const valid = { ...r, latitude: lat, longitude: lng, id: String(r.id) };

      if (normalized === "open") result.abiertos.push(valid);
      else if (normalized === "in_progress") result.en_progreso.push(valid);
      else if (normalized === "closed_pending_validation")
        result.pendiente_validacion.push(valid);
      else if (normalized === "validated" || normalized === "closed")
        result.validados.push(valid);
    }

    return result;
  }, [reports]);

  return {
    myReports: reports,
    grouped,
    loading,
    error,
    refresh: fetchMyReports,
  };
}
