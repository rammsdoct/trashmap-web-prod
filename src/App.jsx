import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import LoadingScreen from "./components/LoadingScreen";
import OfflineBanner from "./components/OfflineBanner";
import LoginPage from "./pages/LoginPage";
import MapPage from "./pages/MapPage";
import CreateReportPage from "./pages/CreateReportPage";
import TicketsPage from "./pages/TicketsPage";
import ScoreboardPage from "./pages/ScoreboardPage";
import ProfilePage from "./pages/ProfilePage";

function AppRoutes() {
  const { user } = useAuth();

  // Firebase still resolving auth state
  if (user === undefined) return <LoadingScreen />;

  // Map and scoreboard are public — login required only for write/personal routes
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 pt-14">
        <Routes>
          <Route path="/"           element={<MapPage />} />
          <Route path="/scoreboard" element={<ScoreboardPage />} />
          <Route path="/login"      element={user ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/create"     element={user ? <CreateReportPage />  : <Navigate to="/login" replace />} />
          <Route path="/tickets"    element={user ? <TicketsPage />       : <Navigate to="/login" replace />} />
          <Route path="/profile"    element={user ? <ProfilePage />       : <Navigate to="/login" replace />} />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Routes>
      </main>

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
