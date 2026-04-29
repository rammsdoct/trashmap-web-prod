import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import LoadingScreen from "./components/LoadingScreen";
import OfflineBanner from "./components/OfflineBanner";
import LoginPage from "./pages/LoginPage";
import MapPage from "./pages/MapPage";
import TicketsPage from "./pages/TicketsPage";
import ScoreboardPage from "./pages/ScoreboardPage";
import ProfilePage from "./pages/ProfilePage";

function AppRoutes() {
  const { user } = useAuth();

  // Firebase still resolving auth state
  if (user === undefined) return <LoadingScreen />;

  // Not logged in
  if (!user) return <LoginPage />;

  // Logged in — full app shell
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 pt-14">
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/scoreboard" element={<ScoreboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Offline banner */}
      <OfflineBanner />
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
