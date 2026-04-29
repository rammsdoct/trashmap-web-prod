import { useLeaderboard } from "../hooks/useLeaderboard";
import { getRankLabel, getRankColor, getMedal } from "../lib/helpers";
import { DONATE_PAYPAL, DONATE_PHONE } from "../lib/config";
import LoadingScreen from "../components/LoadingScreen";

export default function ScoreboardPage() {
  const { leaderboard, loading } = useLeaderboard();

  if (loading) return <LoadingScreen />;

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

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
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Scoreboard</h1>
        <p className="text-sm text-gray-500 mb-6">
          Ranking de los mejores contribuidores
        </p>

        {leaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="text-4xl">🏆</div>
            <p className="text-gray-600 font-medium">Sin datos aún</p>
            <p className="text-sm text-gray-400">
              Los datos de ranking se actualizarán pronto
            </p>
          </div>
        ) : (
          <>
            {/* Top 3 with special styling */}
            <div className="space-y-2 mb-8">
              {top3.map((user, idx) => (
                <div
                  key={user.email}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    idx === 0
                      ? "bg-yellow-50 border-yellow-300 shadow-lg shadow-yellow-100"
                      : idx === 1
                      ? "bg-gray-50 border-gray-300 shadow-lg shadow-gray-100"
                      : "bg-orange-50 border-orange-300 shadow-lg shadow-orange-100"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl flex-shrink-0">
                      {getMedal(idx)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <p className="font-bold text-gray-900 truncate">
                          {user.displayName}
                        </p>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-semibold text-white flex-shrink-0"
                          style={{ background: getRankColor(user.points) }}
                        >
                          {getRankLabel(user.points)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {user.email}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs">
                        <div>
                          <p className="text-gray-400">Validados</p>
                          <p className="font-bold text-gray-900">
                            {user.validated || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Tickets</p>
                          <p className="font-bold text-gray-900">
                            {user.tickets || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-black text-gray-900">
                        {user.points || 0}
                      </p>
                      <p className="text-xs text-gray-400">pts</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rest of ranking */}
            {rest.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
                  Ranking General
                </h2>

                <div className="space-y-1.5">
                  {rest.map((user, idx) => (
                    <div
                      key={user.email}
                      className="p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                          {idx + 4}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {user.displayName}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-gray-900 text-sm">
                            {user.points || 0}
                          </p>
                          <p className="text-xs text-gray-400">pts</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-xs text-blue-900 leading-relaxed">
                  <span className="font-bold">ℹ️ Cómo funciona:</span> Cada
                  reporte validado suma 10 puntos. Los rangos se otorgan según
                  puntuación total acumulada.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3">
                  Rangos disponibles
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-1 rounded-full text-white font-semibold"
                      style={{ background: getRankColor(500) }}
                    >
                      500+
                    </span>
                    <span className="text-gray-600">Embajador verde</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-1 rounded-full text-white font-semibold"
                      style={{ background: getRankColor(200) }}
                    >
                      100+
                    </span>
                    <span className="text-gray-600">Emisario verde</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-1 rounded-full text-white font-semibold"
                      style={{ background: getRankColor(50) }}
                    >
                      10+
                    </span>
                    <span className="text-gray-600">Soldado verde</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-1 rounded-full text-white font-semibold"
                      style={{ background: getRankColor(5) }}
                    >
                      0+
                    </span>
                    <span className="text-gray-600">Vecino activo</span>
                  </div>
                </div>
              </div>

              {/* Donation CTA */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-green-900 mb-3">
                  💚 Apoya PresaWatch
                </h3>
                <p className="text-xs text-green-800 mb-3 leading-relaxed">
                  PresaWatch es un proyecto de impacto ambiental. Si deseas
                  contribuir económicamente, puedes hacerlo a través de PayPal o
                  WhatsApp.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDonatePayPal}
                    className="flex-1 py-2.5 bg-[#003087] hover:bg-[#001a4d] text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    PayPal
                  </button>
                  <button
                    onClick={handleDonateWhatsApp}
                    className="flex-1 py-2.5 bg-[#25D366] hover:bg-[#1fad50] text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
