import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../lib/api";
import { API_URL } from "../lib/config";

// Pure retry wrapper — defined outside component to avoid re-creation
const fetchWithRetry = async (retries = 2) => {
  try {
    const res = await api.get(API_URL);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    if (retries > 0) return fetchWithRetry(retries - 1);
    throw err;
  }
};

export function useReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWithRetry(2);
      setReports(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Single-pass computation — mirrors mobile Phase 2 memo
  const { filteredReports, statusCounts, validReports } = useMemo(() => {
    const counts = {
      open: 0,
      in_progress: 0,
      closed: 0,
      closed_pending_validation: 0,
      validated: 0,
    };
    const valid = [];

    for (const r of reports) {
      const lat = Number(r.latitude);
      const lng = Number(r.longitude);
      if (r.latitude == null || r.longitude == null || isNaN(lat) || isNaN(lng))
        continue;
      valid.push({ ...r, latitude: lat, longitude: lng, id: String(r.id) });
      const s = (r.status ?? "").toLowerCase().trim();
      if (s in counts) counts[s]++;
    }

    const filtered =
      activeFilter === "all"
        ? valid
        : valid.filter(
            (r) => (r.status ?? "").toLowerCase().trim() === activeFilter
          );

    return { filteredReports: filtered, statusCounts: counts, validReports: valid };
  }, [reports, activeFilter]);

  return {
    reports: validReports,
    filteredReports,
    statusCounts,
    loading,
    error,
    refresh: fetchReports,
    activeFilter,
    setActiveFilter,
  };
}
