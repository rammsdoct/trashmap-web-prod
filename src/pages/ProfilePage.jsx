import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useMyReports } from "../hooks/useMyReports";
import { getRankLabel, getRankColor } from "../lib/helpers";
import { DONATE_PAYPAL, DONATE_PHONE } from "../lib/config";

export default function ProfilePage() {
  const { user, updateDisplayName, handleSignOut } = useAuth();
  const { grouped } = useMyReports();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || "");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState(null);

  const allTickets = Object.values(grouped).flat().length;
  const validatedTickets =
    grouped.validados?.length || 0;
  const totalPoints = validatedTickets * 10;

  const handleSaveName = async () => {
    if (!newName.trim()) {
      setNameError("El nombre no puede estar vacío");
      return;
    }

    if (newName.trim().length > 50) {
      setNameError("El nombre es demasiado largo");
      return;
    }

    setSavingName(true);
    setNameError(null);

    try {
      await updateDisplayName(newName.trim());
      setIsEditingName(false);
    } catch (error) {
      setNameError(error.message || "Error al actualizar el nombre");
    } finally {
      setSavingName(false);
    }
  };

  const handleDonatePayPal = () => {
    window.open(`https://paypal.me/${DONATE_PAYPAL}`, "_blank");
  };

  const handleDonateWhatsApp = () => {
    const phone = String(DONATE_PHONE).replace(/[^0-9+]/g, "");
    const text = "Hola, quiero apoyar a PresaWatch 🌱";
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 overflow-y-auto no-scrollbar">
      <div className="px-4 pt-6 pb-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Perfil</h1>

        {/* User Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-16 h-16 rounded-full border border-gray-200 object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#10B981] flex items-center justify-center text-white text-2xl font-bold">
                {user?.displayName?.[0]?.toUpperCase() ||
                  user?.email?.[0]?.toUpperCase() ||
                  "?"}
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {user?.displayName || "Usuario"}
                </h2>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                  style={{ background: getRankColor(totalPoints) }}
                >
                  {getRankLabel(totalPoints)}
                </span>
              </div>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center">
              <p className="text-2xl font-black text-blue-900">
                {allTickets}
              </p>
              <p className="text-xs text-blue-700 font-semibold mt-1">
                Creados
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center">
              <p className="text-2xl font-black text-green-900">
                {validatedTickets}
              </p>
              <p className="text-xs text-green-700 font-semibold mt-1">
                Validados
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 text-center">
              <p className="text-2xl font-black text-purple-900">
                {totalPoints}
              </p>
              <p className="text-xs text-purple-700 font-semibold mt-1">
                Puntos
              </p>
            </div>
          </div>

          {/* Edit Name Section */}
          {isEditingName ? (
            <div className="border-t border-gray-200 pt-4">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
                Editar nombre
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setNameError(null);
                }}
                placeholder="Tu nombre"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] mb-2"
              />
              {nameError && (
                <p className="text-xs text-red-600 mb-2">{nameError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="flex-1 py-2 bg-[#10B981] hover:bg-[#059669] disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition"
                >
                  {savingName ? "Guardando..." : "Guardar"}
                </button>
                <button
                  onClick={() => {
                    setIsEditingName(false);
                    setNewName(user?.displayName || "");
                    setNameError(null);
                  }}
                  className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="w-full border-t border-gray-200 pt-4 py-2 text-sm font-semibold text-[#10B981] hover:bg-green-50 rounded-lg transition"
            >
              ✏️ Editar nombre
            </button>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-xs text-blue-900 leading-relaxed">
            <span className="font-bold">ℹ️ Cómo ganar puntos:</span> Cada
            reporte que valides suma 10 puntos a tu perfil. Los puntos se
            utilizan para desbloquear rangos y aparecer en el Scoreboard.
          </p>
        </div>

        {/* Donation Section */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-bold text-green-900 mb-3">
            💚 Apoya PresaWatch
          </h3>
          <p className="text-xs text-green-800 mb-3 leading-relaxed">
            PresaWatch es un proyecto sin fines de lucro que utiliza tecnología
            para limpiar nuestras ciudades. Tu aporte nos ayuda a mejorar.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDonatePayPal}
              className="flex-1 py-2.5 bg-[#003087] hover:bg-[#001a4d] text-white text-xs font-semibold rounded-lg transition-colors"
            >
              💳 PayPal
            </button>
            <button
              onClick={handleDonateWhatsApp}
              className="flex-1 py-2.5 bg-[#25D366] hover:bg-[#1fad50] text-white text-xs font-semibold rounded-lg transition-colors"
            >
              💬 WhatsApp
            </button>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="w-full py-3 border-2 border-red-200 hover:bg-red-50 text-red-600 font-semibold rounded-xl transition"
        >
          🚪 Cerrar sesión
        </button>
      </div>
    </div>
  );
}
