import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { signInWithGoogle, signingIn, authError } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F0FFFE] px-4 gap-6">

      {/* Logo / brand */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-6xl">🗑️</div>
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">PresaWatch</h1>
        <p className="text-sm text-[#10B981] font-semibold tracking-wide uppercase">
          Comunidad · La Presa · Mordor
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col gap-5">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-800">Bienvenido</h2>
          <p className="text-sm text-gray-500 mt-1">
            Reporta basura y problemas en tu comunidad.
          </p>
        </div>

        {/* Error */}
        {authError && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 text-center">
            {authError}
          </div>
        )}

        {/* Google Sign-In button */}
        <button
          onClick={signInWithGoogle}
          disabled={signingIn}
          className="flex items-center justify-center gap-3 w-full rounded-xl border border-gray-200 bg-white shadow-sm px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {signingIn ? (
            <>
              <span className="w-5 h-5 border-2 border-gray-300 border-t-[#10B981] rounded-full animate-spin" />
              Conectando...
            </>
          ) : (
            <>
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continuar con Google
            </>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Al continuar aceptas contribuir al cuidado de tu comunidad 🌱
        </p>
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-400">Creada por dankenet.org</p>
    </div>
  );
}
