import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import LoadingScreen from "./components/LoadingScreen";
import LoginPage from "./pages/LoginPage";
import MapPage from "./pages/MapPage";

function AppRoutes() {
  const { user } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  // Firebase still resolving auth state
  if (user === undefined) return <LoadingScreen />;

  // Not logged in
  if (!user) return <LoginPage />;

  // Logged in — full app shell
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar onOpenProfile={() => setProfileOpen(true)} />
      <main className="flex-1 pt-14">
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Profile panel placeholder — built in W5 */}
      {profileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 flex items-end sm:items-center justify-center"
          onClick={() => setProfileOpen(false)}
        >
          <div
            className="bg-white w-full sm:w-96 rounded-t-2xl sm:rounded-2xl p-6 flex flex-col gap-4 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full border border-gray-200" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#10B981] flex items-center justify-center text-white font-bold text-lg">
                  {user.displayName?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-800">{user.displayName ?? "Usuario"}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center">
              Perfil completo disponible en Phase W5 🚧
            </p>
            <button
              onClick={() => setProfileOpen(false)}
              className="w-full rounded-xl bg-gray-100 text-gray-700 py-2.5 text-sm font-medium hover:bg-gray-200 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
