/** Full-screen loading splash — shown while Firebase resolves auth state */
export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#10B981] gap-4">
      <div className="text-6xl animate-bounce">🗑️</div>
      <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      <p className="text-white/80 text-sm font-medium">Cargando PresaWatch...</p>
    </div>
  );
}
