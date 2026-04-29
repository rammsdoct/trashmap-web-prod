import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function NavBar() {
  const { user, handleSignOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const initial = user?.displayName?.[0]?.toUpperCase()
    ?? user?.email?.[0]?.toUpperCase()
    ?? "?";

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/90 backdrop-blur border-b border-gray-100 flex items-center px-3 sm:px-4 gap-2 sm:gap-3 shadow-sm">
      {/* Brand */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 hover:opacity-80 transition flex-shrink-0"
      >
        <span className="text-xl">🗑️</span>
        <span className="font-bold text-gray-800 text-sm tracking-tight hidden sm:block">
          PresaWatch
        </span>
      </button>

      <div className="flex-1" />

      {/* Navigation buttons */}
      <nav className="hidden sm:flex items-center gap-1">
        <button
          onClick={() => navigate("/")}
          className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition touch-target ${
            isActive("/")
              ? "bg-gray-100 text-gray-900"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          🗺️ Mapa
        </button>

        <button
          onClick={() => navigate("/create")}
          className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition touch-target bg-green-500 hover:bg-green-600 text-white ${
            isActive("/create") ? "ring-2 ring-green-700" : ""
          }`}
        >
          ➕ Reportar
        </button>

        <button
          onClick={() => navigate("/tickets")}
          className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition touch-target ${
            isActive("/tickets")
              ? "bg-gray-100 text-gray-900"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          🎫 Tickets
        </button>

        <button
          onClick={() => navigate("/scoreboard")}
          className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition touch-target ${
            isActive("/scoreboard")
              ? "bg-gray-100 text-gray-900"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          🏆 Score
        </button>
      </nav>

      {/* Mobile nav icons */}
      <nav className="flex sm:hidden items-center gap-1">
        <button
          onClick={() => navigate("/")}
          className={`w-8 h-8 flex items-center justify-center text-lg rounded-lg transition ${
            isActive("/")
              ? "bg-gray-100 text-gray-900"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          🗺️
        </button>

        <button
          onClick={() => navigate("/create")}
          className={`w-8 h-8 flex items-center justify-center text-lg rounded-lg transition bg-green-500 hover:bg-green-600 text-white ${
            isActive("/create") ? "ring-2 ring-green-700" : ""
          }`}
          title="Nuevo reporte"
        >
          ➕
        </button>

        <button
          onClick={() => navigate("/tickets")}
          className={`w-8 h-8 flex items-center justify-center text-lg rounded-lg transition ${
            isActive("/tickets")
              ? "bg-gray-100 text-gray-900"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          🎫
        </button>

        <button
          onClick={() => navigate("/scoreboard")}
          className={`w-8 h-8 flex items-center justify-center text-lg rounded-lg transition ${
            isActive("/scoreboard")
              ? "bg-gray-100 text-gray-900"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          🏆
        </button>
      </nav>

      {/* User avatar + profile */}
      <button
        onClick={() => navigate("/profile")}
        className={`flex items-center gap-2 rounded-full px-2 sm:px-3 py-2 transition text-sm touch-target ${
          isActive("/profile")
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-50"
        }`}
      >
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-7 h-7 rounded-full border border-gray-200 flex-shrink-0"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#10B981] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initial}
          </div>
        )}
        <span className="hidden sm:block max-w-[120px] truncate font-medium text-xs sm:text-sm">
          {user?.displayName ?? user?.email ?? "Usuario"}
        </span>
      </button>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="text-xs text-gray-400 hover:text-red-500 transition px-2 sm:px-3 py-2 rounded-lg hover:bg-red-50 touch-target hidden sm:block"
        title="Cerrar sesión"
      >
        Salir
      </button>

      {/* Mobile sign out icon */}
      <button
        onClick={handleSignOut}
        className="sm:hidden text-lg hover:text-red-500 transition flex-shrink-0"
        title="Cerrar sesión"
      >
        🚪
      </button>
    </header>
  );
}
