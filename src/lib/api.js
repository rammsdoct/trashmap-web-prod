import axios from "axios";
import { auth } from "./firebase";
import { API_URL } from "./config";

const api = axios.create({ baseURL: API_URL });

// Attach Bearer token to every request (same pattern as mobile)
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 → refresh token once and retry (same pattern as mobile)
let refreshPromise = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (!refreshPromise) {
        refreshPromise = auth.currentUser
          ?.getIdToken(true)
          .finally(() => { refreshPromise = null; });
      }
      await refreshPromise;
      const token = await auth.currentUser?.getIdToken();
      if (token) original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    }
    return Promise.reject(error);
  }
);

export default api;
