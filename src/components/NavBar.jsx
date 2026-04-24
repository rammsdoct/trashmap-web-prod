import { useAuth } from "../context/AuthContext";

export default function NavBar({ onOpenProfile }) {
  const { user, handleSignOut } = useAuth();

  const initial = user?.displayName?.[0]?.toUpperCase()
    ?? user?.email?.[0]?.toUpperCase()
    ?? "?";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/90 backdrop-blur border-b border-gray-100 flex items-center px-4 gap-3 shadow-sm">
      {/* Brand */}
      <span className="text-xl">🗑️</span>
      <span className="font-bold text-gray-800 text-sm tracking-tight hidden sm:block">
        PresaWatch
      </span>

      <div className="flex-1" />

      {/* User avatar + name */}
      <button
        onClick={onOpenProfile}
        className="flex items-center gap-2 rounded-full px-3 py-1.5 hover:bg-gray-50 transition text-sm text-gray-700"
      >
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-7 h-7 rounded-full border border-gray-200"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#10B981] flex items-center justify-center text-white text-xs font-bold">
            {initial}
          </div>
        )}
        <span className="hidden sm:block max-w-[120px] truncate font-medium">
          {user?.displayName ?? user?.email ?? "Usuario"}
        </span>
      </button>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="text-xs text-gray-400 hover:text-red-500 transition px-2 py-1 rounded-lg hover:bg-red-50"
        title="Cerrar sesión"
      >
        Salir
      </button>
    </header>
  );
}
