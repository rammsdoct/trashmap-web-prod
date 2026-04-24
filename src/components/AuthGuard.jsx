import { useAuth } from "../context/AuthContext";

/**
 * Wraps a route — if user is not logged in, renders the fallback (login prompt).
 */
export default function AuthGuard({ children, fallback = null }) {
  const { user } = useAuth();
  if (user === undefined) return (
    <div className="flex h-screen items-center justify-center text-gray-400">Cargando...</div>
  );
  if (!user) return fallback;
  return children;
}
