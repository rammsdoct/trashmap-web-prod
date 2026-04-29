import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../lib/api";
import { API_URL, API_BASE } from "../lib/config";

const fetchWithRetry = async (url, retries = 2) => {
  try {
    const res = await api.get(url);
    return res.data;
  } catch (err) {
    if (retries > 0) return fetchWithRetry(url, retries - 1);
    throw err;
  }
};

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      // Try /leaderboard endpoint first
      const data = await fetchWithRetry(`${API_BASE}/leaderboard`, 1).catch(() =>
        // Fallback: calculate locally from all reports
        calculateLeaderboardLocally()
      );

      const leaderboardData = Array.isArray(data) ? data : data?.leaderboard || [];
      setLeaderboard(leaderboardData);
      setError(null);
    } catch (err) {
      setError(err);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    loading,
    error,
    refresh: fetchLeaderboard,
  };
}

// Fallback: calculate leaderboard from all reports
async function calculateLeaderboardLocally() {
  try {
    const res = await api.get(API_URL);
    const allReports = Array.isArray(res.data) ? res.data : [];

    const scoreMap = {};

    for (const report of allReports) {
      const email = report.email?.toLowerCase();
      if (!email) continue;

      if (!scoreMap[email]) {
        scoreMap[email] = {
          email,
          displayName: report.displayName || email,
          points: 0,
          tickets: 0,
          validated: 0,
          photoURL: report.photoURL || null,
        };
      }

      const status = (report.status ?? "").toLowerCase().trim();
      scoreMap[email].tickets++;

      // 10 points per validated ticket
      if (status === "validated") {
        scoreMap[email].validated++;
        scoreMap[email].points += 10;
      }
    }

    return Object.values(scoreMap)
      .sort((a, b) => b.points - a.points)
      .map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));
  } catch (err) {
    console.error("Error calculating leaderboard locally:", err);
    return [];
  }
}
