import { useState, useEffect } from "react";
import api from "../lib/api";
import { API_BASE } from "../lib/config";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`${API_BASE}/me`)
      .then((res) => {
        if (!cancelled) setIsAdmin(!!res.data?.isAdmin);
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { isAdmin, loading };
}
